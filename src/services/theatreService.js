import api from './api'

export default {
  getAll(params = {}) {
    return api.get('/theatres', { params })
  },
  getById(id) {
    return api.get(`/theatres/${id}`)
  }
}
