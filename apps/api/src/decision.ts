export type Stage = "INTRO" | "COMFORT" | "FLIRT" | "UPGRADE" | "COOLING" | "ENDED";
export type InteractionFrequency = "HIGH" | "MEDIUM" | "LOW" | "NONE";
export type InitiativeDirection = "SELF" | "OTHER" | "BALANCED";
export type EmotionQuality = "NEUTRAL" | "POSITIVE" | "VOLATILE" | "DRAINING";
export type InvestmentBalance = "SELF_MORE" | "BALANCED" | "OTHER_MORE";
export type OfflineStatus = "NEVER" | "ONCE" | "MULTIPLE";
export type UpgradeSignal = "CARE" | "INVITE" | "TIME_GIVE" | "BODY_LANGUAGE" | "EMOTIONAL_DEPENDENCE";
export type NextAction = "KEEP_CHAT" | "LIGHT_UPGRADE" | "CLEAR_INVITE" | "SLOW_DOWN" | "OBSERVE" | "END";

export type ReasonCode =
  | "ALREADY_ENDED"
  | "DRAINING_ONE_SIDED"
  | "COOLING_NO_CONTACT"
  | "COOLING_STAGE"
  | "NO_CONTACT_LATE"
  | "VOLATILE_EMOTION"
  | "SELF_OVERINVESTING"
  | "READY_FOR_INVITE"
  | "SIGNALS_IN_INTRO"
  | "EARLY_SIGNAL"
  | "UPGRADE_CONSOLIDATE"
  | "MAINTAIN";

export interface DecisionInput {
  stage: Stage;
  interactionFreq: InteractionFrequency;
  initiative: InitiativeDirection;
  emotionQuality: EmotionQuality;
  investmentBalance: InvestmentBalance;
  offlineStatus: OfflineStatus;
  upgradeSignals: UpgradeSignal[];
}

export interface DecisionResult {
  nextAction: NextAction;
  reasonCode: ReasonCode;
}

type Rule = (input: DecisionInput) => DecisionResult | null;

const rules: Rule[] = [
  (i) => (i.stage === "ENDED" ? { nextAction: "END", reasonCode: "ALREADY_ENDED" } : null),

  (i) =>
    i.emotionQuality === "DRAINING" && i.investmentBalance === "SELF_MORE"
      ? { nextAction: "END", reasonCode: "DRAINING_ONE_SIDED" }
      : null,

  (i) =>
    i.stage === "COOLING" && i.interactionFreq === "NONE"
      ? { nextAction: "END", reasonCode: "COOLING_NO_CONTACT" }
      : null,

  (i) => (i.stage === "COOLING" ? { nextAction: "OBSERVE", reasonCode: "COOLING_STAGE" } : null),

  (i) =>
    i.interactionFreq === "NONE" && i.stage !== "INTRO"
      ? { nextAction: "OBSERVE", reasonCode: "NO_CONTACT_LATE" }
      : null,

  (i) =>
    i.emotionQuality === "VOLATILE"
      ? { nextAction: "OBSERVE", reasonCode: "VOLATILE_EMOTION" }
      : null,

  (i) =>
    i.initiative === "SELF" &&
    i.investmentBalance === "SELF_MORE" &&
    i.upgradeSignals.length < 2
      ? { nextAction: "SLOW_DOWN", reasonCode: "SELF_OVERINVESTING" }
      : null,

  (i) =>
    i.upgradeSignals.length >= 2 &&
    (i.stage === "COMFORT" || i.stage === "FLIRT") &&
    i.offlineStatus !== "NEVER" &&
    (i.emotionQuality === "POSITIVE" || i.emotionQuality === "NEUTRAL")
      ? { nextAction: "CLEAR_INVITE", reasonCode: "READY_FOR_INVITE" }
      : null,

  (i) =>
    i.upgradeSignals.length >= 2 && i.stage === "INTRO"
      ? { nextAction: "LIGHT_UPGRADE", reasonCode: "SIGNALS_IN_INTRO" }
      : null,

  (i) =>
    i.upgradeSignals.length >= 1 &&
    (i.stage === "INTRO" || i.stage === "COMFORT") &&
    (i.emotionQuality === "POSITIVE" || i.emotionQuality === "NEUTRAL")
      ? { nextAction: "LIGHT_UPGRADE", reasonCode: "EARLY_SIGNAL" }
      : null,

  (i) =>
    i.stage === "UPGRADE"
      ? { nextAction: "KEEP_CHAT", reasonCode: "UPGRADE_CONSOLIDATE" }
      : null
];

export function decide(input: DecisionInput): DecisionResult {
  for (const rule of rules) {
    const result = rule(input);
    if (result) return result;
  }
  return { nextAction: "KEEP_CHAT", reasonCode: "MAINTAIN" };
}

export type PriorityAdvice = "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";

export function scorePriority(input: Pick<DecisionInput, "emotionQuality" | "investmentBalance">): {
  score: number;
  advice: PriorityAdvice;
} {
  const emotionScore =
    input.emotionQuality === "POSITIVE" ? 2 :
    input.emotionQuality === "VOLATILE" ? 1 :
    input.emotionQuality === "DRAINING" ? -1 : 0;
  const investmentScore =
    input.investmentBalance === "OTHER_MORE" ? 2 :
    input.investmentBalance === "BALANCED"   ? 1 :
    input.investmentBalance === "SELF_MORE"  ? -1 : 0;
  const score = emotionScore + investmentScore;
  const advice: PriorityAdvice = score >= 3 ? "HIGH" : score >= 0 ? "MEDIUM" : "LOW";
  return { score, advice };
}
