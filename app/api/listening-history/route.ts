import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { verifyToken } from '@/app/lib/auth'
import { ApiResponse } from '@/app/types'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid token'
      }, { status: 401 })
    }

    const body = await request.json()
    const { episodeId, progress } = body

    if (!episodeId || progress === undefined) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 })
    }

    // Get episode to check duration
    const episode = await prisma.episode.findUnique({
      where: { id: episodeId }
    })

    if (!episode) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Episode not found'
      }, { status: 404 })
    }

    const completed = progress >= episode.duration - 5 // Consider completed if within 5 seconds of end

    const history = await prisma.listeningHistory.upsert({
      where: {
        userId_episodeId: {
          userId: decoded.userId,
          episodeId
        }
      },
      update: {
        progress,
        completed,
        lastPlayedAt: new Date()
      },
      create: {
        userId: decoded.userId,
        episodeId,
        progress,
        completed
      }
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: history
    })
  } catch (error) {
    console.error('Listening history error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}