'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { Episode } from '@/app/types'

export default function EditEpisodePage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [episode, setEpisode] = useState<Episode | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    episodeNumber: 1
  })

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    fetchEpisode()
  }, [user, params.episodeId])

  const fetchEpisode = async () => {
    try {
      const response = await fetch(`/api/episodes/${params.episodeId}`)
      const data = await response.json()
      
      if (data.success) {
        setEpisode(data.data)
        setFormData({
          title: data.data.title,
          description: data.data.description || '',
          episodeNumber: data.data.episodeNumber
        })
        
        // Check ownership through series
        if (data.data.series.creatorId !== user?.id) {
          setError('You are not authorized to edit this episode')
          setTimeout(() => router.push(`/series/${params.id}`), 2000)
        }
      }
    } catch (error) {
      console.error('Error fetching episode:', error)
      setError('Failed to load episode')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSaving(true)

    try {
      const response = await fetch(`/api/episodes/${params.episodeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to update episode')
      }

      router.push(`/series/${params.id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSaving(false)
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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
          <h1 className="text-2xl font-bold mb-6">Edit Episode</h1>
          
          {error && (
            <div className="mb-4 rounded-md bg-red-900/20 border border-red-800 p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                Episode Title
              </label>
              <input
                type="text"
                id="title"
                required
                className="block w-full px-4 py-3 bg-gray-800 border border-gray-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                rows={3}
                className="block w-full px-4 py-3 bg-gray-800 border border-gray-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="episodeNumber" className="block text-sm font-medium text-gray-300 mb-2">
                Episode Number
              </label>
              <input
                type="number"
                id="episodeNumber"
                min="1"
                required
                className="block w-full px-4 py-3 bg-gray-800 border border-gray-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={formData.episodeNumber}
                onChange={(e) => setFormData({ ...formData, episodeNumber: parseInt(e.target.value) })}
              />
            </div>

            <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-400">
                Note: Audio files cannot be changed. To replace the audio, delete this episode and create a new one.
              </p>
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-gray-900 disabled:opacity-50 transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => router.push(`/series/${params.id}`)}
                className="flex-1 flex justify-center py-3 px-4 border border-gray-700 rounded-lg shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-900 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}