import { defineStore } from 'pinia'
import notificationService from '@/services/notificationService'

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    items: [],
    loading: false
  }),

  getters: {
    unreadCount: (state) => state.items.filter((n) => !n.read).length
  },

  actions: {
    async fetchForUser(userId) {
      this.loading = true
      try {
        const { data } = await notificationService.getByUser(userId)
        this.items = data
      } finally {
        this.loading = false
      }
    },

    async markRead(id) {
      await notificationService.markRead(id)
      const item = this.items.find((n) => n.id === id)
      if (item) item.read = true
    },

    markAllRead() {
      this.items.forEach((n) => {
        if (!n.read) {
          n.read = true
          notificationService.markRead(n.id)
        }
      })
    }
  }
})
