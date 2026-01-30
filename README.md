# Relationship Pipeline

A cross-platform (Web, iOS, Android) relationship decision system based on the Connection Pipeline schema.

## Architecture
- **Web**: Vite + React (i18n with English/中文/日本語).
- **Mobile**: Expo + React Native (same i18n strings).
- **API**: Express + Prisma. JWT auth via AWS Cognito (recommended) with a local development token fallback.
- **Subscriptions**: 7-day free trial + subscription status tracked in the API. Stripe is recommended for production billing.

## AWS deployment (recommended)
1. **Auth**: AWS Cognito User Pool with social providers (Google/Apple). Export `COGNITO_JWKS_URL` and `COGNITO_ISSUER` to the API.
2. **API**: Deploy `apps/api` to ECS Fargate (or App Runner). Use RDS Postgres.
3. **Web**: Build `apps/web` and host on S3 + CloudFront.
4. **Mobile**: Use Expo EAS build for iOS/Android.

See `apps/api/README.md`, `apps/web/README.md`, and `apps/mobile/README.md` for detailed setup.
