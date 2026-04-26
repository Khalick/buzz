import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Clean middleware for the Admin Portal — no CSP restrictions
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
