import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const headers = new Headers(request.headers);

  headers.set('x-current-path', request.nextUrl.pathname);

  return NextResponse.next({ headers });
}

export const config = {
  matcher: '/portfolios/:portfolioId*'
};
