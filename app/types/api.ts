export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  code?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiErrorResponse {
  success: false
  error: string
  code?: string
}

// Request types
export interface CreateSeriesRequest {
  title: string
  description: string
  genre: string
  thumbnail?: string
}

export interface UpdateSeriesRequest extends Partial<CreateSeriesRequest> {
  isCompleted?: boolean
}

export interface CreateEpisodeRequest {
  title: string
  description?: string
  audioUrl: string
  duration: number
  episodeNumber: number
  seriesId: string
}

export interface UpdateEpisodeRequest extends Partial<CreateEpisodeRequest> {}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  role?: 'LISTENER' | 'CREATOR'
}

// Response types
export interface AuthResponse {
  user: {
    id: string
    email: string
    name: string
    role: 'LISTENER' | 'CREATOR'
  }
  token: string
}