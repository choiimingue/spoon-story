'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { usePlayer } from '@/app/contexts/PlayerContext'
import { Series, Episode } from '@/app/types'
import Link from 'next/link'

export default function SeriesDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, token } = useAuth()
  const { currentEpisode, isPlaying, setCurrentEpisode, togglePlayPause } = usePlayer()
  const [series, setSeries] = useState<Series | null>(null)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSeriesDetails = async () => {
      try {
        const response = await fetch(`/api/series/${params.id}`)
        const data = await response.json()
        if (data.success) {
          setSeries(data.data)
        }
      } catch (error) {
        console.error('Error fetching series:', error)
      }
    }

    const fetchEpisodes = async () => {
      try {
        const response = await fetch(`/api/episodes?seriesId=${params.id}`)
        const data = await response.json()
        if (data.success) {
          setEpisodes(data.data)
        }
      } catch (error) {
        console.error('Error fetching episodes:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSeriesDetails()
    fetchEpisodes()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  const handleEpisodeSelect = (episode: Episode) => {
    if (currentEpisode?.id === episode.id && isPlaying) {
      // Only pause if currently playing
      togglePlayPause()
    } else {
      // Select new episode (will auto-play)
      setCurrentEpisode(episode, series)
    }
  }

  const handleEditEpisode = (episodeId: string) => {
    router.push(`/series/${params.id}/episodes/${episodeId}/edit`)
  }

  const handleDeleteEpisode = async (episodeId: string) => {
    if (!confirm('Are you sure you want to delete this episode?')) {
      return
    }

    try {
      const response = await fetch(`/api/episodes/${episodeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        // Refresh episodes list
        const updatedEpisodes = episodes.filter(ep => ep.id !== episodeId)
        setEpisodes(updatedEpisodes)
        
        // If deleted episode was playing, clear it
        if (currentEpisode?.id === episodeId) {
          setCurrentEpisode(null)
        }
      } else {
        alert(data.error || 'Failed to delete episode')
      }
    } catch (error) {
      console.error('Error deleting episode:', error)
      alert('Failed to delete episode')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="px-8 py-6">
      <div>
        {/* Series Header */}
        {series && (
          <div className="mb-8">
            <div className="flex items-start gap-6">
              {series.thumbnail && (
                <img
                  src={series.thumbnail}
                  alt={series.title}
                  className="w-48 h-48 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{series.title}</h1>
                <p className="text-gray-400 mb-4">{series.description}</p>
                <div className="flex gap-4 text-sm">
                  <span className="text-primary-400">{series.genre}</span>
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-500">{episodes.length} Episodes</span>
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-500">Original Content by {series.creator?.name || 'Unknown'}</span>
                </div>
                {user?.id === series?.creatorId && (
                  <div className="flex gap-2 mt-4">
                    <Link
                      href={`/series/${params.id}/edit`}
                      className="bg-gray-800 text-gray-100 px-4 py-2 rounded-md text-sm hover:bg-gray-700 border border-gray-700"
                    >
                      Edit Series
                    </Link>
                    <Link
                      href={`/series/${params.id}/episodes/new`}
                      className="bg-primary-500 text-white px-4 py-2 rounded-md text-sm hover:bg-primary-600"
                    >
                      Add Episode
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Episodes List */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Episodes</h2>
          <div className="space-y-4">
            {episodes.map((episode) => (
              <div
                key={episode.id}
                className="bg-gray-900 rounded-lg border border-gray-800 p-6 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Episode Thumbnail */}
                    <div className="w-32 h-32 bg-gray-800 rounded-lg flex-shrink-0 overflow-hidden">
                      {series?.thumbnail ? (
                        <img
                          src={series.thumbnail}
                          alt={episode.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-12 h-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Episode Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">
                        {episode.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-2">{series?.title}</p>
                      {episode.description && (
                        <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                          {episode.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{new Date(episode.createdAt || '').toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        <span>•</span>
                        <span>{episode.duration ? `${Math.floor(episode.duration / 60)}분 ${episode.duration % 60}초` : '길이 정보 없음'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    {user?.id === series?.creatorId && (
                      <>
                        <button
                          onClick={() => handleEditEpisode(episode.id)}
                          className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteEpisode(episode.id)}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleEpisodeSelect(episode)}
                      className={`p-3 rounded-full transition-all ${
                        currentEpisode?.id === episode.id && isPlaying
                          ? 'bg-white text-black'
                          : 'bg-white text-black hover:scale-105'
                      }`}
                    >
                      {currentEpisode?.id === episode.id && isPlaying ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                        </svg>
                      ) : (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}