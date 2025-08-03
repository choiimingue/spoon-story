import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { verifyToken } from '@/app/lib/auth'
import { ApiResponse } from '@/app/types'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const series = await prisma.series.findUnique({
      where: { id: params.id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: { episodes: true, likes: true }
        }
      }
    })

    if (!series) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Series not found'
      }, { status: 404 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: series
    })
  } catch (error) {
    console.error('Series fetch error:', error)
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

    // Check ownership
    const series = await prisma.series.findUnique({
      where: { id: params.id }
    })

    if (!series) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Series not found'
      }, { status: 404 })
    }

    if (series.creatorId !== decoded.userId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized to update this series'
      }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, genre, isCompleted } = body

    const updatedSeries = await prisma.series.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(genre && { genre }),
        ...(isCompleted !== undefined && { isCompleted })
      }
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: updatedSeries
    })
  } catch (error) {
    console.error('Series update error:', error)
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

    // Check ownership
    const series = await prisma.series.findUnique({
      where: { id: params.id },
      include: {
        episodes: true
      }
    })

    if (!series) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Series not found'
      }, { status: 404 })
    }

    if (series.creatorId !== decoded.userId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized to delete this series'
      }, { status: 403 })
    }

    // Delete all episodes first (cascade delete)
    await prisma.series.delete({
      where: { id: params.id }
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { message: 'Series deleted successfully' }
    })
  } catch (error) {
    console.error('Series delete error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}