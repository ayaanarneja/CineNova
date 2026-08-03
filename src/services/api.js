import axios from 'axios'

// IMPORTANT: don't hardcode "http://localhost:4000" here.
// In many dev setups (Codespaces, Docker, remote VMs, StackBlitz-style
// browser IDEs, etc.) the browser's "localhost" is NOT the same machine
// that json-server runs on, which is the #1 cause of "Network Error" on
// login. Instead we call the same origin the app was loaded from at
// "/api/*", and Vite's dev server proxies that to json-server on
// localhost:4000 (see vite.config.js). This works no matter how the app
// is accessed (direct localhost, port-forwarded URL, container, etc.)
// because it never leaves the page's own origin.
//
// You can still override this explicitly (e.g. for a separately hosted
// json-server) by setting VITE_API_BASE_URL in a .env file.
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // No response at all means the request never reached a server -
    // almost always "the API server isn't running" rather than a bad
    // request. Give a message that actually points at the fix.
    if (!error.response) {
      return Promise.reject(
        new Error(
          'Cannot reach the CineNova server. Make sure json-server is running (npm run server, or npm run dev:full to start both together).'
        )
      )
    }
    const message =
      error?.response?.data?.message ||
      error?.message ||
      'Something went wrong. Please try again.'
    return Promise.reject(new Error(message))
  }
)

export default api
