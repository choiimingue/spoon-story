import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { verifyToken } from '@/app/lib/auth'
import { saveFile } from '@/app/lib/upload'
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

    const formData = await request.formData()
    const seriesId = formData.get('seriesId') as string
    const thumbnail = formData.get('thumbnail') as File

    if (!seriesId || !thumbnail) {
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
        error: 'Unauthorized to update this series'
      }, { status: 403 })
    }

    // Save thumbnail
    const thumbnailUrl = await saveFile(thumbnail, 'uploads/thumbnails')

    // Update series with thumbnail URL
    const updatedSeries = await prisma.series.update({
      where: { id: seriesId },
      data: { thumbnail: thumbnailUrl }
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: updatedSeries
    })
  } catch (error) {
    console.error('Thumbnail upload error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}