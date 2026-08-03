import api from './api'

export default {
  getAll(params = {}) {
    return api.get('/showtimes', { params })
  },
  getByMovie(movieId) {
    return api.get('/showtimes', { params: { movieId } })
  },
  getById(id) {
    return api.get(`/showtimes/${id}`)
  }
}
