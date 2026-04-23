import i18n from "i18next";
import type { ConnectionInput } from "./types";

export function buildDefaultConnectionInput(): ConnectionInput {
  return {
    name: i18n.t("newRecordName"),
    stage: "INTRO",
    interactionFreq: "NONE",
    initiative: "BALANCED",
    emotionQuality: "NEUTRAL",
    investmentBalance: "BALANCED",
    offlineStatus: "NEVER",
    upgradeSignals: [],
    advisor: "RULES",
    channelId: null
  };
}

// Static fallback for places that run before i18n init (rare).
export const defaultConnectionInput: ConnectionInput = {
  name: "新对象",
  stage: "INTRO",
  interactionFreq: "NONE",
  initiative: "BALANCED",
  emotionQuality: "NEUTRAL",
  investmentBalance: "BALANCED",
  offlineStatus: "NEVER",
  upgradeSignals: [],
  advisor: "RULES",
  channelId: null
};
