import api from './api'

export default {
  getAll() {
    return api.get('/offers')
  },
  getByCode(code) {
    return api.get('/offers', { params: { code } })
  }
}
