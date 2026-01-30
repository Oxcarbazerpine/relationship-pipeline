# API

## Environment
```
DATABASE_URL="file:./dev.db"
AUTH_MODE="dev" # or "cognito"
COGNITO_JWKS_URL=""
COGNITO_ISSUER=""
PORT=4000
```

## Development
```
cd apps/api
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

In `AUTH_MODE=dev`, pass headers:
```
X-Dev-User-Id: demo-user
X-Dev-Email: demo@example.com
```

## AWS deployment
- Use RDS Postgres and set `DATABASE_URL` accordingly.
- Configure Cognito User Pool + social identity providers and set `COGNITO_JWKS_URL` + `COGNITO_ISSUER`.
- Deploy via ECS Fargate or App Runner.
