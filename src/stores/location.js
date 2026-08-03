import { defineStore } from 'pinia'

const STORAGE_KEY = 'cinenova:selected-city'

export const useLocationStore = defineStore('location', {
  state: () => ({
    selectedCity: localStorage.getItem(STORAGE_KEY) || null
  }),

  actions: {
    setCity(city) {
      this.selectedCity = city
      if (city) {
        localStorage.setItem(STORAGE_KEY, city)
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    },

    // Picks a sensible default the first time the app loads and no city
    // has been chosen yet (e.g. the first city that has theatres).
    ensureDefault(cities) {
      if (!this.selectedCity && cities.length) {
        this.setCity(cities[0])
      }
    }
  }
})
