export const ELECTIVE_DEFERRAL_LIMIT_2026_ESTIMATE = 23_500;
export const CATCH_UP_50_PLUS_2026_ESTIMATE = 7_500;
export const CATCH_UP_AGE = 50;

export const MIN_CURRENT_AGE = 16;
export const MAX_CURRENT_AGE = 90;
export const MAX_RETIREMENT_AGE = 100;
export const MAX_WORKING_YEARS = 60;
export const MAX_RETURN_PERCENT = 50;
export const MAX_RAISE_PERCENT = 50;
export const MAX_CONTRIBUTION_PERCENT = 100;
export const MAX_MATCH_PERCENT = 200;
export const MAX_MATCH_SALARY_CAP_PERCENT = 100;

export type FourOhThreeBInput = {
  currentAge: number;
  retirementAge: number;
  currentBalance: number;
  annualSalary: number;
  employeeContributionPercent: number;
  employeeContributionDollars: number;
  useDollarContribution: boolean;
  employerMatchPercent: number;
  employerMatchSalaryCapPercent: number;
  annualReturnPercent: number;
  annualRaisePercent: number;
};

export type FourOhThreeBYear = {
  year: number;
  age: number;
  salary: number;
  electiveLimit: number;
  employeeContribution: number;
  employerMatch: number;
  uncappedEmployeeContribution: number;
  cappedAtElectiveLimit: boolean;
  catchUpApplies: boolean;
  endingBalance: number;
};

export type FourOhThreeBResult = {
  valid: boolean;
  workingYears: number | null;
  projectedBalance: number | null;
  totalEmployeeContributions: number | null;
  totalEmployerMatch: number | null;
  estimatedGrowth: number | null;
  yearsCappedAtElectiveLimit: number | null;
  catchUpYears: number | null;
  years: FourOhThreeBYear[];
};

const emptyResult: FourOhThreeBResult = {
  valid: false,
  workingYears: null,
  projectedBalance: null,
  totalEmployeeContributions: null,
  totalEmployerMatch: null,
  estimatedGrowth: null,
  yearsCappedAtElectiveLimit: null,
  catchUpYears: null,
  years: [],
};

function isFiniteNumber(value: number): boolean {
  return Number.isFinite(value);
}

function isWholeNumber(value: number): boolean {
  return isFiniteNumber(value) && Number.isInteger(value);
}

export function electiveDeferralLimitEstimate(age: number): number | null {
  if (!isWholeNumber(age) || age < MIN_CURRENT_AGE || age > MAX_RETIREMENT_AGE) {
    return null;
  }
  return (
    ELECTIVE_DEFERRAL_LIMIT_2026_ESTIMATE +
    (age >= CATCH_UP_AGE ? CATCH_UP_50_PLUS_2026_ESTIMATE : 0)
  );
}

export function employeeContributionAmount(
  salary: number,
  contributionPercent: number,
  contributionDollars: number,
  useDollarContribution: boolean,
): number | null {
  if (!isFiniteNumber(salary) || salary < 0) return null;
  if (useDollarContribution) {
    if (!isFiniteNumber(contributionDollars) || contributionDollars < 0) return null;
    return contributionDollars;
  }
  if (
    !isFiniteNumber(contributionPercent) ||
    contributionPercent < 0 ||
    contributionPercent > MAX_CONTRIBUTION_PERCENT
  ) {
    return null;
  }
  return salary * (contributionPercent / 100);
}

export function employerMatchAmount(
  employeeContribution: number,
  salary: number,
  matchPercent: number,
  matchSalaryCapPercent: number,
): number | null {
  if (!isFiniteNumber(employeeContribution) || employeeContribution < 0) return null;
  if (!isFiniteNumber(salary) || salary < 0) return null;
  if (!isFiniteNumber(matchPercent) || matchPercent < 0 || matchPercent > MAX_MATCH_PERCENT) {
    return null;
  }
  if (
    !isFiniteNumber(matchSalaryCapPercent) ||
    matchSalaryCapPercent < 0 ||
    matchSalaryCapPercent > MAX_MATCH_SALARY_CAP_PERCENT
  ) {
    return null;
  }

  const matchable = Math.min(employeeContribution, salary * (matchSalaryCapPercent / 100));
  return matchable * (matchPercent / 100);
}

export function workingYears(currentAge: number, retirementAge: number): number | null {
  if (!isWholeNumber(currentAge) || !isWholeNumber(retirementAge)) return null;
  if (currentAge < MIN_CURRENT_AGE || currentAge > MAX_CURRENT_AGE) return null;
  if (retirementAge <= currentAge || retirementAge > MAX_RETIREMENT_AGE) return null;
  const years = retirementAge - currentAge;
  if (years < 1 || years > MAX_WORKING_YEARS) return null;
  return years;
}

export function computeFourOhThreeB(input: FourOhThreeBInput): FourOhThreeBResult {
  const yearsToRetirement = workingYears(input.currentAge, input.retirementAge);
  const balanceOk = isFiniteNumber(input.currentBalance) && input.currentBalance >= 0;
  const salaryOk = isFiniteNumber(input.annualSalary) && input.annualSalary > 0;
  const returnOk =
    isFiniteNumber(input.annualReturnPercent) &&
    input.annualReturnPercent >= 0 &&
    input.annualReturnPercent <= MAX_RETURN_PERCENT;
  const raiseOk =
    isFiniteNumber(input.annualRaisePercent) &&
    input.annualRaisePercent >= 0 &&
    input.annualRaisePercent <= MAX_RAISE_PERCENT;

  if (!yearsToRetirement || !balanceOk || !salaryOk || !returnOk || !raiseOk) {
    return emptyResult;
  }

  const growthFactor = 1 + input.annualReturnPercent / 100;
  const raiseFactor = 1 + input.annualRaisePercent / 100;

  let balance = input.currentBalance;
  let salary = input.annualSalary;
  let totalEmployeeContributions = 0;
  let totalEmployerMatch = 0;
  let yearsCappedAtElectiveLimit = 0;
  let catchUpYears = 0;
  const years: FourOhThreeBYear[] = [];

  for (let index = 0; index < yearsToRetirement; index += 1) {
    if (index > 0) {
      salary *= raiseFactor;
    }

    const age = input.currentAge + index;
    const electiveLimit = electiveDeferralLimitEstimate(age);
    if (electiveLimit === null) return emptyResult;

    const uncappedEmployeeContribution = employeeContributionAmount(
      salary,
      input.employeeContributionPercent,
      input.employeeContributionDollars,
      input.useDollarContribution,
    );
    if (uncappedEmployeeContribution === null) return emptyResult;

    const employeeContribution = Math.min(uncappedEmployeeContribution, electiveLimit);
    const employerMatch = employerMatchAmount(
      employeeContribution,
      salary,
      input.employerMatchPercent,
      input.employerMatchSalaryCapPercent,
    );
    if (employerMatch === null) return emptyResult;

    const cappedAtElectiveLimit = uncappedEmployeeContribution > electiveLimit;
    const catchUpApplies = age >= CATCH_UP_AGE;
    if (cappedAtElectiveLimit) yearsCappedAtElectiveLimit += 1;
    if (catchUpApplies) catchUpYears += 1;

    balance = (balance + employeeContribution + employerMatch) * growthFactor;
    totalEmployeeContributions += employeeContribution;
    totalEmployerMatch += employerMatch;

    years.push({
      year: index + 1,
      age,
      salary,
      electiveLimit,
      employeeContribution,
      employerMatch,
      uncappedEmployeeContribution,
      cappedAtElectiveLimit,
      catchUpApplies,
      endingBalance: balance,
    });
  }

  const estimatedGrowth =
    balance - input.currentBalance - totalEmployeeContributions - totalEmployerMatch;

  return {
    valid: true,
    workingYears: yearsToRetirement,
    projectedBalance: balance,
    totalEmployeeContributions,
    totalEmployerMatch,
    estimatedGrowth,
    yearsCappedAtElectiveLimit,
    catchUpYears,
    years,
  };
}
