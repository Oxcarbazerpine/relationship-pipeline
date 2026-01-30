import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

dotenv.config();

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

async function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
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
}

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

const connectionSchema = z.object({
  name: z.string().min(1),
  stage: z.enum(["INTRO", "COMFORT", "FLIRT", "UPGRADE", "COOLING", "ENDED"]),
  lastInteractionAt: z.string().datetime().optional().nullable(),
  interactionFreq: z.enum(["HIGH", "MEDIUM", "LOW", "NONE"]),
  initiative: z.enum(["SELF", "OTHER", "BALANCED"]),
  emotionQuality: z.enum(["NEUTRAL", "POSITIVE", "VOLATILE", "DRAINING"]),
  investmentBalance: z.enum(["SELF_MORE", "BALANCED", "OTHER_MORE"]),
  offlineStatus: z.enum(["NEVER", "ONCE", "MULTIPLE"]),
  upgradeSignals: z.array(z.enum(["CARE", "INVITE", "TIME_GIVE", "BODY_LANGUAGE", "EMOTIONAL_DEPENDENCE"]))
    .default([]),
  nextAction: z.enum(["KEEP_CHAT", "LIGHT_UPGRADE", "CLEAR_INVITE", "SLOW_DOWN", "OBSERVE", "END"]),
  actionDueAt: z.string().datetime().optional().nullable(),
  decisionReason: z.string().optional().nullable()
});

app.get("/connections", authMiddleware, async (_req, res) => {
  const user = res.locals.user;
  const connections = await prisma.connection.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" }
  });
  res.json(connections);
});

app.post("/connections", authMiddleware, async (req, res) => {
  const user = res.locals.user;
  const data = connectionSchema.parse(req.body);
  const connection = await prisma.connection.create({
    data: {
      ...data,
      lastInteractionAt: data.lastInteractionAt ? new Date(data.lastInteractionAt) : null,
      actionDueAt: data.actionDueAt ? new Date(data.actionDueAt) : null,
      userId: user.id
    }
  });
  res.status(201).json(connection);
});

app.put("/connections/:id", authMiddleware, async (req, res) => {
  const user = res.locals.user;
  const data = connectionSchema.parse(req.body);
  const connection = await prisma.connection.update({
    where: { id: req.params.id, userId: user.id },
    data: {
      ...data,
      lastInteractionAt: data.lastInteractionAt ? new Date(data.lastInteractionAt) : null,
      actionDueAt: data.actionDueAt ? new Date(data.actionDueAt) : null
    }
  });
  res.json(connection);
});

app.delete("/connections/:id", authMiddleware, async (req, res) => {
  const user = res.locals.user;
  await prisma.connection.delete({
    where: { id: req.params.id, userId: user.id }
  });
  res.status(204).send();
});

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
