# Relationship Pipeline

A cross-platform (Web, iOS, Android) relationship decision system based on the Connection Pipeline schema.

## Architecture
- **Web**: Vite + React (i18n with English/中文/日本語).
- **Mobile**: Expo + React Native (same i18n strings).
- **API**: Express + Prisma. JWT auth via AWS Cognito (recommended) with a local development token fallback.
- **Subscriptions**: 7-day free trial + subscription status tracked in the API. Stripe is recommended for production billing.

## Deployment (planned: Oracle Cloud)
1. **Auth**: AWS Cognito User Pool with social providers (Google/Apple). Export `COGNITO_JWKS_URL` and `COGNITO_ISSUER` to the API. (Cognito is reachable cross-cloud.)
2. **DB**: Postgres — locally via Docker for development, OCI PostgreSQL (or self-hosted on a Compute VM) for production.
3. **API**: Deploy `apps/api` to OCI Container Instances / OKE, or a Compute VM.
4. **Web**: Build `apps/web` and host on OCI Object Storage + CDN (or any static host).
5. **Mobile**: Use Expo EAS build for iOS/Android.

Local development uses Postgres (see `apps/api/README.md`).

See `apps/api/README.md`, `apps/web/README.md`, and `apps/mobile/README.md` for detailed setup.
