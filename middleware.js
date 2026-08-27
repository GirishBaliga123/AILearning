import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const publicPaths = ['/auth/login', '/auth/signup', '/api/auth'];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (isPublicPath && token) return NextResponse.redirect(new URL('/', request.url));
  if (!isPublicPath && !token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|.*\\.png$|.*\\.jpg$).*)'] };
