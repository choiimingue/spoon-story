// Domain models matching Prisma schema
export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export type UserRole = 'LISTENER' | 'CREATOR'

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
  _count?: {
    episodes: number
    likes: number
  }
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

export interface ListeningHistory {
  id: string
  userId: string
  user?: User
  episodeId: string
  episode?: Episode
  position: number
  completed: boolean
  lastPlayedAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface Like {
  id: string
  userId: string
  user?: User
  seriesId: string
  series?: Series
  createdAt: Date
}