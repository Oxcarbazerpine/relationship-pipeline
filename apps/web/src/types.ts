export type Stage = "INTRO" | "COMFORT" | "FLIRT" | "UPGRADE" | "COOLING" | "ENDED";
export type InteractionFrequency = "HIGH" | "MEDIUM" | "LOW" | "NONE";
export type InitiativeDirection = "SELF" | "OTHER" | "BALANCED";
export type EmotionQuality = "NEUTRAL" | "POSITIVE" | "VOLATILE" | "DRAINING";
export type InvestmentBalance = "SELF_MORE" | "BALANCED" | "OTHER_MORE";
export type OfflineStatus = "NEVER" | "ONCE" | "MULTIPLE";
export type UpgradeSignal = "CARE" | "INVITE" | "TIME_GIVE" | "BODY_LANGUAGE" | "EMOTIONAL_DEPENDENCE";
export type NextAction = "KEEP_CHAT" | "LIGHT_UPGRADE" | "CLEAR_INVITE" | "SLOW_DOWN" | "OBSERVE" | "END";
export type PriorityAdvice = "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
export type AdvisorKind = "RULES" | "AI";

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
  reasonCode: string;
}

export interface Connection extends DecisionInput {
  id: string;
  name: string;
  lastInteractionAt: string | null;
  actionDueAt: string | null;
  suggestedAction: NextAction;
  suggestedReason: string;
  overrideAction: NextAction | null;
  overrideReason: string | null;
  nextAction: NextAction;
  isOverridden: boolean;
  notes: string | null;
  priorityScore: number;
  priorityAdvice: PriorityAdvice;
  advisor: AdvisorKind;
  advisorReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConnectionInput extends DecisionInput {
  name: string;
  lastInteractionAt?: string | null;
  actionDueAt?: string | null;
  overrideAction?: NextAction | null;
  overrideReason?: string | null;
  notes?: string | null;
  advisor?: AdvisorKind;
}
