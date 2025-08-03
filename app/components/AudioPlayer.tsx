'use client'

import { useEffect, useRef, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'

interface AudioPlayerProps {
  audioUrl: string
  title: string
  thumbnail?: string
  onProgress?: (progress: number) => void
  onPlayingStateChange?: (isPlaying: boolean) => void
}

export default function AudioPlayer({ audioUrl, title, thumbnail, onProgress, onPlayingStateChange }: AudioPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    if (!containerRef.current) return

    let wavesurfer: WaveSurfer | null = null
    let isDestroyed = false
    const abortController = new AbortController()

    const initWaveSurfer = async () => {
      try {
        // Clear any existing waveform
        if (containerRef.current) {
          containerRef.current.innerHTML = ''
        }
        
        wavesurfer = WaveSurfer.create({
          container: containerRef.current!,
          waveColor: '#9CA3AF',
          progressColor: '#ffffff',
          cursorColor: 'transparent',
          barWidth: 2,
          barRadius: 2,
          height: 48,
          normalize: true,
          backend: 'WebAudio',
          media: new Audio(),
          barGap: 1,
        })

        if (isDestroyed) {
          wavesurfer.empty()
          return
        }

        wavesurfer.load(audioUrl)

        wavesurfer.on('ready', () => {
          if (!isDestroyed) {
            setDuration(wavesurfer!.getDuration())
          }
        })

        wavesurfer.on('audioprocess', () => {
          if (!isDestroyed) {
            setCurrentTime(wavesurfer!.getCurrentTime())
            if (onProgress) {
              onProgress(wavesurfer!.getCurrentTime())
            }
          }
        })

        wavesurfer.on('finish', () => {
          if (!isDestroyed) {
            setIsPlaying(false)
            onPlayingStateChange?.(false)
          }
        })
        
        wavesurfer.on('play', () => {
          if (!isDestroyed) {
            setIsPlaying(true)
            onPlayingStateChange?.(true)
          }
        })
        
        wavesurfer.on('pause', () => {
          if (!isDestroyed) {
            setIsPlaying(false)
            onPlayingStateChange?.(false)
          }
        })

        wavesurferRef.current = wavesurfer
      } catch (error) {
        console.error('Error initializing WaveSurfer:', error)
      }
    }

    initWaveSurfer()

    return () => {
      isDestroyed = true
      
      // Cleanup without calling destroy to avoid AbortError
      if (wavesurferRef.current) {
        try {
          // Try to stop playback first
          if (wavesurferRef.current.isPlaying()) {
            wavesurferRef.current.pause()
          }
          
          // Clear the waveform
          wavesurferRef.current.empty()
        } catch (error) {
          // Ignore errors during cleanup
        }
      }
      
      // Abort and cleanup references
      abortController.abort()
      wavesurferRef.current = null
    }
  }, [audioUrl, onProgress])

  const togglePlayPause = () => {
    if (wavesurferRef.current) {
      try {
        wavesurferRef.current.playPause()
        setIsPlaying(!isPlaying)
      } catch (error) {
        console.error('Error toggling playback:', error)
      }
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-3 z-50">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Left: Track Info */}
          <div className="flex items-center min-w-0 w-80">
            <div className="w-14 h-14 bg-gray-800 rounded flex-shrink-0 mr-3 overflow-hidden">
              {thumbnail ? (
                <img
                  src={thumbnail}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-medium text-white truncate">{title}</h4>
              <p className="text-xs text-gray-400">Podcast</p>
            </div>
          </div>

          {/* Center: Player Controls */}
          <div className="flex flex-col items-center flex-1 max-w-2xl mx-8">
            <div className="flex items-center gap-4 mb-2">
              {/* Previous */}
              <button className="text-gray-400 hover:text-white transition-colors" disabled>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                </svg>
              </button>

              {/* Play/Pause */}
              <button
                onClick={togglePlayPause}
                className="bg-white text-black p-2 rounded-full hover:scale-105 transition-transform"
                aria-label="Play/Pause"
              >
                {isPlaying ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>

              {/* Next */}
              <button className="text-gray-400 hover:text-white transition-colors" disabled>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 6v12h2V6zm-1.5 6L6 6v12z"/>
                </svg>
              </button>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center w-full gap-2">
              <span className="text-xs text-gray-400 w-10 text-right">{formatTime(currentTime)}</span>
              <div className="flex-1 h-12" ref={containerRef} />
              <span className="text-xs text-gray-400 w-10">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right: Additional Controls */}
          <div className="flex items-center gap-2 w-80 justify-end">
            {/* Volume */}
            <button className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}