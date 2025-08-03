import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios'
import { API_BASE_URL, API_TIMEOUT, TOKEN_KEY } from './constants'
import { ApiResponse, ApiErrorResponse } from '@/app/types'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiErrorResponse>) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.clearAuth()
          window.location.href = '/auth/login'
        }
        return Promise.reject(error)
      }
    )
  }

  // Auth methods
  getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(TOKEN_KEY)
  }

  setToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(TOKEN_KEY, token)
  }

  clearAuth(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem('auth_user')
  }

  // Generic request methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, config)
    return response.data
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config)
    return response.data
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config)
    return response.data
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config)
    return response.data
  }

  // File upload
  async uploadFile(url: string, formData: FormData, onProgress?: (progress: number) => void): Promise<ApiResponse> {
    return this.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Export typed API methods
export const api = {
  // Auth
  auth: {
    login: (data: { email: string; password: string }) => 
      apiClient.post('/api/auth/login', data),
    
    register: (data: { email: string; password: string; name: string; role?: string }) =>
      apiClient.post('/api/auth/register', data),
  },

  // Series
  series: {
    list: (params?: { creatorId?: string }) =>
      apiClient.get('/api/series', { params }),
    
    get: (id: string) =>
      apiClient.get(`/api/series/${id}`),
    
    create: (data: { title: string; description: string; genre: string; thumbnail?: string }) =>
      apiClient.post('/api/series', data),
    
    update: (id: string, data: any) =>
      apiClient.put(`/api/series/${id}`, data),
    
    delete: (id: string) =>
      apiClient.delete(`/api/series/${id}`),
  },

  // Episodes
  episodes: {
    list: (params?: { seriesId?: string }) =>
      apiClient.get('/api/episodes', { params }),
    
    get: (id: string) =>
      apiClient.get(`/api/episodes/${id}`),
    
    create: (data: any) =>
      apiClient.post('/api/episodes', data),
    
    update: (id: string, data: any) =>
      apiClient.put(`/api/episodes/${id}`, data),
    
    delete: (id: string) =>
      apiClient.delete(`/api/episodes/${id}`),
  },

  // Upload
  upload: {
    thumbnail: (file: File, onProgress?: (progress: number) => void) => {
      const formData = new FormData()
      formData.append('file', file)
      return apiClient.uploadFile('/api/upload/thumbnail', formData, onProgress)
    },
  },

  // Listening history
  listeningHistory: {
    update: (data: { episodeId: string; position: number; completed: boolean }) =>
      apiClient.post('/api/listening-history', data),
  },
}