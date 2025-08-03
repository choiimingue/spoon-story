import { NextResponse } from 'next/server'
import { ApiResponse } from '@/app/types'
import { checkRateLimit, getClientIp } from './security'
import { NextRequest } from 'next/server'

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  if (error instanceof ApiError) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message,
      code: error.code
    }, { status: error.statusCode })
  }

  if (error instanceof Error) {
    // Prisma unique constraint error
    if ('code' in error && error.code === 'P2002') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'This record already exists'
      }, { status: 400 })
    }

    // Prisma not found error
    if ('code' in error && error.code === 'P2025') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Record not found'
      }, { status: 404 })
    }
  }

  // Generic error
  return NextResponse.json<ApiResponse>({
    success: false,
    error: 'Internal server error'
  }, { status: 500 })
}

export async function withApiHandler<T = any>(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse<ApiResponse<T>>>
): Promise<NextResponse<ApiResponse<T>>> {
  try {
    // Rate limiting check
    const clientIp = getClientIp(request)
    if (!checkRateLimit(clientIp)) {
      throw new ApiError(429, 'Too many requests. Please try again later.')
    }

    return await handler(request)
  } catch (error) {
    return handleApiError(error) as NextResponse<ApiResponse<T>>
  }
}

// Common validation helpers
export function validateRequiredFields(
  data: Record<string, any>,
  requiredFields: string[]
): void {
  const missingFields = requiredFields.filter(field => !data[field])
  
  if (missingFields.length > 0) {
    throw new ApiError(
      400,
      `Missing required fields: ${missingFields.join(', ')}`
    )
  }
}

export function validateId(id: string | undefined): string {
  if (!id || typeof id !== 'string') {
    throw new ApiError(400, 'Invalid ID parameter')
  }
  return id
}