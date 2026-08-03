import { defineStore } from 'pinia'
import movieService from '@/services/movieService'

export const useMoviesStore = defineStore('movies', {
  state: () => ({
    all: [],
    loading: false,
    error: null,
    fetched: false
  }),

  getters: {
    nowPlaying: (state) => state.all.filter((m) => m.status === 'now_playing'),
    comingSoon: (state) => state.all.filter((m) => m.status === 'coming_soon'),
    trending: (state) => state.all.filter((m) => m.trending),
    latest: (state) =>
      [...state.all]
        .filter((m) => m.status === 'now_playing')
        .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
        .slice(0, 10),
    topRated: (state) => [...state.all].filter((m) => m.topRated).sort((a, b) => b.rating - a.rating),
    recommended: (state) => [...state.all].sort(() => 0.5 - Math.random()).slice(0, 6),
    byId: (state) => (id) => state.all.find((m) => m.id === id),
    genres: (state) => [...new Set(state.all.flatMap((m) => m.genre))].sort(),
    languages: (state) => [...new Set(state.all.flatMap((m) => m.language))].sort()
  },

  actions: {
    async fetchAll(force = false) {
      if (this.fetched && !force) return
      this.loading = true
      this.error = null
      try {
        const { data } = await movieService.getAll()
        this.all = data
        this.fetched = true
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    async fetchOne(id) {
      const existing = this.byId(id)
      if (existing) return existing
      this.loading = true
      try {
        const { data } = await movieService.getById(id)
        return data
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    search({ query = '', genre = '', language = '' }) {
      return this.all.filter((m) => {
        const matchesQuery = query
          ? m.title.toLowerCase().includes(query.toLowerCase())
          : true
        const matchesGenre = genre ? m.genre.includes(genre) : true
        const matchesLanguage = language ? m.language.includes(language) : true
        return matchesQuery && matchesGenre && matchesLanguage
      })
    },

    // --- Admin CRUD actions ---
    async createMovie(payload) {
      const { data } = await movieService.create(payload)
      this.all.unshift(data)
      return data
    },

    async updateMovie(id, payload) {
      const { data } = await movieService.update(id, payload)
      const idx = this.all.findIndex((m) => m.id === id)
      if (idx !== -1) this.all[idx] = data
      return data
    },

    async deleteMovie(id) {
      await movieService.remove(id)
      this.all = this.all.filter((m) => m.id !== id)
    }
  }
})
