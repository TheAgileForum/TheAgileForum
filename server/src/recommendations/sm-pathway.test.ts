import { describe, expect, it } from "vitest";
import {
  isScrumMasterPathway,
  parseYearsOfExperience,
  resolveSmSafeOfferingCode,
  SM_LEADING_SAFE_CODE,
  SM_SAFE_SCRUM_MASTER_CODE,
} from "./sm-pathway.js";

describe("sm-pathway YOE parsing", () => {
  it("parses common resume total-experience phrases", () => {
    expect(parseYearsOfExperience("15+ years of IT experience as Scrum Master")).toBe(15);
    expect(parseYearsOfExperience("Total experience: 14 years in software")).toBe(14);
    expect(parseYearsOfExperience("Over 12 years of experience in Agile")).toBe(12);
    expect(parseYearsOfExperience("YOE: 18")).toBe(18);
    expect(parseYearsOfExperience("11 yoe in delivery")).toBe(11);
    expect(parseYearsOfExperience("Senior BA with 16 years experience")).toBe(16);
  });

  it("returns null when no credible YOE signal exists", () => {
    expect(parseYearsOfExperience(null, undefined, "")).toBeNull();
    expect(parseYearsOfExperience("Developer transitioning to SM")).toBeNull();
    expect(parseYearsOfExperience("Facilitated 5 sprint retros")).toBeNull();
  });

  it("takes the highest credible YOE across hints", () => {
    expect(
      parseYearsOfExperience(
        "5 years as Scrum Master",
        "Summary: 18 years of professional experience",
      ),
    ).toBe(18);
  });
});

describe("sm-pathway SAFe offering resolution", () => {
  it("defaults unknown YOE to SAFe Scrum Master (<12 path)", () => {
    expect(resolveSmSafeOfferingCode(null)).toBe(SM_SAFE_SCRUM_MASTER_CODE);
  });

  it("uses SAFe Scrum Master when YOE < 12", () => {
    expect(resolveSmSafeOfferingCode(0)).toBe(SM_SAFE_SCRUM_MASTER_CODE);
    expect(resolveSmSafeOfferingCode(11)).toBe(SM_SAFE_SCRUM_MASTER_CODE);
  });

  it("uses Leading SAFe when YOE ≥ 12", () => {
    expect(resolveSmSafeOfferingCode(12)).toBe(SM_LEADING_SAFE_CODE);
    expect(resolveSmSafeOfferingCode(20)).toBe(SM_LEADING_SAFE_CODE);
  });

  it("detects SM pathway roles", () => {
    expect(isScrumMasterPathway("scrum_master")).toBe(true);
    expect(isScrumMasterPathway("Scrum Master")).toBe(true);
    expect(isScrumMasterPathway("Scrum Master/Agile Project Manager")).toBe(true);
    expect(isScrumMasterPathway("Product Owner")).toBe(false);
  });
});
