import api from './api'

export default {
  getByUser(userId) {
    return api.get('/wishlist', { params: { userId } })
  },
  add(payload) {
    return api.post('/wishlist', payload)
  },
  remove(id) {
    return api.delete(`/wishlist/${id}`)
  }
}
