// Optional Sentry error monitoring.
// No-op unless SENTRY_DSN is set, so local dev and tests run without a DSN.
import * as Sentry from "@sentry/node";

let enabled = false;

export function initSentry() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return false;
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: 0.1,
  });
  enabled = true;
  console.log("Sentry monitoring enabled");
  return true;
}

export function captureError(err) {
  if (enabled) Sentry.captureException(err);
}
