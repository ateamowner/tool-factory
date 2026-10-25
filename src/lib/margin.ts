export type MarginMode = "cost_price" | "cost_margin";

export type MarginStatus = "ok" | "invalid" | "price_required" | "cost_required" | "margin_unreachable";

export type MarginInput = {
  mode: MarginMode;
  cost: number;
  sellingPrice: number;
  marginPercent: number;
};

export type MarginResult = {
  status: MarginStatus;
  valid: boolean;
  error: string | null;
  mode: MarginMode;
  cost: number | null;
  sellingPrice: number | null;
  profit: number | null;
  marginPercent: number | null;
  markupPercent: number | null;
};

const emptyResult = (status: MarginStatus, error: string, mode: MarginMode): MarginResult => ({
  status,
  valid: false,
  error,
  mode,
  cost: null,
  sellingPrice: null,
  profit: null,
  marginPercent: null,
  markupPercent: null,
});

function isNonNegativeFinite(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
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
  const rounded = Math.round(value * 100) / 100;
  return `${rounded.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: rounded % 1 === 0 ? 0 : 2,
  })}%`;
}

/** Gross margin % = ((selling price − cost) / selling price) × 100. Requires price > 0. */
export function grossMarginPercent(cost: number, sellingPrice: number): number {
  return ((sellingPrice - cost) / sellingPrice) * 100;
}

/** Markup % = ((selling price − cost) / cost) × 100. Requires cost > 0. */
export function markupPercentFromPrice(cost: number, sellingPrice: number): number {
  return ((sellingPrice - cost) / cost) * 100;
}

/** Selling price = cost / (1 − margin % / 100). Requires margin < 100. */
export function priceFromMargin(cost: number, marginPercent: number): number {
  return cost / (1 - marginPercent / 100);
}

/** Markup % that matches a margin %: margin / (1 − margin / 100). */
export function markupFromMargin(marginPercent: number): number {
  return marginPercent / (1 - marginPercent / 100);
}

export function computeMargin(input: MarginInput): MarginResult {
  const mode = input.mode;
  if (mode !== "cost_price" && mode !== "cost_margin") {
    return emptyResult("invalid", "Choose a calculation mode.", "cost_price");
  }

  if (!isNonNegativeFinite(input.cost)) {
    return emptyResult("invalid", "Enter a finite cost of 0 or more.", mode);
  }

  const cost = input.cost;

  if (mode === "cost_price") {
    if (!isNonNegativeFinite(input.sellingPrice)) {
      return emptyResult("invalid", "Enter a finite selling price of 0 or more.", mode);
    }
    if (input.sellingPrice <= 0) {
      return emptyResult(
        "price_required",
        "Selling price must be greater than 0 — margin is a percent of price.",
        mode,
      );
    }
    const sellingPrice = input.sellingPrice;
    return {
      status: "ok",
      valid: true,
      error: null,
      mode,
      cost,
      sellingPrice,
      profit: sellingPrice - cost,
      marginPercent: grossMarginPercent(cost, sellingPrice),
      markupPercent: cost > 0 ? markupPercentFromPrice(cost, sellingPrice) : null,
    };
  }

  if (cost <= 0) {
    return emptyResult(
      "cost_required",
      "Cost must be greater than 0 to solve a selling price from a margin.",
      mode,
    );
  }

  if (!isNonNegativeFinite(input.marginPercent)) {
    return emptyResult("invalid", "Enter a finite, non-negative target margin percent.", mode);
  }

  if (input.marginPercent >= 100) {
    return emptyResult(
      "margin_unreachable",
      "Target margin must be less than 100%. A 100% margin would need an infinite price.",
      mode,
    );
  }

  const marginPercent = input.marginPercent;
  const sellingPrice = priceFromMargin(cost, marginPercent);
  return {
    status: "ok",
    valid: true,
    error: null,
    mode,
    cost,
    sellingPrice,
    profit: sellingPrice - cost,
    marginPercent,
    markupPercent: markupPercentFromPrice(cost, sellingPrice),
  };
}
