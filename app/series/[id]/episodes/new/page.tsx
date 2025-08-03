'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'

export default function NewEpisodePage() {
  const { token } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    episodeNumber: '1',
    audioFile: null as File | null
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (!formData.audioFile) {
      setError('Please select an audio file')
      setIsLoading(false)
      return
    }

    try {
      // Get audio duration
      const audioUrl = URL.createObjectURL(formData.audioFile)
      const audio = new Audio(audioUrl)
      
      await new Promise((resolve) => {
        audio.addEventListener('loadedmetadata', resolve)
      })
      
      const duration = Math.floor(audio.duration)
      URL.revokeObjectURL(audioUrl)

      // Upload episode
      const uploadData = new FormData()
      uploadData.append('title', formData.title)
      uploadData.append('description', formData.description)
      uploadData.append('seriesId', params.id as string)
      uploadData.append('episodeNumber', formData.episodeNumber)
      uploadData.append('duration', duration.toString())
      uploadData.append('audio', formData.audioFile)

      const response = await fetch('/api/episodes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadData
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to upload episode')
      }

      router.push(`/series/${params.id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
          <h1 className="text-2xl font-bold mb-6">Add New Episode</h1>
          
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
                onChange={(e) => setFormData({ ...formData, episodeNumber: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="audio" className="block text-sm font-medium text-gray-300 mb-2">
                Audio File
              </label>
              <input
                type="file"
                id="audio"
                accept="audio/*"
                required
                className="block w-full px-4 py-3 bg-gray-800 border border-gray-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-100 file:text-primary-700 hover:file:bg-primary-200"
                onChange={(e) => setFormData({ ...formData, audioFile: e.target.files?.[0] || null })}
              />
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-gray-900 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Uploading...' : 'Upload Episode'}
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