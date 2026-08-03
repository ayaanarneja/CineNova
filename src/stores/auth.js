import { defineStore } from 'pinia'
import authService from '@/services/authService'

const STORAGE_USER = 'cinenova_user'
const STORAGE_TOKEN = 'cinenova_token'

function loadUser() {
  try {
    const raw = localStorage.getItem(STORAGE_USER)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: loadUser(),
    token: localStorage.getItem(STORAGE_TOKEN) || null,
    loading: false,
    error: null
  }),

  getters: {
    isLoggedIn: (state) => !!state.token && !!state.user,
    isAdmin: (state) => state.user?.role === 'admin',
    initials: (state) => {
      if (!state.user?.name) return 'U'
      return state.user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    }
  },

  actions: {
    async login({ email, password }) {
      this.loading = true
      this.error = null
      try {
        const { data } = await authService.findByEmail(email)
        const found = data?.[0]
        if (!found) throw new Error('No account found with this email.')
        if (found.password !== password) throw new Error('Incorrect password.')

        const token = btoa(`${found.id}:${Date.now()}`)
        this.user = found
        this.token = token
        localStorage.setItem(STORAGE_USER, JSON.stringify(found))
        localStorage.setItem(STORAGE_TOKEN, token)
        return found
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async register({ name, email, password, phone, city }) {
      this.loading = true
      this.error = null
      try {
        const { data: existing } = await authService.findByEmail(email)
        if (existing?.length) throw new Error('An account with this email already exists.')

        const newUser = {
          id: 'u' + Date.now(),
          name,
          email,
          password,
          phone: phone || '',
          city: city || 'Bengaluru',
          role: 'customer',
          createdAt: new Date().toISOString()
        }
        const { data } = await authService.register(newUser)
        const token = btoa(`${data.id}:${Date.now()}`)
        this.user = data
        this.token = token
        localStorage.setItem(STORAGE_USER, JSON.stringify(data))
        localStorage.setItem(STORAGE_TOKEN, token)
        return data
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateProfile(payload) {
      if (!this.user) return
      const { data } = await authService.updateUser(this.user.id, payload)
      this.user = data
      localStorage.setItem(STORAGE_USER, JSON.stringify(data))
      return data
    },

    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem(STORAGE_USER)
      localStorage.removeItem(STORAGE_TOKEN)
    }
  }
})
