import { Router, type RequestHandler } from "express";
import { z } from "zod";
import type { PrismaClient } from "@prisma/client";
import { createAdvisor, type AdvisorKind } from "../advisor.js";
import type { DecisionInput } from "../decision.js";

const nextActionEnum = z.enum(["KEEP_CHAT", "LIGHT_UPGRADE", "CLEAR_INVITE", "SLOW_DOWN", "OBSERVE", "END"]);

export const connectionSchema = z.object({
  name: z.string().min(1),
  stage: z.enum(["INTRO", "COMFORT", "FLIRT", "UPGRADE", "COOLING", "ENDED"]),
  lastInteractionAt: z.string().datetime().optional().nullable(),
  interactionFreq: z.enum(["HIGH", "MEDIUM", "LOW", "NONE"]),
  initiative: z.enum(["SELF", "OTHER", "BALANCED"]),
  emotionQuality: z.enum(["NEUTRAL", "POSITIVE", "VOLATILE", "DRAINING"]),
  investmentBalance: z.enum(["SELF_MORE", "BALANCED", "OTHER_MORE"]),
  offlineStatus: z.enum(["NEVER", "ONCE", "MULTIPLE"]),
  upgradeSignals: z
    .array(z.enum(["CARE", "INVITE", "TIME_GIVE", "BODY_LANGUAGE", "EMOTIONAL_DEPENDENCE"]))
    .default([]),
  overrideAction: nextActionEnum.nullable().optional(),
  overrideReason: z.string().nullable().optional(),
  actionDueAt: z.string().datetime().optional().nullable(),
  notes: z.string().nullable().optional(),
  advisor: z.enum(["RULES", "AI"]).optional().default("RULES"),
  channelId: z.string().nullable().optional()
});

const partialConnectionSchema = connectionSchema.partial();

const stageSchema = z.object({
  stage: z.enum(["INTRO", "COMFORT", "FLIRT", "UPGRADE", "COOLING", "ENDED"])
});

const overrideSchema = z.object({
  overrideAction: nextActionEnum.nullable(),
  overrideReason: z.string().nullable().optional()
});

const decisionRelevantFields = [
  "stage",
  "interactionFreq",
  "initiative",
  "emotionQuality",
  "investmentBalance",
  "offlineStatus",
  "upgradeSignals"
] as const;

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

export function createConnectionsRouter(prisma: PrismaClient, auth: RequestHandler) {
  const router = Router();

  router.get("/", auth, async (_req, res) => {
    const user = res.locals.user;
    const connections = await prisma.connection.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" }
    });
    res.json(connections.map(withDerivedAction));
  });

  router.post("/", auth, async (req, res) => {
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

  router.put("/:id", auth, async (req, res) => {
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

  router.patch("/:id", auth, async (req, res) => {
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

  router.patch("/:id/stage", auth, async (req, res) => {
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

  router.patch("/:id/override", auth, async (req, res) => {
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

  router.delete("/:id", auth, async (req, res) => {
    const user = res.locals.user;
    await prisma.connection.delete({
      where: { id: req.params.id, userId: user.id }
    });
    res.status(204).send();
  });

  return router;
}
