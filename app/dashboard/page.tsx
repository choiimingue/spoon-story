'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { Series } from '@/app/types'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [series, setSeries] = useState<Series[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    const fetchSeries = async () => {
      try {
        const url = user?.role === 'CREATOR' 
          ? `/api/series?creatorId=${user.id}`
          : '/api/series'
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        const data = await response.json()
        if (data.success) {
          setSeries(data.data)
        }
      } catch (error) {
        console.error('Error fetching series:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSeries()
  }, [user, token, router])

  if (!user) return null

  return (
    <main className="px-8 py-6">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {user.role === 'CREATOR' ? '내 시리즈' : '모든 시리즈'}
          </h2>
          <button className="text-gray-400 hover:text-white text-sm font-semibold transition-colors">
            모두 보기
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : series.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">
              {user.role === 'CREATOR' 
                ? '아직 생성한 시리즈가 없습니다.' 
                : '이용 가능한 시리즈가 없습니다.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-4">
            {series.map((s) => (
              <Link
                key={s.id}
                href={`/series/${s.id}`}
                className="group cursor-pointer"
              >
                <div className="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-all">
                  <div className="relative aspect-square mb-4 overflow-hidden rounded-md">
                    {s.thumbnail ? (
                      <img
                        src={s.thumbnail}
                        alt={s.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-opacity flex items-center justify-center">
                      <button className="opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all bg-primary-500 text-white p-3 rounded-full hover:bg-primary-600">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-white mb-1 truncate">{s.title}</h3>
                  <p className="text-sm text-gray-400 truncate">
                    {s.creator?.name || 'Unknown'} • {(s as any)._count?.episodes || 0} 에피소드
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}