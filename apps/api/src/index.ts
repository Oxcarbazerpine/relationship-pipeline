import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { decide, type DecisionInput } from "./decision.js";
import { createAdvisor, type AdvisorKind } from "./advisor.js";
import { connectionSchema, createConnectionsRouter } from "./routes/connections.js";
import { createChannelsRouter } from "./routes/channels.js";

dotenv.config({ override: true });

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

const authMode = process.env.AUTH_MODE ?? "cognito";
const jwksUrl = process.env.COGNITO_JWKS_URL ?? "";
const issuer = process.env.COGNITO_ISSUER ?? "";
const jwks = jwksUrl ? createRemoteJWKSet(new URL(jwksUrl)) : null;

const userSchema = z.object({
  sub: z.string(),
  email: z.string().email().optional(),
  name: z.string().optional()
});

type AuthUser = z.infer<typeof userSchema>;

async function getOrCreateUser(authUser: AuthUser) {
  const existing = await prisma.user.findFirst({
    where: { email: authUser.email ?? undefined }
  });
  if (existing) return existing;
  return prisma.user.create({
    data: {
      email: authUser.email,
      displayName: authUser.name,
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });
}

const authMiddleware: express.RequestHandler = async (req, res, next) => {
  try {
    if (authMode === "dev") {
      const devUserId = req.header("x-dev-user-id") ?? "dev-user";
      const devEmail = req.header("x-dev-email") ?? "dev@example.com";
      const user = await getOrCreateUser({ sub: devUserId, email: devEmail });
      res.locals.user = user;
      next();
      return;
    }

    const authHeader = req.header("authorization");
    if (!authHeader) {
      res.status(401).json({ error: "Missing authorization header" });
      return;
    }

    if (!jwks || !issuer) {
      res.status(500).json({ error: "Cognito config missing" });
      return;
    }

    const token = authHeader.replace("Bearer ", "");
    const { payload } = await jwtVerify(token, jwks, { issuer });
    const authUser = userSchema.parse({
      sub: payload.sub,
      email: payload.email,
      name: payload.name
    });
    const user = await getOrCreateUser(authUser);
    res.locals.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
};

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/me", authMiddleware, (req, res) => {
  const user = res.locals.user;
  res.json({
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    locale: user.locale,
    trialEndsAt: user.trialEndsAt,
    subscriptionId: user.subscriptionId
  });
});

const decideSchema = connectionSchema.pick({
  stage: true,
  interactionFreq: true,
  initiative: true,
  emotionQuality: true,
  investmentBalance: true,
  offlineStatus: true,
  upgradeSignals: true
});

app.post("/decide", authMiddleware, (req, res) => {
  const input = decideSchema.parse(req.body);
  res.json(decide(input as DecisionInput));
});

app.post("/advisor/test", authMiddleware, async (req, res) => {
  const kind = z.enum(["RULES", "AI"]).parse(req.body?.kind ?? "AI");
  try {
    const advisor = createAdvisor(kind as AdvisorKind);
    const result = await advisor.healthCheck();
    if (result.ok) res.json({ ok: true, kind });
    else res.status(502).json({ ok: false, kind, error: result.error });
  } catch (e) {
    res.status(500).json({ ok: false, kind, error: (e as Error).message });
  }
});

app.use("/channels", createChannelsRouter(prisma, authMiddleware));
app.use("/connections", createConnectionsRouter(prisma, authMiddleware));

app.post("/billing/subscribe", authMiddleware, async (_req, res) => {
  res.json({
    message: "Attach Stripe subscription here.",
    trial: "7-day"
  });
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on ${port}`);
});
