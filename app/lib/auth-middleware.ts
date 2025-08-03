import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './auth'
import { ApiError } from './api-errors'
import { prisma } from './prisma'
import { User } from '@prisma/client'

export interface AuthenticatedRequest extends NextRequest {
  user?: User
}

export async function requireAuth(
  request: NextRequest
): Promise<{ user: User; userId: string }> {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  
  if (!token) {
    throw new ApiError(401, 'Unauthorized - No token provided')
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    throw new ApiError(401, 'Invalid or expired token')
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId }
  })

  if (!user) {
    throw new ApiError(401, 'User not found')
  }

  return { user, userId: decoded.userId }
}

export async function requireRole(
  request: NextRequest,
  allowedRoles: string[]
): Promise<{ user: User; userId: string }> {
  const { user, userId } = await requireAuth(request)
  
  if (!allowedRoles.includes(user.role)) {
    throw new ApiError(403, 'Insufficient permissions')
  }

  return { user, userId }
}