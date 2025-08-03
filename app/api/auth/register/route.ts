import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { hashPassword, generateToken } from '@/app/lib/auth'
import { validateEmail, validatePassword, sanitizeInput } from '@/app/lib/security'
import { ApiResponse } from '@/app/types'
import { withApiHandler, ApiError, validateRequiredFields } from '@/app/lib/api-errors'

export async function POST(request: NextRequest) {
  return withApiHandler(request, async (req) => {
    const body = await req.json()
    const { email, password, name, role = 'LISTENER' } = body

    // Validate required fields
    validateRequiredFields(body, ['email', 'password', 'name'])

    // Input validation
    if (!validateEmail(email)) {
      throw new ApiError(400, 'Invalid email format')
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      throw new ApiError(400, passwordValidation.message!)
    }

    const sanitizedName = sanitizeInput(name)

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    })

    if (existingUser) {
      throw new ApiError(400, 'User already exists')
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        name: sanitizedName,
        role
      }
    })

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