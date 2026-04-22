import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { decide, type DecisionInput } from "./decision.js";
import { createAdvisor, type AdvisorKind } from "./advisor.js";

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

const nextActionEnum = z.enum(["KEEP_CHAT", "LIGHT_UPGRADE", "CLEAR_INVITE", "SLOW_DOWN", "OBSERVE", "END"]);

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
  overrideAction: nextActionEnum.nullable().optional(),
  overrideReason: z.string().nullable().optional(),
  actionDueAt: z.string().datetime().optional().nullable(),
  notes: z.string().nullable().optional(),
  advisor: z.enum(["RULES", "AI"]).optional().default("RULES")
});

type ConnectionRow = {
  suggestedAction: string;
  suggestedReason: string;
  overrideAction: string | null;
  overrideReason: string | null;
} & Record<string, unknown>;

function withDerivedAction<T extends ConnectionRow>(row: T) {
  return {
    ...row,
    nextAction: row.overrideAction ?? row.suggestedAction,
    isOverridden: row.overrideAction !== null && row.overrideAction !== undefined
  };
}

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

app.get("/connections", authMiddleware, async (_req, res) => {
  const user = res.locals.user;
  const connections = await prisma.connection.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" }
  });
  res.json(connections.map(withDerivedAction));
});

async function runAdvisor(input: DecisionInput, kind: AdvisorKind) {
  try {
    const advisor = createAdvisor(kind);
    return await advisor.advise(input);
  } catch (e) {
    if (kind === "AI") {
      const fallback = await createAdvisor("RULES").advise(input);
      return { ...fallback, advisorReason: `AI failed, used rules: ${(e as Error).message}` };
    }
    throw e;
  }
}

app.post("/connections", authMiddleware, async (req, res) => {
  const user = res.locals.user;
  const data = connectionSchema.parse(req.body);
  const result = await runAdvisor(data as DecisionInput, data.advisor);
  const connection = await prisma.connection.create({
    data: {
      ...data,
      suggestedAction: result.nextAction,
      suggestedReason: result.reasonCode,
      overrideAction: data.overrideAction ?? null,
      overrideReason: data.overrideReason ?? null,
      notes: data.notes ?? null,
      advisor: result.advisor,
      advisorReason: result.advisorReason,
      priorityScore: result.priorityScore,
      priorityAdvice: result.priorityAdvice,
      lastInteractionAt: data.lastInteractionAt ? new Date(data.lastInteractionAt) : null,
      actionDueAt: data.actionDueAt ? new Date(data.actionDueAt) : null,
      userId: user.id
    }
  });
  res.status(201).json(withDerivedAction(connection));
});

app.put("/connections/:id", authMiddleware, async (req, res) => {
  const user = res.locals.user;
  const data = connectionSchema.parse(req.body);
  const result = await runAdvisor(data as DecisionInput, data.advisor);
  const connection = await prisma.connection.update({
    where: { id: req.params.id, userId: user.id },
    data: {
      ...data,
      suggestedAction: result.nextAction,
      suggestedReason: result.reasonCode,
      overrideAction: data.overrideAction ?? null,
      overrideReason: data.overrideReason ?? null,
      notes: data.notes ?? null,
      advisor: result.advisor,
      advisorReason: result.advisorReason,
      priorityScore: result.priorityScore,
      priorityAdvice: result.priorityAdvice,
      lastInteractionAt: data.lastInteractionAt ? new Date(data.lastInteractionAt) : null,
      actionDueAt: data.actionDueAt ? new Date(data.actionDueAt) : null
    }
  });
  res.json(withDerivedAction(connection));
});

const partialConnectionSchema = connectionSchema.partial();
const decisionRelevantFields = [
  "stage",
  "interactionFreq",
  "initiative",
  "emotionQuality",
  "investmentBalance",
  "offlineStatus",
  "upgradeSignals"
] as const;

app.patch("/connections/:id", authMiddleware, async (req, res) => {
  const user = res.locals.user;
  const patch = partialConnectionSchema.parse(req.body);
  const existing = await prisma.connection.findFirst({
    where: { id: req.params.id, userId: user.id }
  });
  if (!existing) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const updateData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;
    if (key === "lastInteractionAt" || key === "actionDueAt") {
      updateData[key] = value ? new Date(value as string) : null;
    } else {
      updateData[key] = value;
    }
  }

  const touchesDecision = decisionRelevantFields.some((f) => f in patch && patch[f] !== undefined);
  if (touchesDecision) {
    const merged = { ...existing, ...patch } as unknown as Record<string, unknown>;
    const decisionInput: DecisionInput = {
      stage: merged.stage as DecisionInput["stage"],
      interactionFreq: merged.interactionFreq as DecisionInput["interactionFreq"],
      initiative: merged.initiative as DecisionInput["initiative"],
      emotionQuality: merged.emotionQuality as DecisionInput["emotionQuality"],
      investmentBalance: merged.investmentBalance as DecisionInput["investmentBalance"],
      offlineStatus: merged.offlineStatus as DecisionInput["offlineStatus"],
      upgradeSignals: (merged.upgradeSignals ?? []) as DecisionInput["upgradeSignals"]
    };
    const advisorKind = (patch.advisor ?? existing.advisor) as AdvisorKind;
    const result = await runAdvisor(decisionInput, advisorKind);
    updateData.suggestedAction = result.nextAction;
    updateData.suggestedReason = result.reasonCode;
    updateData.advisor = result.advisor;
    updateData.advisorReason = result.advisorReason;
    updateData.priorityScore = result.priorityScore;
    updateData.priorityAdvice = result.priorityAdvice;
  }

  const connection = await prisma.connection.update({
    where: { id: existing.id },
    data: updateData
  });
  res.json(withDerivedAction(connection));
});

const stageSchema = z.object({
  stage: z.enum(["INTRO", "COMFORT", "FLIRT", "UPGRADE", "COOLING", "ENDED"])
});

app.patch("/connections/:id/stage", authMiddleware, async (req, res) => {
  const user = res.locals.user;
  const { stage } = stageSchema.parse(req.body);
  const existing = await prisma.connection.findFirst({
    where: { id: req.params.id, userId: user.id }
  });
  if (!existing) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const decisionInput: DecisionInput = {
    stage,
    interactionFreq: existing.interactionFreq as DecisionInput["interactionFreq"],
    initiative: existing.initiative as DecisionInput["initiative"],
    emotionQuality: existing.emotionQuality as DecisionInput["emotionQuality"],
    investmentBalance: existing.investmentBalance as DecisionInput["investmentBalance"],
    offlineStatus: existing.offlineStatus as DecisionInput["offlineStatus"],
    upgradeSignals: (existing.upgradeSignals ?? []) as DecisionInput["upgradeSignals"]
  };
  const result = await runAdvisor(decisionInput, existing.advisor as AdvisorKind);
  const connection = await prisma.connection.update({
    where: { id: existing.id },
    data: {
      stage,
      suggestedAction: result.nextAction,
      suggestedReason: result.reasonCode,
      advisor: result.advisor,
      advisorReason: result.advisorReason,
      priorityScore: result.priorityScore,
      priorityAdvice: result.priorityAdvice
    }
  });
  res.json(withDerivedAction(connection));
});

const overrideSchema = z.object({
  overrideAction: nextActionEnum.nullable(),
  overrideReason: z.string().nullable().optional()
});

app.patch("/connections/:id/override", authMiddleware, async (req, res) => {
  const user = res.locals.user;
  const { overrideAction, overrideReason } = overrideSchema.parse(req.body);
  const connection = await prisma.connection.update({
    where: { id: req.params.id, userId: user.id },
    data: {
      overrideAction,
      overrideReason: overrideAction === null ? null : overrideReason ?? null
    }
  });
  res.json(withDerivedAction(connection));
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
