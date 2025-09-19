
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This middleware is intentionally left simple.
// The redirection logic is now handled client-side by the Protected component
// to avoid race conditions with Firebase auth state initialization.
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
