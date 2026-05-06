import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "./csrf";

export async function validateCsrfMiddleware(
  request: NextRequest,
  allowedMethods: string[] = ["POST", "PATCH", "DELETE", "PUT"]
) {
  const method = request.method;

  // Only validate non-GET, non-HEAD requests
  if (!allowedMethods.includes(method)) {
    return true;
  }

  // Skip CSRF validation for API routes that handle webhooks or public endpoints
  const pathname = request.nextUrl.pathname;
  const skipPaths = [
    "/api/stripe/webhook",
    "/api/forms",
    "/api/auth",
    "/api/register",
    "/api/payment-gateways/stripe/callback",
    "/api/payment-gateways/paypal/callback",
  ];

  if (skipPaths.some((path) => pathname.includes(path))) {
    return true;
  }

  const token = request.headers.get("x-csrf-token");
  const isValid = await validateCsrfToken(token);

  if (!isValid) {
    return false;
  }

  return true;
}

export function csrfProtectedRoute(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const isValid = await validateCsrfMiddleware(request);

    if (!isValid) {
      return NextResponse.json(
        { error: "CSRF token validation failed" },
        { status: 403 }
      );
    }

    return handler(request);
  };
}
