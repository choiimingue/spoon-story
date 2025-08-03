'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { Series } from '@/app/types'

export default function EditSeriesPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [series, setSeries] = useState<Series | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    isCompleted: false
  })

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    fetchSeries()
  }, [user, params.id])

  const fetchSeries = async () => {
    try {
      const response = await fetch(`/api/series/${params.id}`)
      const data = await response.json()
      
      if (data.success) {
        setSeries(data.data)
        setFormData({
          title: data.data.title,
          description: data.data.description,
          genre: data.data.genre,
          isCompleted: data.data.isCompleted
        })
        
        // Check ownership
        if (data.data.creatorId !== user?.id) {
          setError('You are not authorized to edit this series')
          setTimeout(() => router.push('/dashboard'), 2000)
        }
      }
    } catch (error) {
      console.error('Error fetching series:', error)
      setError('Failed to load series')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSaving(true)

    try {
      const response = await fetch(`/api/series/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to update series')
      }

      router.push(`/series/${params.id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this series? This will also delete all episodes.')) {
      return
    }

    try {
      const response = await fetch(`/api/series/${params.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete series')
      }

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
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
          <h1 className="text-2xl font-bold mb-6">Edit Series</h1>
          
          {error && (
            <div className="mb-4 rounded-md bg-red-900/20 border border-red-800 p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                Series Title
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
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                required
                className="block w-full px-4 py-3 bg-gray-800 border border-gray-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="genre" className="block text-sm font-medium text-gray-300 mb-2">
                Genre
              </label>
              <select
                id="genre"
                required
                className="block w-full px-4 py-3 bg-gray-800 border border-gray-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              >
                <option value="">Select a genre</option>
                <option value="Fiction">Fiction</option>
                <option value="Non-Fiction">Non-Fiction</option>
                <option value="Mystery">Mystery</option>
                <option value="Romance">Romance</option>
                <option value="Thriller">Thriller</option>
                <option value="Fantasy">Fantasy</option>
                <option value="Science Fiction">Science Fiction</option>
                <option value="Horror">Horror</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isCompleted"
                className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-600 bg-gray-800 rounded"
                checked={formData.isCompleted}
                onChange={(e) => setFormData({ ...formData, isCompleted: e.target.checked })}
              />
              <label htmlFor="isCompleted" className="ml-2 block text-sm text-gray-300">
                Mark series as completed
              </label>
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
              <button
                type="button"
                onClick={handleDelete}
                className="flex justify-center py-3 px-4 border border-red-800 rounded-lg shadow-sm text-sm font-medium text-red-400 bg-red-900/20 hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-900 transition-colors"
              >
                Delete Series
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}