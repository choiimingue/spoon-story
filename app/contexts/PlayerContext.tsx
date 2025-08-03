'use client'

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import { Episode, Series } from '@/app/types'

interface PlayerContextType {
  currentEpisode: Episode | null
  currentSeries: Series | null
  isPlaying: boolean
  currentTime: number
  duration: number
  setCurrentEpisode: (episode: Episode | null, series?: Series | null) => void
  setIsPlaying: (playing: boolean) => void
  setCurrentTime: (time: number) => void
  seekTo: (time: number) => void
  setDuration: (duration: number) => void
  togglePlayPause: () => void
  setVolume: (volume: number) => void
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined)

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentEpisode, setCurrentEpisodeState] = useState<Episode | null>(null)
  const [currentSeries, setCurrentSeries] = useState<Series | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio()
    
    // Set up event listeners
    const audio = audioRef.current
    
    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime)
    })
    
    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration)
    })
    
    audio.addEventListener('ended', () => {
      setIsPlaying(false)
    })
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const setCurrentEpisode = (episode: Episode | null, series: Series | null = null) => {
    if (!episode) {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
      setCurrentEpisodeState(null)
      setCurrentSeries(null)
      setIsPlaying(false)
      setCurrentTime(0)
      setDuration(0)
      return
    }

    setCurrentEpisodeState(episode)
    if (series) {
      setCurrentSeries(series)
    }
    
    if (audioRef.current && episode.audioUrl) {
      audioRef.current.src = episode.audioUrl
      audioRef.current.load()
      // Auto-play when a new episode is selected
      audioRef.current.play().then(() => {
        setIsPlaying(true)
      }).catch(error => {
        console.error('Auto-play failed:', error)
      })
    }
  }

  const togglePlayPause = () => {
    if (!audioRef.current || !currentEpisode) return
    
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play()
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying])

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const setVolume = (volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume))
    }
  }

  const value = {
    currentEpisode,
    currentSeries,
    isPlaying,
    currentTime,
    duration,
    setCurrentEpisode,
    setIsPlaying,
    setCurrentTime,
    seekTo,
    setDuration,
    togglePlayPause,
    setVolume
  }

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const context = useContext(PlayerContext)
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider')
  }
  return context
}