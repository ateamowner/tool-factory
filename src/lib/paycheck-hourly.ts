export type PayMode = "hourly" | "salary";

export type PayFrequency = "weekly" | "biweekly" | "semimonthly" | "monthly";

export const PERIODS_PER_YEAR: Record<PayFrequency, number> = {
  weekly: 52,
  biweekly: 26,
  semimonthly: 24,
  monthly: 12,
};

export const PAY_FREQUENCIES: { id: PayFrequency; label: string }[] = [
  { id: "weekly", label: "Weekly" },
  { id: "biweekly", label: "Biweekly" },
  { id: "semimonthly", label: "Semimonthly" },
  { id: "monthly", label: "Monthly" },
];

export type PaycheckInput = {
  mode: PayMode;
  hourlyRate: number;
  annualSalary: number;
  hoursPerWeek: number;
  frequency: PayFrequency;
  includeOvertime: boolean;
};

export type PaycheckResult = {
  valid: boolean;
  weeklyGross: number | null;
  monthlyGross: number | null;
  annualGross: number | null;
  perPaycheck: number | null;
  regularHours: number | null;
  overtimeHours: number | null;
  hourlyEquivalent: number | null;
};

const emptyResult: PaycheckResult = {
  valid: false,
  weeklyGross: null,
  monthlyGross: null,
  annualGross: null,
  perPaycheck: null,
  regularHours: null,
  overtimeHours: null,
  hourlyEquivalent: null,
};

function isPositiveFinite(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

export function computePaycheck(input: PaycheckInput): PaycheckResult {
  const hours = input.hoursPerWeek;
  const periods = PERIODS_PER_YEAR[input.frequency];

  if (!isPositiveFinite(hours) || !periods) {
    return emptyResult;
  }

  if (input.mode === "hourly") {
    if (!isPositiveFinite(input.hourlyRate)) {
      return emptyResult;
    }

    const regularHours = input.includeOvertime ? Math.min(hours, 40) : hours;
    const overtimeHours = input.includeOvertime ? Math.max(0, hours - 40) : 0;
    const weeklyGross =
      regularHours * input.hourlyRate + overtimeHours * input.hourlyRate * 1.5;
    const annualGross = weeklyGross * 52;
    const monthlyGross = annualGross / 12;
    const perPaycheck = annualGross / periods;

    return {
      valid: true,
      weeklyGross,
      monthlyGross,
      annualGross,
      perPaycheck,
      regularHours,
      overtimeHours,
      hourlyEquivalent: input.hourlyRate,
    };
  }

  if (!isPositiveFinite(input.annualSalary)) {
    return emptyResult;
  }

  const annualGross = input.annualSalary;
  const weeklyGross = annualGross / 52;
  const monthlyGross = annualGross / 12;
  const perPaycheck = annualGross / periods;

  return {
    valid: true,
    weeklyGross,
    monthlyGross,
    annualGross,
    perPaycheck,
    regularHours: hours,
    overtimeHours: 0,
    hourlyEquivalent: annualGross / (hours * 52),
  };
}
