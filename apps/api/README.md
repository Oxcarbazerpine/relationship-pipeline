# API

## Environment
Copy `.env.example` to `.env` and adjust:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/relationship_pipeline?schema=public"
AUTH_MODE="dev" # or "cognito"
COGNITO_JWKS_URL=""
COGNITO_ISSUER=""
PORT=4000
```

## Local Postgres (Docker, quickest)
```
docker run --name rp-postgres -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=relationship_pipeline -p 5432:5432 -d postgres:16
```
Or use a native install / Postgres.app and create the `relationship_pipeline` database manually.

## Development
```
cd apps/api
npm install
npm run prisma:generate
npm run prisma:migrate   # creates the initial migration
npm run dev
```

In `AUTH_MODE=dev`, pass headers:
```
X-Dev-User-Id: demo-user
X-Dev-Email: demo@example.com
```

## Deployment (planned: Oracle Cloud)
- DB: Oracle Cloud managed Postgres (OCI PostgreSQL) or a self-hosted Postgres on a Compute instance. Set `DATABASE_URL` to the provisioned connection string.
- API: run on OCI Container Instances / Kubernetes Engine (OKE), or a Compute VM with a Node runtime behind a load balancer.
- Auth: AWS Cognito User Pool + social identity providers; set `COGNITO_JWKS_URL` and `COGNITO_ISSUER`. (Cognito is cross-cloud — usable from OCI.)
