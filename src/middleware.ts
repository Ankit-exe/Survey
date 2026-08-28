import { NextRequest, NextResponse } from "next/server";

// Middleware is intentionally minimal — route protection is handled
// server-side in layout.tsx via the auth() function from NextAuth v5.
// This avoids Edge runtime limitations with Prisma and JWT cookie parsing.
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
