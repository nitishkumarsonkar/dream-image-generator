import type { NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { logInfo, logWarn, logApiRequest } from '@/lib/logger'

export async function middleware(request: NextRequest) {
  const startTime = Date.now()
  const path = request.nextUrl.pathname
  
  // Log API requests
  if (path.startsWith('/api/')) {
    logInfo('API request received', {
      path,
      method: request.method,
      userAgent: request.headers.get('user-agent')?.slice(0, 100),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      referer: request.headers.get('referer')
    })
  }
  
  const response = await updateSession(request)
  const duration = Date.now() - startTime
  
  // Log response details
  if (path.startsWith('/api/')) {
    const statusCode = response?.status || 200
    
    logApiRequest(
      request.method,
      path,
      undefined, // userId not available in middleware
      duration,
      statusCode
    )
    
    // Log slow requests
    if (duration > 3000) {
      logWarn('Slow API request detected', {
        path,
        method: request.method,
        duration,
        statusCode
      })
    }
    
    // Add timing header
    response.headers.set('X-Response-Time', `${duration}ms`)
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
