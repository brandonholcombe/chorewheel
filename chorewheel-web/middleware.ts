import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Lightweight auth gate: only checks for the presence of the Auth.js v5 session
// cookie. Real validation (and household membership) happens server-side in
// pages/route handlers via auth()/requireMembership(). Keeping middleware off
// the better-sqlite3 / node:crypto path lets it run on the edge.
const PROTECTED_PREFIXES = ['/app'];
const SESSION_COOKIES = [
  'authjs.session-token',
  '__Secure-authjs.session-token',
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = SESSION_COOKIES.some((n) => req.cookies.get(n));

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (isProtected && !hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = '/api/auth/signin';
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*'],
};
