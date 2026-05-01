import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const url = request.nextUrl;

  // Extract subdomain (strip port)
  const hostname = host.split(":")[0];
  const parts = hostname.split(".");
  let subdomain = "";

  // localhost scenario: domainshighway.localhost
  if (hostname.endsWith(".localhost")) {
    subdomain = parts[0];
  }
  // Production: sub.domain.com
  else if (parts.length > 2) {
    subdomain = parts[0];
  }

  const requestHeaders = new Headers(request.headers);

  if (subdomain && subdomain !== "www" && subdomain !== "admin") {
    requestHeaders.set("x-tenant-subdomain", subdomain);
  } else if (!subdomain || subdomain === "localhost") {
    requestHeaders.set(
      "x-tenant-subdomain",
      process.env.NEXT_PUBLIC_DEFAULT_TENANT_SUBDOMAIN ?? "domainshighway"
    );
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
