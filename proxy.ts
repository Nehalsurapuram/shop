import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED = ["/account"];

export default function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  if (!PROTECTED.some((p) => path === p || path.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  // Presence check only — no validation, no database call, because this runs
  // on prefetches too. Pages re-check the real session server-side.
  if (!getSessionCookie(req)) {
    const url = new URL("/sign-in", req.nextUrl);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
