export type TipRoundMode = "none" | "total" | "per-person";

export type TipInput = {
  billAmount: number;
  tipPercent: number;
  people: number;
  roundMode: TipRoundMode;
};

export type TipResult = {
  valid: boolean;
  error: string | null;
  billAmount: number | null;
  tipPercent: number | null;
  people: number | null;
  roundMode: TipRoundMode | null;
  tipAmount: number | null;
  total: number | null;
  tipPerPerson: number | null;
  totalPerPerson: number | null;
  effectiveTipPercent: number | null;
  roundedUp: boolean;
  summary: string | null;
};

export const TIP_PRESETS = [15, 18, 20, 25] as const;
export const DEFAULT_TIP_PERCENT = 18;
export const MAX_BILL = 1_000_000;
export const MAX_TIP_PERCENT = 100;
export const MAX_PEOPLE = 100;

const emptyResult = (error: string): TipResult => ({
  valid: false,
  error,
  billAmount: null,
  tipPercent: null,
  people: null,
  roundMode: null,
  tipAmount: null,
  total: null,
  tipPerPerson: null,
  totalPerPerson: null,
  effectiveTipPercent: null,
  roundedUp: false,
  summary: null,
});

/** Strip $, commas, % and spaces. Empty input is NaN so callers can reject it. */
export function parseTipNumber(value: string): number {
  const cleaned = value.replace(/[$,%\s]/g, "");
  if (cleaned === "") return Number.NaN;
  return Number(cleaned);
}

export function formatUsd(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatPercent(value: number): string {
  return `${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}%`;
}

function toCents(value: number): number {
  return Math.round(value * 100);
}

function ceilToDollarCents(cents: number): number {
  return Math.ceil(cents / 100 - 1e-9) * 100;
}

export function computeTip(input: TipInput): TipResult {
  const { billAmount, tipPercent, people, roundMode } = input;

  if (!Number.isFinite(billAmount) || billAmount <= 0) {
    return emptyResult("Enter a bill amount greater than $0.");
  }
  if (billAmount > MAX_BILL) {
    return emptyResult(`Bill amount must be ${formatUsd(MAX_BILL)} or less.`);
  }
  if (!Number.isFinite(tipPercent) || tipPercent < 0) {
    return emptyResult("Enter a tip percentage of 0 or more.");
  }
  if (tipPercent > MAX_TIP_PERCENT) {
    return emptyResult(`Tip percentage must be ${MAX_TIP_PERCENT}% or less.`);
  }
  if (!Number.isFinite(people) || !Number.isInteger(people) || people < 1) {
    return emptyResult("Number of people must be a whole number of 1 or more.");
  }
  if (people > MAX_PEOPLE) {
    return emptyResult(`Number of people must be ${MAX_PEOPLE} or fewer.`);
  }

  const billCents = toCents(billAmount);
  const baseTipCents = Math.round((billCents * tipPercent) / 100);
  let totalCents = billCents + baseTipCents;
  let perPersonCents = totalCents / people;

  if (roundMode === "total") {
    totalCents = ceilToDollarCents(totalCents);
    perPersonCents = totalCents / people;
  } else if (roundMode === "per-person") {
    perPersonCents = ceilToDollarCents(Math.ceil(perPersonCents - 1e-9));
    totalCents = perPersonCents * people;
  }

  const tipCents = totalCents - billCents;
  const roundedUp = totalCents !== billCents + baseTipCents;

  const tipAmount = tipCents / 100;
  const total = totalCents / 100;
  // Per-person values round up to the next cent so the shares always cover the bill.
  const totalPerPerson = Math.ceil(perPersonCents - 1e-9) / 100;
  const tipPerPerson = Math.ceil(tipCents / people - 1e-9) / 100;
  const effectiveTipPercent = Math.round((tipCents / billCents) * 10_000) / 100;

  const result: TipResult = {
    valid: true,
    error: null,
    billAmount: billCents / 100,
    tipPercent,
    people,
    roundMode,
    tipAmount,
    total,
    tipPerPerson,
    totalPerPerson,
    effectiveTipPercent,
    roundedUp,
    summary: null,
  };
  result.summary = formatTipSummary(result);
  return result;
}

export function formatTipSummary(result: TipResult): string | null {
  if (
    !result.valid ||
    result.billAmount === null ||
    result.tipAmount === null ||
    result.total === null
  ) {
    return null;
  }
  const tipPercent = result.tipPercent ?? 0;
  const percentLabel = formatPercent(tipPercent);
  // "An" before vowel-sounding percents (8, 11, 18, 80–89); "A" otherwise.
  const absInt = Math.floor(Math.abs(tipPercent));
  const article =
    absInt === 8 ||
    absInt === 11 ||
    absInt === 18 ||
    (absInt >= 80 && absInt <= 89)
      ? "An"
      : "A";
  const base = `${article} ${percentLabel} tip on ${formatUsd(result.billAmount)} is ${formatUsd(result.tipAmount)}, for a total of ${formatUsd(result.total)}`;
  const rounding = result.roundedUp
    ? ` after rounding up (effective tip ${formatPercent(result.effectiveTipPercent ?? 0)})`
    : "";
  const split =
    result.people && result.people > 1 && result.totalPerPerson !== null
      ? `. Split ${result.people} ways, each person pays ${formatUsd(result.totalPerPerson)}.`
      : ".";
  return `${base}${rounding}${split}`;
}
