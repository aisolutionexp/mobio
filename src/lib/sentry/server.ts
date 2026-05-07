import * as Sentry from "@sentry/nextjs";

export function initSentryServer() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    debug: false,
  });
}
