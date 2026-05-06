import * as Sentry from "@sentry/nextjs";

export function initSentry() {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    debug: process.env.NODE_ENV === "development",
  });
}

export function captureException(error: Error | string, context?: Record<string, any>) {
  Sentry.captureException(new Error(typeof error === "string" ? error : error.message), {
    tags: context,
  });
}

export function captureMessage(message: string, level: "fatal" | "error" | "warning" | "info" = "error") {
  Sentry.captureMessage(message, level);
}

export { Sentry };
