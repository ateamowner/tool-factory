import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { faqPageJsonLd } from "./faq-schema.ts";
import {
  CATCH_UP_50_PLUS_2026_ESTIMATE,
  ELECTIVE_DEFERRAL_LIMIT_2026_ESTIMATE,
  computeFourOhThreeB,
  electiveDeferralLimitEstimate,
  employeeContributionAmount,
  employerMatchAmount,
  workingYears,
} from "./403b.ts";

function cents(value: number | null): number | null {
  if (value === null) return null;
  return Math.round(value * 100) / 100;
}

const typical = {
  currentAge: 40,
  retirementAge: 42,
  currentBalance: 10_000,
  annualSalary: 50_000,
  employeeContributionPercent: 10,
  employeeContributionDollars: 0,
  useDollarContribution: false,
  employerMatchPercent: 50,
  employerMatchSalaryCapPercent: 6,
  annualReturnPercent: 0,
  annualRaisePercent: 0,
};

describe("electiveDeferralLimitEstimate", () => {
  it("uses the 2026 under-50 estimate and adds catch-up at 50", () => {
    assert.equal(electiveDeferralLimitEstimate(49), ELECTIVE_DEFERRAL_LIMIT_2026_ESTIMATE);
    assert.equal(
      electiveDeferralLimitEstimate(50),
      ELECTIVE_DEFERRAL_LIMIT_2026_ESTIMATE + CATCH_UP_50_PLUS_2026_ESTIMATE,
    );
    assert.equal(
      electiveDeferralLimitEstimate(64),
      ELECTIVE_DEFERRAL_LIMIT_2026_ESTIMATE + CATCH_UP_50_PLUS_2026_ESTIMATE,
    );
  });

  it("rejects ages outside the supported range", () => {
    assert.equal(electiveDeferralLimitEstimate(15), null);
    assert.equal(electiveDeferralLimitEstimate(40.5), null);
  });
});

describe("employeeContributionAmount", () => {
  it("uses percent of salary unless a dollar amount is selected", () => {
    assert.equal(employeeContributionAmount(50_000, 10, 3_000, false), 5_000);
    assert.equal(employeeContributionAmount(50_000, 10, 3_000, true), 3_000);
  });

  it("rejects a negative or over-100 percent and a negative dollar amount", () => {
    assert.equal(employeeContributionAmount(50_000, -1, 0, false), null);
    assert.equal(employeeContributionAmount(50_000, 101, 0, false), null);
    assert.equal(employeeContributionAmount(50_000, 10, -1, true), null);
  });
});

describe("employerMatchAmount", () => {
  it("matches the employee amount only up to the salary cap", () => {
    assert.equal(employerMatchAmount(5_000, 50_000, 50, 6), 1_500);
    assert.equal(employerMatchAmount(2_000, 50_000, 50, 6), 1_000);
    assert.equal(employerMatchAmount(5_000, 50_000, 100, 6), 3_000);
    assert.equal(employerMatchAmount(5_000, 50_000, 50, 0), 0);
  });
});

describe("workingYears", () => {
  it("is retirement age minus current age when both are whole years", () => {
    assert.equal(workingYears(35, 65), 30);
    assert.equal(workingYears(35, 35), null);
    assert.equal(workingYears(35.5, 65), null);
    assert.equal(workingYears(15, 65), null);
  });
});

describe("computeFourOhThreeB", () => {
  it("projects employee contributions, match, and a zero-growth ending balance", () => {
    const result = computeFourOhThreeB(typical);

    assert.equal(result.valid, true);
    assert.equal(result.workingYears, 2);
    assert.equal(result.years.length, 2);
    assert.equal(result.years[0]?.employeeContribution, 5_000);
    assert.equal(result.years[0]?.employerMatch, 1_500);
    assert.equal(result.years[0]?.endingBalance, 16_500);
    assert.equal(result.years[1]?.employeeContribution, 5_000);
    assert.equal(result.years[1]?.employerMatch, 1_500);
    assert.equal(result.projectedBalance, 23_000);
    assert.equal(result.totalEmployeeContributions, 10_000);
    assert.equal(result.totalEmployerMatch, 3_000);
    assert.equal(result.estimatedGrowth, 0);
  });

  it("compounds contributions at the start of each year", () => {
    const result = computeFourOhThreeB({
      ...typical,
      retirementAge: 41,
      annualReturnPercent: 10,
    });

    assert.equal(result.valid, true);
    assert.equal(result.projectedBalance, 18_150);
    assert.equal(result.totalEmployeeContributions, 5_000);
    assert.equal(result.totalEmployerMatch, 1_500);
    assert.equal(cents(result.estimatedGrowth), 1_650);
  });

  it("raises salary each year after the first and can switch to a flat dollar deferral", () => {
    const percent = computeFourOhThreeB({
      ...typical,
      annualRaisePercent: 2,
    });
    assert.equal(percent.years[1]?.salary, 51_000);
    assert.equal(percent.years[1]?.employeeContribution, 5_100);
    assert.equal(cents(percent.years[1]?.employerMatch ?? null), 1_530);

    const dollars = computeFourOhThreeB({
      ...typical,
      annualRaisePercent: 2,
      useDollarContribution: true,
      employeeContributionDollars: 3_000,
    });
    assert.equal(dollars.years[0]?.employeeContribution, 3_000);
    assert.equal(dollars.years[1]?.employeeContribution, 3_000);
    assert.equal(dollars.years[1]?.employerMatch, 1_500);
  });

  it("caps employee deferrals at the 2026 IRS estimate and adds catch-up at 50", () => {
    const under50 = computeFourOhThreeB({
      ...typical,
      retirementAge: 41,
      annualSalary: 200_000,
      employeeContributionPercent: 15,
      employerMatchPercent: 100,
      employerMatchSalaryCapPercent: 6,
    });
    assert.equal(under50.years[0]?.uncappedEmployeeContribution, 30_000);
    assert.equal(under50.years[0]?.employeeContribution, ELECTIVE_DEFERRAL_LIMIT_2026_ESTIMATE);
    assert.equal(under50.years[0]?.cappedAtElectiveLimit, true);
    assert.equal(under50.years[0]?.employerMatch, 12_000);
    assert.equal(under50.yearsCappedAtElectiveLimit, 1);

    const catchUp = computeFourOhThreeB({
      ...typical,
      currentAge: 50,
      retirementAge: 51,
      useDollarContribution: true,
      employeeContributionDollars: 40_000,
      employerMatchPercent: 0,
      employerMatchSalaryCapPercent: 0,
    });
    assert.equal(
      catchUp.years[0]?.employeeContribution,
      ELECTIVE_DEFERRAL_LIMIT_2026_ESTIMATE + CATCH_UP_50_PLUS_2026_ESTIMATE,
    );
    assert.equal(catchUp.catchUpYears, 1);
    assert.equal(catchUp.years[0]?.catchUpApplies, true);
  });

  it("rejects missing salary, inverted ages, or an out-of-range return", () => {
    assert.equal(computeFourOhThreeB({ ...typical, annualSalary: 0 }).valid, false);
    assert.equal(computeFourOhThreeB({ ...typical, retirementAge: 40 }).valid, false);
    assert.equal(computeFourOhThreeB({ ...typical, annualReturnPercent: -1 }).valid, false);
    assert.equal(computeFourOhThreeB({ ...typical, currentBalance: -1 }).valid, false);
    assert.equal(computeFourOhThreeB({ ...typical, employeeContributionPercent: 120 }).valid, false);
  });
});

describe("FAQPage JSON-LD shape for 403b calculator", () => {
  it("emits a validator-friendly FAQPage", () => {
    const data = faqPageJsonLd([
      {
        question: "How does a 403b calculator work?",
        answer:
          "It projects employee contributions, optional employer match, and investment growth from your current age to retirement.",
      },
    ]);
    assert.equal(data["@context"], "https://schema.org");
    assert.equal(data["@type"], "FAQPage");
    assert.equal(data.mainEntity[0]?.["@type"], "Question");
    assert.equal(data.mainEntity[0]?.acceptedAnswer["@type"], "Answer");
    assert.equal(typeof data.mainEntity[0]?.acceptedAnswer.text, "string");
  });
});
