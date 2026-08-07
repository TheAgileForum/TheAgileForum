import { describe, expect, it } from "vitest";
import { DIAGNOSIS_TARGET_ROLES, intentBody } from "./contracts.js";

describe("diagnosis target roles", () => {
  it("exposes exactly the six founder-approved target roles", () => {
    expect([...DIAGNOSIS_TARGET_ROLES]).toEqual([
      "Scrum Master/Agile Project Manager",
      "Product Owner/Product Manager",
      "Senior Project Manager(Technical)/Senior Agilist",
      "Delivery Lead /Senior Delivery Manager",
      "Program Manager/RTE",
      "Agile Coach/ Agile Transformation Lead",
    ]);
  });

  it("accepts each allowed target role on intent", () => {
    for (const targetRole of DIAGNOSIS_TARGET_ROLES) {
      const parsed = intentBody.safeParse({
        targetRole,
        timeline: "3 months",
        currentStatus: "Practitioner",
        consentAck: true,
      });
      expect(parsed.success).toBe(true);
    }
  });

  it("rejects legacy target roles removed from the dropdown", () => {
    for (const targetRole of ["Scrum Master", "Product Owner", "SAFe Agilist", "Agile Coach"]) {
      const parsed = intentBody.safeParse({
        targetRole,
        timeline: "3 months",
        currentStatus: "Practitioner",
        consentAck: true,
      });
      expect(parsed.success).toBe(false);
    }
  });
});
