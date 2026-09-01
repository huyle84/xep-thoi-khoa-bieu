import { auth } from '@/lib/auth';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith('/login') || 
                     req.nextUrl.pathname.startsWith('/register') ||
                     req.nextUrl.pathname.startsWith('/verify-email') ||
                     req.nextUrl.pathname.startsWith('/forgot-password');
  const isApiAuthRoute = req.nextUrl.pathname.startsWith('/api/auth');
  
  if (isApiAuthRoute) return; // Allow auth API routes
  if (isAuthPage) {
    if (isLoggedIn) return Response.redirect(new URL('/', req.nextUrl)); // Already logged in
    return; // Allow auth pages
  }
  if (!isLoggedIn) return Response.redirect(new URL('/login', req.nextUrl));
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
