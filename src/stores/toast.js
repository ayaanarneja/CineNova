import { defineStore } from 'pinia'

let idCounter = 0

export const useToastStore = defineStore('toast', {
  state: () => ({
    toasts: []
  }),
  actions: {
    push(message, color = 'primary', timeout = 3000) {
      const id = ++idCounter
      this.toasts.push({ id, message, color, timeout })
      setTimeout(() => this.dismiss(id), timeout)
    },
    success(message) { this.push(message, 'success') },
    error(message) { this.push(message, 'error') },
    info(message) { this.push(message, 'info') },
    warning(message) { this.push(message, 'warning') },
    dismiss(id) {
      this.toasts = this.toasts.filter(t => t.id !== id)
    }
  }
})
