import { describe, expect, it } from "vitest";
import { decide, scorePriority, type DecisionInput } from "./decision.js";

function input(overrides: Partial<DecisionInput> = {}): DecisionInput {
  return {
    stage: "INTRO",
    interactionFreq: "MEDIUM",
    initiative: "BALANCED",
    emotionQuality: "NEUTRAL",
    investmentBalance: "BALANCED",
    offlineStatus: "NEVER",
    upgradeSignals: [],
    ...overrides
  };
}

describe("decide", () => {
  it("ends when stage already ENDED", () => {
    expect(decide(input({ stage: "ENDED" }))).toEqual({ nextAction: "END", reasonCode: "ALREADY_ENDED" });
  });

  it("ends when self-more + draining emotion", () => {
    expect(decide(input({ emotionQuality: "DRAINING", investmentBalance: "SELF_MORE" })))
      .toEqual({ nextAction: "END", reasonCode: "DRAINING_ONE_SIDED" });
  });

  it("ends when cooling + no contact", () => {
    expect(decide(input({ stage: "COOLING", interactionFreq: "NONE" })))
      .toEqual({ nextAction: "END", reasonCode: "COOLING_NO_CONTACT" });
  });

  it("observes in cooling even if contact", () => {
    expect(decide(input({ stage: "COOLING", interactionFreq: "LOW" })))
      .toEqual({ nextAction: "OBSERVE", reasonCode: "COOLING_STAGE" });
  });

  it("observes on volatile emotion", () => {
    expect(decide(input({ emotionQuality: "VOLATILE" })))
      .toEqual({ nextAction: "OBSERVE", reasonCode: "VOLATILE_EMOTION" });
  });

  it("slows down when self over-investing with weak signals", () => {
    expect(decide(input({ initiative: "SELF", investmentBalance: "SELF_MORE", upgradeSignals: ["CARE"] })))
      .toEqual({ nextAction: "SLOW_DOWN", reasonCode: "SELF_OVERINVESTING" });
  });

  it("clear invite when 2+ signals, met offline, in FLIRT, positive", () => {
    expect(decide(input({
      stage: "FLIRT",
      emotionQuality: "POSITIVE",
      offlineStatus: "ONCE",
      upgradeSignals: ["CARE", "INVITE"]
    }))).toEqual({ nextAction: "CLEAR_INVITE", reasonCode: "READY_FOR_INVITE" });
  });

  it("light upgrade on signals in INTRO", () => {
    expect(decide(input({ stage: "INTRO", upgradeSignals: ["CARE", "INVITE"] })))
      .toEqual({ nextAction: "LIGHT_UPGRADE", reasonCode: "SIGNALS_IN_INTRO" });
  });

  it("light upgrade on early single signal in COMFORT + positive", () => {
    expect(decide(input({ stage: "COMFORT", emotionQuality: "POSITIVE", upgradeSignals: ["CARE"] })))
      .toEqual({ nextAction: "LIGHT_UPGRADE", reasonCode: "EARLY_SIGNAL" });
  });

  it("consolidates in UPGRADE", () => {
    expect(decide(input({ stage: "UPGRADE" })))
      .toEqual({ nextAction: "KEEP_CHAT", reasonCode: "UPGRADE_CONSOLIDATE" });
  });

  it("falls back to MAINTAIN", () => {
    expect(decide(input())).toEqual({ nextAction: "KEEP_CHAT", reasonCode: "MAINTAIN" });
  });
});

describe("scorePriority", () => {
  it("HIGH when both very favorable", () => {
    const { advice } = scorePriority({ emotionQuality: "POSITIVE", investmentBalance: "OTHER_MORE" });
    expect(advice).toBe("HIGH");
  });

  it("LOW when draining + self-more", () => {
    const { advice } = scorePriority({ emotionQuality: "DRAINING", investmentBalance: "SELF_MORE" });
    expect(advice).toBe("LOW");
  });

  it("MEDIUM on neutral/balanced", () => {
    const { advice, score } = scorePriority({ emotionQuality: "NEUTRAL", investmentBalance: "BALANCED" });
    expect(score).toBe(1);
    expect(advice).toBe("MEDIUM");
  });
});
