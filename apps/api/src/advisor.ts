import Anthropic from "@anthropic-ai/sdk";
import { decide, scorePriority, type DecisionInput, type NextAction, type PriorityAdvice } from "./decision.js";

export type AdvisorKind = "RULES" | "AI";

export interface AdvisorResult {
  advisor: AdvisorKind;
  nextAction: NextAction;
  reasonCode: string;
  advisorReason: string | null;
  priorityScore: number;
  priorityAdvice: PriorityAdvice;
}

export interface Advisor {
  kind: AdvisorKind;
  advise(input: DecisionInput): Promise<AdvisorResult>;
  healthCheck(): Promise<{ ok: true } | { ok: false; error: string }>;
}

export class RulesAdvisor implements Advisor {
  kind: AdvisorKind = "RULES";

  async advise(input: DecisionInput): Promise<AdvisorResult> {
    const { nextAction, reasonCode } = decide(input);
    const { score, advice } = scorePriority(input);
    return {
      advisor: "RULES",
      nextAction,
      reasonCode,
      advisorReason: null,
      priorityScore: score,
      priorityAdvice: advice
    };
  }

  async healthCheck() {
    return { ok: true as const };
  }
}

const ACTION_MAP: Record<string, NextAction> = {
  "继续聊天": "KEEP_CHAT",
  "轻升级测试（弱邀约）": "LIGHT_UPGRADE",
  "明确邀约": "CLEAR_INVITE",
  "放缓投入": "SLOW_DOWN",
  "降级为观察": "OBSERVE",
  "结束": "END"
};

const PRIORITY_MAP: Record<string, PriorityAdvice> = {
  "高": "HIGH",
  "中": "MEDIUM",
  "低": "LOW"
};

export class AIAdvisor implements Advisor {
  kind: AdvisorKind = "AI";
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model = "claude-haiku-4-5-20251001") {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async healthCheck() {
    try {
      await this.client.messages.create({
        model: this.model,
        max_tokens: 8,
        messages: [{ role: "user", content: "ping" }]
      });
      return { ok: true as const };
    } catch (e) {
      return { ok: false as const, error: (e as Error).message };
    }
  }

  async advise(input: DecisionInput): Promise<AdvisorResult> {
    const { score, advice: ruleAdvice } = scorePriority(input);

    const prompt = `You are an intelligent relationship strategy advisor. Given these 7 factors, output exactly two lines:
Line 1: next-step action (one of: 继续聊天 / 轻升级测试（弱邀约） / 明确邀约 / 放缓投入 / 降级为观察 / 结束), a Chinese comma, then a one-sentence reason.
Line 2: priority (one of: 高 / 中 / 低), a Chinese comma, then a one-sentence reason.

当前阶段: ${input.stage}
互动频率: ${input.interactionFreq}
主动方向: ${input.initiative}
情绪质量: ${input.emotionQuality}
投入一致性: ${input.investmentBalance}
线下状态: ${input.offlineStatus}
升级信号: ${input.upgradeSignals.join(",") || "无"}`;

    const resp = await this.client.messages.create({
      model: this.model,
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }]
    });

    const text = resp.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    const [actionLine = "", priorityLine = ""] = text.split(/\r?\n/);
    const [actionCn = "", actionReason = ""] = actionLine.split(/[，,]/, 2);
    const [priorityCn = "", priorityReason = ""] = priorityLine.split(/[，,]/, 2);

    const nextAction = ACTION_MAP[actionCn.trim()] ?? decide(input).nextAction;
    const priorityAdvice = PRIORITY_MAP[priorityCn.trim()] ?? ruleAdvice;

    const reasonText = [actionReason, priorityReason].filter(Boolean).join(" / ").trim();

    return {
      advisor: "AI",
      nextAction,
      reasonCode: "AI_GENERATED",
      advisorReason: reasonText || text.slice(0, 200),
      priorityScore: score,
      priorityAdvice
    };
  }
}

export function createAdvisor(kind: AdvisorKind): Advisor {
  if (kind === "AI") {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) {
      throw new Error("ANTHROPIC_API_KEY not configured");
    }
    return new AIAdvisor(key, process.env.ANTHROPIC_MODEL);
  }
  return new RulesAdvisor();
}
