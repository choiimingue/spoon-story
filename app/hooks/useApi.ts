import { useState, useCallback } from 'react'
import { AxiosError } from 'axios'
import { ApiErrorResponse } from '@/app/types'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>
  reset: () => void
}

export function useApi<T = any>(
  apiFunction: (...args: any[]) => Promise<{ data?: T }>
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setState({ data: null, loading: true, error: null })

      try {
        const response = await apiFunction(...args)
        const data = response.data || null
        setState({ data, loading: false, error: null })
        return data
      } catch (error) {
        let errorMessage = 'An error occurred'
        
        if (error instanceof AxiosError && error.response?.data) {
          const apiError = error.response.data as ApiErrorResponse
          errorMessage = apiError.error || errorMessage
        } else if (error instanceof Error) {
          errorMessage = error.message
        }

        setState({ data: null, loading: false, error: errorMessage })
        return null
      }
    },
    [apiFunction]
  )

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  return {
    ...state,
    execute,
    reset,
  }
}