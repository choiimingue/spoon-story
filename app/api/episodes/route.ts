import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { verifyToken } from '@/app/lib/auth'
import { saveFile } from '@/app/lib/upload'
import { ApiResponse } from '@/app/types'

export const runtime = 'nodejs'
export const maxDuration = 60 // 60 seconds timeout

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

    const formData = await request.formData()
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const seriesId = formData.get('seriesId') as string
    const episodeNumber = parseInt(formData.get('episodeNumber') as string)
    const duration = parseInt(formData.get('duration') as string)
    const audioFile = formData.get('audio') as File

    if (!title || !seriesId || !episodeNumber || !audioFile) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 })
    }

    // Verify series ownership
    const series = await prisma.series.findUnique({
      where: { id: seriesId }
    })

    if (!series || series.creatorId !== decoded.userId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized to add episode to this series'
      }, { status: 403 })
    }

    // Save audio file
    const audioUrl = await saveFile(audioFile, 'uploads/audio')

    const episode = await prisma.episode.create({
      data: {
        title,
        description,
        audioUrl,
        duration,
        episodeNumber,
        seriesId
      }
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: episode
    })
  } catch (error) {
    console.error('Episode creation error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const seriesId = searchParams.get('seriesId')

    if (!seriesId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Series ID required'
      }, { status: 400 })
    }

    const episodes = await prisma.episode.findMany({
      where: { seriesId },
      orderBy: { episodeNumber: 'asc' }
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: episodes
    })
  } catch (error) {
    console.error('Episode fetch error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}