import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { ApiResponse } from '@/app/types'
import { withApiHandler, validateRequiredFields } from '@/app/lib/api-errors'
import { requireAuth } from '@/app/lib/auth-middleware'

export async function POST(request: NextRequest) {
  return withApiHandler(request, async (req) => {
    const { userId } = await requireAuth(req)
    
    const body = await req.json()
    const { title, description, genre, thumbnail } = body
    
    validateRequiredFields(body, ['title', 'description', 'genre'])

    const series = await prisma.series.create({
      data: {
        title,
        description,
        genre,
        thumbnail,
        creatorId: userId
      }
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: series
    })
  })
}

export async function GET(request: NextRequest) {
  return withApiHandler(request, async (req) => {
    const searchParams = req.nextUrl.searchParams
    const creatorId = searchParams.get('creatorId')

    const series = await prisma.series.findMany({
      where: creatorId ? { creatorId } : undefined,
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
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: series
    })
  })
}