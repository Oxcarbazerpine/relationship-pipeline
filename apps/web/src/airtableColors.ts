export type AirtableColor =
  | "blueLight2"
  | "cyanLight2"
  | "tealLight2"
  | "greenLight2"
  | "yellowLight2"
  | "orangeLight2";

export const airtableChip: Record<AirtableColor, { bg: string; fg: string; border: string }> = {
  blueLight2:   { bg: "#1e3a5f", fg: "#a3c4e8", border: "#2d4a70" },
  cyanLight2:   { bg: "#0e4759", fg: "#8ed4e0", border: "#1a5a70" },
  tealLight2:   { bg: "#0f4a43", fg: "#7ad3c4", border: "#1a5d54" },
  greenLight2:  { bg: "#1a4d28", fg: "#7cc48a", border: "#26603a" },
  yellowLight2: { bg: "#544218", fg: "#d8b360", border: "#6a552a" },
  orangeLight2: { bg: "#5a2a1a", fg: "#d89478", border: "#703a2a" }
};

import type {
  EmotionQuality,
  InitiativeDirection,
  InteractionFrequency,
  InvestmentBalance,
  NextAction,
  OfflineStatus,
  PriorityAdvice,
  Stage,
  UpgradeSignal
} from "./types";

export const stageColor: Record<Stage, AirtableColor> = {
  INTRO: "blueLight2",
  COMFORT: "cyanLight2",
  FLIRT: "tealLight2",
  UPGRADE: "greenLight2",
  COOLING: "yellowLight2",
  ENDED: "orangeLight2"
};

export const interactionFreqColor: Record<InteractionFrequency, AirtableColor> = {
  HIGH: "blueLight2",
  MEDIUM: "cyanLight2",
  LOW: "tealLight2",
  NONE: "greenLight2"
};

export const initiativeColor: Record<InitiativeDirection, AirtableColor> = {
  SELF: "blueLight2",
  OTHER: "cyanLight2",
  BALANCED: "tealLight2"
};

export const emotionColor: Record<EmotionQuality, AirtableColor> = {
  NEUTRAL: "blueLight2",
  POSITIVE: "cyanLight2",
  VOLATILE: "tealLight2",
  DRAINING: "greenLight2"
};

export const investmentColor: Record<InvestmentBalance, AirtableColor> = {
  SELF_MORE: "blueLight2",
  BALANCED: "cyanLight2",
  OTHER_MORE: "tealLight2"
};

export const offlineColor: Record<OfflineStatus, AirtableColor> = {
  NEVER: "blueLight2",
  ONCE: "cyanLight2",
  MULTIPLE: "tealLight2"
};

export const upgradeSignalColor: Record<UpgradeSignal, AirtableColor> = {
  CARE: "blueLight2",
  INVITE: "cyanLight2",
  TIME_GIVE: "tealLight2",
  BODY_LANGUAGE: "greenLight2",
  EMOTIONAL_DEPENDENCE: "yellowLight2"
};

export const nextActionColor: Record<NextAction, AirtableColor> = {
  KEEP_CHAT: "blueLight2",
  LIGHT_UPGRADE: "cyanLight2",
  CLEAR_INVITE: "tealLight2",
  SLOW_DOWN: "greenLight2",
  OBSERVE: "yellowLight2",
  END: "orangeLight2"
};

export const priorityColor: Record<PriorityAdvice, AirtableColor> = {
  HIGH: "greenLight2",
  MEDIUM: "cyanLight2",
  LOW: "yellowLight2",
  UNKNOWN: "blueLight2"
};
