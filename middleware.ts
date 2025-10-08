import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSession } from "@/lib/auth/session"

export async function middleware(request: NextRequest) {
  const session = await getSession()
  const { pathname } = request.nextUrl

  // Public routes
  const publicRoutes = ["/", "/login", "/register", "/explorer"]
  const isPublicRoute = publicRoutes.includes(pathname)

  // Admin routes
  const isAdminRoute = pathname.startsWith("/admin")

  // Protected user routes
  const protectedUserRoutes = ["/dashboard", "/mining", "/wallet", "/settings", "/swap", "/kyc", "/referral"]
  const isProtectedUserRoute = protectedUserRoutes.some((route) => pathname.startsWith(route))

  // If not authenticated and trying to access protected route
  if (!session && !isPublicRoute && isProtectedUserRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If authenticated and trying to access login/register
  if (session && (pathname === "/login" || pathname === "/register")) {
    if (session.role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url))
    }
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // If user trying to access admin routes
  if (isAdminRoute && session?.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // If admin trying to access user dashboard
  if (isProtectedUserRoute && session?.role === "admin") {
    return NextResponse.redirect(new URL("/admin", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
