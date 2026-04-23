import { describe, expect, it } from "vitest";
import { RulesAdvisor } from "./advisor.js";
import type { DecisionInput } from "./decision.js";

const baseInput: DecisionInput = {
  stage: "FLIRT",
  interactionFreq: "HIGH",
  initiative: "BALANCED",
  emotionQuality: "POSITIVE",
  investmentBalance: "BALANCED",
  offlineStatus: "ONCE",
  upgradeSignals: ["CARE", "INVITE"]
};

describe("RulesAdvisor", () => {
  it("emits nextAction + reasonCode + priority", async () => {
    const advisor = new RulesAdvisor();
    const r = await advisor.advise(baseInput);
    expect(r.advisor).toBe("RULES");
    expect(r.nextAction).toBe("CLEAR_INVITE");
    expect(r.reasonCode).toBe("READY_FOR_INVITE");
    expect(r.priorityAdvice).toBe("HIGH");
    expect(r.advisorReason).toBeNull();
  });

  it("healthCheck is always ok", async () => {
    const advisor = new RulesAdvisor();
    const h = await advisor.healthCheck();
    expect(h.ok).toBe(true);
  });
});
