import { defineStore } from 'pinia'
import bookingService from '@/services/bookingService'
import foodService from '@/services/foodService'
import offerService from '@/services/offerService'
import { generateSeatMap } from '@/utils/seatLayout'
import { isShowtimePast } from '@/utils/date'

const CONVENIENCE_FEE_RATE = 0.05
const GST_RATE = 0.09

export const useBookingStore = defineStore('booking', {
  state: () => ({
    // selection context
    movie: null,
    theatre: null,
    date: null,
    showtime: null,

    // seats
    seatMap: [],
    selectedSeats: [],

    // food
    foodItems: [],
    selectedFood: {}, // { foodId: qty }

    // offer
    appliedOffer: null,

    // flow
    loading: false,
    error: null,
    lastBooking: null
  }),

  getters: {
    seatSubtotal: (state) => state.selectedSeats.reduce((sum, s) => sum + s.price, 0),

    foodSubtotal: (state) =>
      Object.entries(state.selectedFood).reduce((sum, [foodId, qty]) => {
        const item = state.foodItems.find((f) => f.id === foodId)
        return sum + (item ? item.price * qty : 0)
      }, 0),

    subtotal(state) {
      return this.seatSubtotal + this.foodSubtotal
    },

    discount(state) {
      if (!state.appliedOffer) return 0
      const { discountType, value, maxDiscount, minAmount } = state.appliedOffer
      if (this.subtotal < minAmount) return 0
      let disc = discountType === 'percent' ? (this.subtotal * value) / 100 : value
      return Math.min(disc, maxDiscount)
    },

    convenienceFee() {
      return Math.round(this.seatSubtotal * CONVENIENCE_FEE_RATE)
    },

    gst() {
      return Math.round((this.subtotal - this.discount) * GST_RATE)
    },

    grandTotal() {
      return Math.max(0, Math.round(this.subtotal - this.discount + this.convenienceFee + this.gst))
    },

    foodCartCount: (state) => Object.values(state.selectedFood).reduce((a, b) => a + b, 0)
  },

  actions: {
    setContext({ movie, theatre, date, showtime }) {
      if (isShowtimePast(date, showtime?.time)) {
        throw new Error('This show has already crossed. Please pick another time.')
      }
      this.movie = movie
      this.theatre = theatre
      this.date = date
      this.showtime = showtime
      this.selectedSeats = []
      this.seatMap = generateSeatMap(showtime?.id)
    },

    /** True once the currently selected showtime (if any) has crossed. */
    isSelectedShowExpired() {
      if (!this.date || !this.showtime?.time) return false
      return isShowtimePast(this.date, this.showtime.time)
    },

    toggleSeat(seat) {
      if (seat.status === 'booked') return
      const idx = this.selectedSeats.findIndex((s) => s.id === seat.id)
      if (idx >= 0) {
        this.selectedSeats.splice(idx, 1)
      } else {
        if (this.selectedSeats.length >= 10) return
        this.selectedSeats.push(seat)
      }
    },

    async fetchFood() {
      if (this.foodItems.length) return
      this.loading = true
      try {
        const { data } = await foodService.getAll()
        this.foodItems = data
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    setFoodQty(foodId, qty) {
      if (qty <= 0) {
        delete this.selectedFood[foodId]
      } else {
        this.selectedFood[foodId] = qty
      }
    },

    async applyOfferCode(code) {
      this.error = null
      try {
        const { data } = await offerService.getByCode(code.toUpperCase())
        const offer = data?.[0]
        if (!offer) throw new Error('Invalid or expired offer code.')
        if (this.subtotal < offer.minAmount) {
          throw new Error(`Minimum order of ₹${offer.minAmount} required for this offer.`)
        }
        this.appliedOffer = offer
        return offer
      } catch (err) {
        this.error = err.message
        throw err
      }
    },

    removeOffer() {
      this.appliedOffer = null
    },

    async confirmBooking(userId, paymentMethod) {
      this.loading = true
      this.error = null
      try {
        const foodDetails = Object.entries(this.selectedFood).map(([foodId, qty]) => {
          const item = this.foodItems.find((f) => f.id === foodId)
          return { id: foodId, name: item?.name, price: item?.price, qty }
        })

        const payload = {
          id: 'bk' + Date.now(),
          userId,
          movie: {
            id: this.movie.id,
            title: this.movie.title,
            poster: this.movie.poster,
            duration: this.movie.duration,
            censor: this.movie.censor
          },
          theatre: { id: this.theatre.id, name: this.theatre.name, address: this.theatre.address },
          date: this.date,
          showtime: { id: this.showtime.id, time: this.showtime.time, screen: this.showtime.screen, format: this.showtime.format, language: this.showtime.language },
          seats: this.selectedSeats.map((s) => ({ id: s.id, category: s.category, price: s.price })),
          food: foodDetails,
          offer: this.appliedOffer ? { code: this.appliedOffer.code, discount: this.discount } : null,
          pricing: {
            seatSubtotal: this.seatSubtotal,
            foodSubtotal: this.foodSubtotal,
            discount: this.discount,
            convenienceFee: this.convenienceFee,
            gst: this.gst,
            total: this.grandTotal
          },
          paymentMethod,
          status: 'upcoming',
          bookingTime: new Date().toISOString(),
          qrPayload: `CINENOVA-${Date.now()}`
        }

        const { data } = await bookingService.create(payload)
        this.lastBooking = data
        return data
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    resetFlow() {
      this.selectedSeats = []
      this.selectedFood = {}
      this.appliedOffer = null
    },

    /** Clears the entire booking context (movie/theatre/showtime + cart). */
    resetContext() {
      this.movie = null
      this.theatre = null
      this.date = null
      this.showtime = null
      this.seatMap = []
      this.resetFlow()
    }
  }
})
