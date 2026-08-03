import { defineStore } from 'pinia'
import wishlistService from '@/services/wishlistService'

export const useWishlistStore = defineStore('wishlist', {
  state: () => ({
    items: [],
    loading: false
  }),

  getters: {
    isWishlisted: (state) => (movieId) => state.items.some((i) => i.movieId === movieId),
    entryFor: (state) => (movieId) => state.items.find((i) => i.movieId === movieId)
  },

  actions: {
    async fetchForUser(userId) {
      this.loading = true
      try {
        const { data } = await wishlistService.getByUser(userId)
        this.items = data
      } finally {
        this.loading = false
      }
    },

    async toggle(userId, movie) {
      const existing = this.entryFor(movie.id)
      if (existing) {
        await wishlistService.remove(existing.id)
        this.items = this.items.filter((i) => i.id !== existing.id)
        return false
      } else {
        const payload = {
          id: 'w' + Date.now(),
          userId,
          movieId: movie.id,
          title: movie.title,
          poster: movie.poster,
          rating: movie.rating,
          addedAt: new Date().toISOString()
        }
        const { data } = await wishlistService.add(payload)
        this.items.push(data)
        return true
      }
    }
  }
})
