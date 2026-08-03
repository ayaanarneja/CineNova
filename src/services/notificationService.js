import api from './api'

export default {
  getByUser(userId) {
    return api.get('/notifications', { params: { userId, _sort: 'createdAt', _order: 'desc' } })
  },
  markRead(id) {
    return api.patch(`/notifications/${id}`, { read: true })
  },
  create(payload) {
    return api.post('/notifications', payload)
  }
}
