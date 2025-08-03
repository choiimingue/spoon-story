import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { verifyToken } from '@/app/lib/auth'
import { ApiResponse } from '@/app/types'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const episode = await prisma.episode.findUnique({
      where: { id: params.id },
      include: {
        series: {
          include: {
            creator: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    if (!episode) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Episode not found'
      }, { status: 404 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: episode
    })
  } catch (error) {
    console.error('Episode fetch error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check ownership through series
    const episode = await prisma.episode.findUnique({
      where: { id: params.id },
      include: {
        series: true
      }
    })

    if (!episode) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Episode not found'
      }, { status: 404 })
    }

    if (episode.series.creatorId !== decoded.userId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized to update this episode'
      }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, episodeNumber } = body

    const updatedEpisode = await prisma.episode.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(episodeNumber && { episodeNumber })
      }
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: updatedEpisode
    })
  } catch (error) {
    console.error('Episode update error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check ownership through series
    const episode = await prisma.episode.findUnique({
      where: { id: params.id },
      include: {
        series: true
      }
    })

    if (!episode) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Episode not found'
      }, { status: 404 })
    }

    if (episode.series.creatorId !== decoded.userId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized to delete this episode'
      }, { status: 403 })
    }

    await prisma.episode.delete({
      where: { id: params.id }
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { message: 'Episode deleted successfully' }
    })
  } catch (error) {
    console.error('Episode delete error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}