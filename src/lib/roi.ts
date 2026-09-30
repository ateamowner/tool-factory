export type RoiMode = "cost_final" | "cost_gain";

export type RoiStatus = "ok" | "invalid" | "cost_required";

export type RoiInput = {
  mode: RoiMode;
  initialInvestment: number;
  finalValue: number;
  netProfit: number;
};

export type RoiResult = {
  status: RoiStatus;
  valid: boolean;
  error: string | null;
  mode: RoiMode;
  initialInvestment: number | null;
  finalValue: number | null;
  netProfit: number | null;
  roiPercent: number | null;
};

const MODES: RoiMode[] = ["cost_final", "cost_gain"];

const emptyResult = (
  status: RoiStatus,
  error: string,
  mode: RoiMode,
): RoiResult => ({
  status,
  valid: false,
  error,
  mode,
  initialInvestment: null,
  finalValue: null,
  netProfit: null,
  roiPercent: null,
});

function isFiniteNumber(value: number): boolean {
  return Number.isFinite(value);
}

function isNonNegativeFinite(value: number): boolean {
  return isFiniteNumber(value) && value >= 0;
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
  return `${value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
  })}%`;
}

/** ROI % = ((final value − initial investment) / initial investment) × 100. Requires initial > 0. */
export function roiPercentFromValues(initialInvestment: number, finalValue: number): number {
  return ((finalValue - initialInvestment) / initialInvestment) * 100;
}

/** Net profit = final value − initial investment. */
export function netProfitFromValues(initialInvestment: number, finalValue: number): number {
  return finalValue - initialInvestment;
}

/** Final value = initial investment + net profit. */
export function finalValueFromGain(initialInvestment: number, netProfit: number): number {
  return initialInvestment + netProfit;
}

export function computeRoi(input: RoiInput): RoiResult {
  const mode = input.mode;
  if (!MODES.includes(mode)) {
    return emptyResult("invalid", "Choose a calculation mode.", "cost_final");
  }

  if (!isNonNegativeFinite(input.initialInvestment)) {
    return emptyResult(
      "invalid",
      "Enter a finite, non-negative initial investment.",
      mode,
    );
  }

  if (input.initialInvestment <= 0) {
    return emptyResult(
      "cost_required",
      "Initial investment must be greater than 0 — ROI is a percent of what you put in.",
      mode,
    );
  }

  const initialInvestment = input.initialInvestment;

  if (mode === "cost_final") {
    if (!isNonNegativeFinite(input.finalValue)) {
      return emptyResult(
        "invalid",
        "Enter a finite final value of 0 or more.",
        mode,
      );
    }

    const finalValue = input.finalValue;
    const netProfit = netProfitFromValues(initialInvestment, finalValue);
    const roiPercent = roiPercentFromValues(initialInvestment, finalValue);

    return {
      status: "ok",
      valid: true,
      error: null,
      mode,
      initialInvestment,
      finalValue,
      netProfit,
      roiPercent,
    };
  }

  if (!isFiniteNumber(input.netProfit)) {
    return emptyResult(
      "invalid",
      "Enter a finite net profit (gain can be negative for a loss).",
      mode,
    );
  }

  const netProfit = input.netProfit;
  const finalValue = finalValueFromGain(initialInvestment, netProfit);

  if (finalValue < 0) {
    return emptyResult(
      "invalid",
      "Net profit cannot leave a negative final value. A total loss is −100% ROI (final value $0).",
      mode,
    );
  }

  const roiPercent = roiPercentFromValues(initialInvestment, finalValue);

  return {
    status: "ok",
    valid: true,
    error: null,
    mode,
    initialInvestment,
    finalValue,
    netProfit,
    roiPercent,
  };
}
