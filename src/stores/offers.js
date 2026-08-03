import { defineStore } from 'pinia'
import offerService from '@/services/offerService'

export const useOffersStore = defineStore('offers', {
  state: () => ({
    all: [],
    loading: false,
    fetched: false
  }),

  actions: {
    async fetchAll(force = false) {
      if (this.fetched && !force) return
      this.loading = true
      try {
        const { data } = await offerService.getAll()
        this.all = data
        this.fetched = true
      } finally {
        this.loading = false
      }
    }
  }
})
