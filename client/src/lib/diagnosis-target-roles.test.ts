import { describe, expect, it } from "vitest";
import {
  ASSESSMENT_PATHWAYS,
  DIAGNOSIS_TARGET_ROLES,
  isDiagnosisTargetRole,
} from "./diagnosis-target-roles";

describe("assessment pathways", () => {
  it("covers every founder-approved diagnosis target role exactly once", () => {
    const pathwayRoles = ASSESSMENT_PATHWAYS.map((p) => p.targetRole);
    expect(pathwayRoles).toEqual([...DIAGNOSIS_TARGET_ROLES]);
  });

  it("guards stored role values for Step 1 prefill", () => {
    expect(isDiagnosisTargetRole(DIAGNOSIS_TARGET_ROLES[0])).toBe(true);
    expect(isDiagnosisTargetRole("Unknown Role")).toBe(false);
  });
});
