import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnProtectedRoute = req.nextUrl.pathname.startsWith("/neighborhoods") ||
                             req.nextUrl.pathname.startsWith("/map")
  const isOnAuthPage = req.nextUrl.pathname === "/login" ||
                       req.nextUrl.pathname === "/register"

  if (isOnProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }

  if (isOnAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/neighborhoods", req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/neighborhoods/:path*", "/map/:path*", "/login", "/register"],
}
