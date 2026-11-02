import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'gyaansphere_super_secret_key_2026'
);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/dashboard')) {
    const sessionCookie = req.cookies.get('gs_session');

    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    try {
      // Verify JWT using jose (Edge-compatible)
      const { payload } = await jwtVerify(sessionCookie.value, JWT_SECRET);
      const role = (payload as any).role;

      // Restrict owner routes to library owners
      if (pathname.startsWith('/dashboard/owner') && role !== 'library_owner') {
        return NextResponse.redirect(new URL('/dashboard/staff', req.url));
      }

    } catch (err) {
      console.error('Middleware JWT verification failed:', err);
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};