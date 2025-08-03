'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { usePlayer } from '@/app/contexts/PlayerContext'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { currentEpisode, currentSeries } = usePlayer()
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false)

  // Listen for custom event from GlobalPlayer
  useEffect(() => {
    const handleTogglePanel = () => {
      setIsRightPanelOpen(prev => !prev)
    }

    window.addEventListener('toggleRightPanel', handleTogglePanel)
    return () => {
      window.removeEventListener('toggleRightPanel', handleTogglePanel)
    }
  }, [])

  // Don't show layout on auth pages
  if (pathname.includes('/auth/')) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${
        currentEpisode && isRightPanelOpen ? 'mr-80' : 'mr-0'
      }`}>
        {/* Top Navigation */}
        <nav className="bg-gray-900 border-b border-gray-800">
          <div className="px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/dashboard" className="text-xl font-semibold text-primary-500">
                  Spoon Story
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-300">Welcome, {user?.name}</span>
                {user?.role === 'CREATOR' && (
                  <Link
                    href="/creator/upload"
                    className="bg-primary-500 text-white px-4 py-2 rounded-md text-sm hover:bg-primary-600 transition-colors"
                  >
                    Create Series
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="text-gray-400 hover:text-gray-200 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="pb-32 relative">
          {children}
          
        </div>
      </div>

      {/* Right Panel - Now Playing */}
      {currentEpisode && (
        <div
          className={`fixed right-0 top-0 h-full w-80 bg-gray-900 border-l border-gray-800 transition-transform duration-300 ${
            isRightPanelOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">지금 재생 중</h2>
              <button
                onClick={() => setIsRightPanelOpen(false)}
                className="p-1 hover:bg-gray-800 rounded transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
              
              {/* Album Art */}
              <div className="w-full aspect-square bg-gray-800 rounded-lg mb-6 overflow-hidden">
                {currentSeries?.thumbnail ? (
                  <img
                    src={currentSeries.thumbnail}
                    alt={currentEpisode.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-20 h-20 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Track Info */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-2">{currentEpisode.title}</h3>
                <p className="text-gray-400">{currentSeries?.title}</p>
              </div>

              {/* Episode Details */}
              {currentEpisode.description && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">에피소드 설명</h4>
                  <p className="text-sm text-gray-400 line-clamp-4">{currentEpisode.description}</p>
                </div>
              )}

              {/* Series Link */}
              {currentSeries && (
                <Link
                  href={`/series/${currentEpisode.seriesId}`}
                  className="block w-full text-center py-3 bg-gray-800 rounded-lg text-white font-medium hover:bg-gray-700 transition-colors"
                >
                  시리즈 보기
                </Link>
              )}
          </div>
        </div>
      )}
    </div>
  )
}