import api from './api'

export default {
  getAll(params = {}) {
    return api.get('/movies', { params })
  },
  getById(id) {
    return api.get(`/movies/${id}`)
  },
  getByStatus(status) {
    return api.get('/movies', { params: { status } })
  },
  // --- Admin CRUD ---
  create(payload) {
    return api.post('/movies', payload)
  },
  update(id, payload) {
    return api.patch(`/movies/${id}`, payload)
  },
  remove(id) {
    return api.delete(`/movies/${id}`)
  }
}
