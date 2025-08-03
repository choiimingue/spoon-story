// App configuration
export const APP_NAME = 'Spoon Story'
export const APP_DESCRIPTION = 'Audio streaming platform for creators and listeners'

// API configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
export const API_TIMEOUT = 30000 // 30 seconds

// Auth configuration
export const TOKEN_KEY = 'auth_token'
export const USER_KEY = 'auth_user'
export const TOKEN_EXPIRY_DAYS = 7

// Upload configuration
export const MAX_FILE_SIZE = {
  AUDIO: 100 * 1024 * 1024, // 100MB
  IMAGE: 5 * 1024 * 1024,    // 5MB
}

export const ALLOWED_FILE_TYPES = {
  AUDIO: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'],
  IMAGE: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
}

// Rate limiting
export const RATE_LIMIT = {
  WINDOW_MS: 60 * 1000, // 1 minute
  MAX_REQUESTS: 100,
}

// Pagination
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

// User roles
export const USER_ROLES = {
  LISTENER: 'LISTENER',
  CREATOR: 'CREATOR',
} as const

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  DASHBOARD: '/dashboard',
  SERIES: '/series',
  CREATOR: {
    UPLOAD: '/creator/upload',
  },
} as const

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  UNAUTHORIZED: 'You must be logged in to access this resource.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: {
    REQUIRED_FIELD: 'This field is required.',
    INVALID_EMAIL: 'Please enter a valid email address.',
    WEAK_PASSWORD: 'Password must be at least 8 characters long and contain uppercase, lowercase, and numbers.',
  },
} as const

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Successfully logged in!',
  REGISTER: 'Account created successfully!',
  LOGOUT: 'Successfully logged out.',
  SERIES_CREATED: 'Series created successfully!',
  SERIES_UPDATED: 'Series updated successfully!',
  SERIES_DELETED: 'Series deleted successfully!',
  EPISODE_CREATED: 'Episode created successfully!',
  EPISODE_UPDATED: 'Episode updated successfully!',
  EPISODE_DELETED: 'Episode deleted successfully!',
} as const