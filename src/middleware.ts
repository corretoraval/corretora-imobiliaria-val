import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Protect /admin/* routes with middleware. Keep page-level checks as defense in depth.
export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  // Only protect under /admin
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  // Allow the auth signin page (located at /auth/signin)
  if (pathname === "/auth/signin" || pathname.startsWith("/auth"))
    return NextResponse.next();

  // Use next-auth/jwt getToken to read token from cookies
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (token?.role !== "admin") {
    // Redirect to sign-in with callbackUrl back to original path
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set(
      "callbackUrl",
      pathname + (req.nextUrl.search || ""),
    );
    return NextResponse.redirect(signInUrl);
  }

  if (token.mustChangePassword) {
    const changePasswordUrl = new URL("/auth/change-password", req.url);
    changePasswordUrl.searchParams.set(
      "callbackUrl",
      pathname + (req.nextUrl.search || ""),
    );
    return NextResponse.redirect(changePasswordUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
