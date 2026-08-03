import api from './api'

export default {
  findByEmail(email) {
    return api.get('/users', { params: { email } })
  },
  register(payload) {
    return api.post('/users', payload)
  },
  updateUser(id, payload) {
    return api.patch(`/users/${id}`, payload)
  }
}
