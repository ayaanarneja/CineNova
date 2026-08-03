import { defineStore } from 'pinia'
import bookingService from '@/services/bookingService'
import { deriveBookingStatus, isValidBooking } from '@/utils/bookingStatus'

export const useBookingsStore = defineStore('bookings', {
  state: () => ({
    list: [],
    loading: false,
    error: null
  }),

  getters: {
    // Legacy/malformed records (e.g. seed data from an older schema) are
    // filtered out here so a single bad row can never blank out the whole
    // "My Bookings" page.
    valid: (state) => state.list.filter(isValidBooking),
    upcoming: (state) => state.valid.filter((b) => deriveBookingStatus(b) === 'upcoming'),
    completed: (state) => state.valid.filter((b) => deriveBookingStatus(b) === 'completed'),
    cancelled: (state) => state.valid.filter((b) => deriveBookingStatus(b) === 'cancelled')
  },

  actions: {
    async fetchForUser(userId) {
      this.loading = true
      this.error = null
      try {
        const { data } = await bookingService.getByUser(userId)
        this.list = data.sort((a, b) => new Date(b.bookingTime) - new Date(a.bookingTime))
        // Persist the "show has crossed" transition to the backend in the
        // background so the ticket lifecycle survives a refresh even if
        // another tab/device reads the raw stored status.
        this.syncExpiredStatuses()
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    async syncExpiredStatuses() {
      const stale = this.list.filter(
        (b) => isValidBooking(b) && b.status === 'upcoming' && deriveBookingStatus(b) === 'completed'
      )
      for (const b of stale) {
        try {
          const { data } = await bookingService.update(b.id, { status: 'completed' })
          const idx = this.list.findIndex((x) => x.id === b.id)
          if (idx >= 0) this.list[idx] = data
        } catch {
          // Non-fatal: derived status already renders correctly client-side
          // even if the background sync PATCH fails (e.g. offline).
        }
      }
    },

    async cancelBooking(id) {
      const { data } = await bookingService.update(id, { status: 'cancelled' })
      const idx = this.list.findIndex((b) => b.id === id)
      if (idx >= 0) this.list[idx] = data
      return data
    }
  }
})
