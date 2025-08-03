import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { hashPassword, generateToken } from '@/app/lib/auth'
import { validateEmail, validatePassword, sanitizeInput, checkRateLimit, getClientIp } from '@/app/lib/security'
import { ApiResponse } from '@/app/types'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = getClientIp(request)
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Too many requests. Please try again later.'
      }, { status: 429 })
    }

    const body = await request.json()
    const { email, password, name, role = 'LISTENER' } = body

    if (!email || !password || !name) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 })
    }

    // Input validation
    if (!validateEmail(email)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid email format'
      }, { status: 400 })
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: passwordValidation.message
      }, { status: 400 })
    }

    const sanitizedName = sanitizeInput(name)

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User already exists'
      }, { status: 400 })
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
  } catch (error: any) {
    // Handle duplicate email error
    if (error.code === 'P2002') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Email already exists'
      }, { status: 400 })
    }
    
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Registration failed'
    }, { status: 500 })
  }
}