import api from './api'

export default {
  getAll(params = {}) {
    return api.get('/bookings', { params })
  },
  getByUser(userId) {
    return api.get('/bookings', { params: { userId } })
  },
  getById(id) {
    return api.get(`/bookings/${id}`)
  },
  create(payload) {
    return api.post('/bookings', payload)
  },
  update(id, payload) {
    return api.patch(`/bookings/${id}`, payload)
  }
}
