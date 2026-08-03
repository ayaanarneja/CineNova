import { defineStore } from 'pinia'
import theatreService from '@/services/theatreService'
import showtimeService from '@/services/showtimeService'
import { isShowtimePast } from '@/utils/date'

export const useTheatresStore = defineStore('theatres', {
  state: () => ({
    all: [],
    showtimes: [],
    loading: false,
    error: null,
    fetched: false
  }),

  getters: {
    byId: (state) => (id) => state.all.find((t) => t.id === id),
    cities: (state) => [...new Set(state.all.map((t) => t.city))].sort(),
    byCity: (state) => (city) => city ? state.all.filter((t) => t.city === city) : state.all,
  },

  actions: {
    async fetchAll(force = false) {
      if (this.fetched && !force) return
      this.loading = true
      try {
        const { data } = await theatreService.getAll()
        this.all = data
        this.fetched = true
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    async fetchShowtimesForMovie(movieId, city = null) {
      this.loading = true
      try {
        const { data } = await showtimeService.getByMovie(movieId)
        // Filter by city if provided
        if (city) {
          const cityTheatreIds = new Set(this.all.filter(t => t.city === city).map(t => t.id))
          this.showtimes = data.filter(s => cityTheatreIds.has(s.theatreId))
        } else {
          this.showtimes = data
        }
        return this.showtimes
      } catch (err) {
        this.error = err.message
        return []
      } finally {
        this.loading = false
      }
    },

    theatresForMovie(movieId, city = null) {
      const theatreIds = [...new Set(this.showtimes.filter((s) => s.movieId === movieId).map((s) => s.theatreId))]
      let result = this.all.filter((t) => theatreIds.includes(t.id))
      if (city) result = result.filter(t => t.city === city)
      return result
    },

    showtimesFor(movieId, theatreId, date) {
      return this.showtimes
        .filter((s) => s.movieId === movieId && s.theatreId === theatreId && s.date === date)
        .map((s) => ({ ...s, expired: isShowtimePast(s.date, s.time) }))
        .sort((a, b) => (a.expired === b.expired ? 0 : a.expired ? 1 : -1))
    }
  }
})
