import { defineStore } from 'pinia'

const STORAGE_KEY = 'cinenova-theme'

function getPreferredMode() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'light' || saved === 'dark') return saved
  const prefersLight = window.matchMedia?.('(prefers-color-scheme: light)').matches
  return prefersLight ? 'light' : 'dark'
}

export const useThemeStore = defineStore('theme', {
  state: () => ({
    mode: 'dark'
  }),

  getters: {
    isLight: (state) => state.mode === 'light',
    vuetifyThemeName: (state) => (state.mode === 'light' ? 'cineNovaLight' : 'cineNovaDark')
  },

  actions: {
    init() {
      this.mode = getPreferredMode()
      this.applyToDom()
    },
    setMode(mode) {
      this.mode = mode
      localStorage.setItem(STORAGE_KEY, mode)
      this.applyToDom()
    },
    toggle() {
      this.setMode(this.mode === 'light' ? 'dark' : 'light')
    },
    applyToDom() {
      document.documentElement.setAttribute('data-theme', this.mode)
    }
  }
})
