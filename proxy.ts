import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: any) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const publicPaths = ["/login", "/register"];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // 1. If not logged in and not on public pages, redirect to login
  if (!token) {
    if (isPublicPath) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 2. If logged in, handle role-based redirection
  const role = token.role;

  // Admin-only paths
  const adminPaths = ["/orders", "/products", "/customers"];
  const isAdminPath = adminPaths.some(p => pathname.startsWith(p)) || pathname === "/";

  // Customer-only paths
  const customerPaths = ["/shop", "/cart", "/my-orders"];
  const isCustomerPath = customerPaths.some(p => pathname.startsWith(p));

  // If customer tries to access admin pages
  if (role === "customer" && isAdminPath) {
    return NextResponse.redirect(new URL("/shop", req.url));
  }

  // If admin tries to access customer pages
  if (role === "admin" && isCustomerPath) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // If logged in and trying to access login/register, redirect to their home
  if (isPublicPath) {
    return NextResponse.redirect(new URL(role === "admin" ? "/" : "/shop", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
