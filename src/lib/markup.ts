export type MarkupMode = "cost_markup" | "cost_price" | "cost_margin";

export type MarkupStatus = "ok" | "invalid" | "cost_required" | "margin_unreachable";

export type MarkupInput = {
  mode: MarkupMode;
  cost: number;
  markupPercent: number;
  sellingPrice: number;
  marginPercent: number;
};

export type MarkupResult = {
  status: MarkupStatus;
  valid: boolean;
  error: string | null;
  mode: MarkupMode;
  cost: number | null;
  sellingPrice: number | null;
  profit: number | null;
  markupPercent: number | null;
  marginPercent: number | null;
};

const emptyResult = (status: MarkupStatus, error: string, mode: MarkupMode): MarkupResult => ({
  status,
  valid: false,
  error,
  mode,
  cost: null,
  sellingPrice: null,
  profit: null,
  markupPercent: null,
  marginPercent: null,
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

/** Markup % = ((selling price − cost) / cost) × 100. Requires cost > 0. */
export function markupPercentFromPrice(cost: number, sellingPrice: number): number {
  return ((sellingPrice - cost) / cost) * 100;
}

/** Margin % = ((selling price − cost) / selling price) × 100. Requires selling > 0. */
export function marginPercentFromPrice(cost: number, sellingPrice: number): number {
  return ((sellingPrice - cost) / sellingPrice) * 100;
}

/** Selling price = cost × (1 + markup % / 100). */
export function sellingFromMarkup(cost: number, markupPercent: number): number {
  return cost * (1 + markupPercent / 100);
}

/** Selling price = cost / (1 − margin % / 100). Requires margin < 100. */
export function sellingFromMargin(cost: number, marginPercent: number): number {
  return cost / (1 - marginPercent / 100);
}

export function computeMarkup(input: MarkupInput): MarkupResult {
  const mode = input.mode;
  if (mode !== "cost_markup" && mode !== "cost_price" && mode !== "cost_margin") {
    return emptyResult("invalid", "Choose a calculation mode.", "cost_markup");
  }

  if (!isNonNegativeFinite(input.cost)) {
    return emptyResult(
      "invalid",
      "Enter a finite, non-negative cost.",
      mode,
    );
  }

  if (input.cost <= 0) {
    return emptyResult(
      "cost_required",
      "Cost must be greater than 0 — markup is a percent of cost.",
      mode,
    );
  }

  const cost = input.cost;

  if (mode === "cost_markup") {
    if (!isNonNegativeFinite(input.markupPercent)) {
      return emptyResult(
        "invalid",
        "Enter a finite, non-negative markup percent.",
        mode,
      );
    }

    const markupPercent = input.markupPercent;
    const sellingPrice = sellingFromMarkup(cost, markupPercent);
    const profit = sellingPrice - cost;
    const marginPercent =
      sellingPrice > 0 ? marginPercentFromPrice(cost, sellingPrice) : null;

    return {
      status: "ok",
      valid: true,
      error: null,
      mode,
      cost,
      sellingPrice,
      profit,
      markupPercent,
      marginPercent,
    };
  }

  if (mode === "cost_price") {
    if (!isNonNegativeFinite(input.sellingPrice)) {
      return emptyResult(
        "invalid",
        "Enter a finite selling price of 0 or more.",
        mode,
      );
    }

    const sellingPrice = input.sellingPrice;
    const profit = sellingPrice - cost;
    const markupPercent = markupPercentFromPrice(cost, sellingPrice);
    const marginPercent =
      sellingPrice > 0 ? marginPercentFromPrice(cost, sellingPrice) : null;

    return {
      status: "ok",
      valid: true,
      error: null,
      mode,
      cost,
      sellingPrice,
      profit,
      markupPercent,
      marginPercent,
    };
  }

  if (!isNonNegativeFinite(input.marginPercent)) {
    return emptyResult(
      "invalid",
      "Enter a finite, non-negative desired margin percent.",
      mode,
    );
  }

  if (input.marginPercent >= 100) {
    return emptyResult(
      "margin_unreachable",
      "Desired margin must be less than 100%. A 100% margin on selling price would require an infinite price.",
      mode,
    );
  }

  const marginPercent = input.marginPercent;
  const sellingPrice = sellingFromMargin(cost, marginPercent);
  const profit = sellingPrice - cost;
  const markupPercent = markupPercentFromPrice(cost, sellingPrice);

  return {
    status: "ok",
    valid: true,
    error: null,
    mode,
    cost,
    sellingPrice,
    profit,
    markupPercent,
    marginPercent,
  };
}
