import type {
  Stage,
  InteractionFrequency,
  InitiativeDirection,
  EmotionQuality,
  InvestmentBalance,
  OfflineStatus,
  UpgradeSignal,
  NextAction
} from "./types";

export const stages: Stage[] = ["INTRO", "COMFORT", "FLIRT", "UPGRADE", "COOLING", "ENDED"];
export const interactionFreqs: InteractionFrequency[] = ["HIGH", "MEDIUM", "LOW", "NONE"];
export const initiatives: InitiativeDirection[] = ["SELF", "OTHER", "BALANCED"];
export const emotionQualities: EmotionQuality[] = ["NEUTRAL", "POSITIVE", "VOLATILE", "DRAINING"];
export const investmentBalances: InvestmentBalance[] = ["SELF_MORE", "BALANCED", "OTHER_MORE"];
export const offlineStatuses: OfflineStatus[] = ["NEVER", "ONCE", "MULTIPLE"];
export const upgradeSignals: UpgradeSignal[] = ["CARE", "INVITE", "TIME_GIVE", "BODY_LANGUAGE", "EMOTIONAL_DEPENDENCE"];
export const nextActions: NextAction[] = ["KEEP_CHAT", "LIGHT_UPGRADE", "CLEAR_INVITE", "SLOW_DOWN", "OBSERVE", "END"];

export const actionTone: Record<NextAction, string> = {
  KEEP_CHAT: "#4b6cb7",
  LIGHT_UPGRADE: "#2e7d32",
  CLEAR_INVITE: "#1b5e20",
  SLOW_DOWN: "#ef6c00",
  OBSERVE: "#6a1b9a",
  END: "#c62828"
};
