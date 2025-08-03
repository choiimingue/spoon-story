import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from './contexts/AuthContext'
import { PlayerProvider } from './contexts/PlayerContext'
import GlobalPlayer from './components/GlobalPlayer'
import MainLayout from './components/MainLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Spoon Story',
  description: 'Audio series streaming platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AuthProvider>
          <PlayerProvider>
            <MainLayout>
              {children}
            </MainLayout>
            <GlobalPlayer />
          </PlayerProvider>
        </AuthProvider>
      </body>
    </html>
  )
}