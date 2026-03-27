// api.ts
import axios from 'axios'

export const api = axios.create({
  baseURL: 'https://ecors-ecom-backend.vercel.app/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - FIXED
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.error('Unauthorized - Redirecting to login')
          // Clear localStorage
          localStorage.removeItem('adminToken')
          localStorage.removeItem('adminUser')
          // Redirect to login if not already there
          if (window.location.pathname !== '/admin/login') {
            window.location.href = '/admin/login'
          }
          break
        case 404:
          console.error('Resource not found')
          break
        case 500:
          console.error('Server error')
          break
        default:
          console.error('An error occurred')
      }
    }
    return Promise.reject(error)
  }
)

export default api