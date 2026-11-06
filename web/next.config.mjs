import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {};

// Sentry wrapper is a no-op at runtime unless a DSN is configured.
// Source-map upload only happens when SENTRY_AUTH_TOKEN + org/project are set.
export default withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
});
