import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { comparePassword, generateToken } from '@/app/lib/auth'
import { ApiResponse } from '@/app/types'
import { withApiHandler, ApiError, validateRequiredFields } from '@/app/lib/api-errors'

export async function POST(request: NextRequest) {
  return withApiHandler(request, async (req) => {
    const body = await req.json()
    const { email, password } = body

    validateRequiredFields(body, ['email', 'password'])

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    })

    if (!user || !(await comparePassword(password, user.password))) {
      throw new ApiError(401, 'Invalid credentials')
    }

    const token = generateToken(user.id)

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      }
    })
  })
}