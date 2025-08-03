export interface User {
  id: string
  email: string
  name: string
  role: 'LISTENER' | 'CREATOR'
  createdAt: Date
  updatedAt: Date
}

export interface Series {
  id: string
  title: string
  description: string
  thumbnail: string | null
  creatorId: string
  creator?: User
  episodes?: Episode[]
  genre: string
  isCompleted: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Episode {
  id: string
  title: string
  description: string | null
  audioUrl: string
  duration: number
  episodeNumber: number
  seriesId: string
  series?: Series
  createdAt: Date
  updatedAt: Date
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}