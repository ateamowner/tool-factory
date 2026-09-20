export type DiscountMode =
  | "list_percent"
  | "list_dollars"
  | "sale_percent"
  | "list_sale"
  | "stacked";

export type DiscountStatus =
  | "ok"
  | "invalid"
  | "price_required"
  | "discount_over_price"
  | "percent_unreachable";

export type DiscountInput = {
  mode: DiscountMode;
  originalPrice: number;
  percentOff: number;
  salePrice: number;
  discountAmount: number;
  firstPercent: number;
  secondPercent: number;
};

export type DiscountResult = {
  status: DiscountStatus;
  valid: boolean;
  error: string | null;
  mode: DiscountMode;
  originalPrice: number | null;
  percentOff: number | null;
  discountAmount: number | null;
  salePrice: number | null;
  youSavePercent: number | null;
  firstPercent: number | null;
  secondPercent: number | null;
  afterFirstPrice: number | null;
  effectivePercent: number | null;
};

const MODES: DiscountMode[] = [
  "list_percent",
  "list_dollars",
  "sale_percent",
  "list_sale",
  "stacked",
];

const emptyResult = (
  status: DiscountStatus,
  error: string,
  mode: DiscountMode,
): DiscountResult => ({
  status,
  valid: false,
  error,
  mode,
  originalPrice: null,
  percentOff: null,
  discountAmount: null,
  salePrice: null,
  youSavePercent: null,
  firstPercent: null,
  secondPercent: null,
  afterFirstPrice: null,
  effectivePercent: null,
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

/** Discount $ = original × (discount % / 100). */
export function discountFromPercent(originalPrice: number, percentOff: number): number {
  return originalPrice * (percentOff / 100);
}

/** Sale price = original − discount. */
export function saleFromDiscount(originalPrice: number, discountAmount: number): number {
  return originalPrice - discountAmount;
}

/** Sale price = original × (1 − discount % / 100). */
export function saleFromPercent(originalPrice: number, percentOff: number): number {
  return originalPrice * (1 - percentOff / 100);
}

/** Discount % = ((original − sale price) / original) × 100. Requires original > 0. */
export function percentFromSale(originalPrice: number, salePrice: number): number {
  return ((originalPrice - salePrice) / originalPrice) * 100;
}

/** Discount % = (discount $ / original) × 100. Requires original > 0. */
export function percentFromDiscount(originalPrice: number, discountAmount: number): number {
  return (discountAmount / originalPrice) * 100;
}

/** Original = sale / (1 − discount % / 100). Requires percent < 100. */
export function originalFromSalePercent(salePrice: number, percentOff: number): number {
  return salePrice / (1 - percentOff / 100);
}

/** Combined effective % = first + second − (first × second / 100). */
export function effectiveStackedPercent(firstPercent: number, secondPercent: number): number {
  return firstPercent + secondPercent - (firstPercent * secondPercent) / 100;
}

export function applyStackedDiscounts(
  originalPrice: number,
  firstPercent: number,
  secondPercent: number,
): { afterFirstPrice: number; salePrice: number; discountAmount: number; effectivePercent: number } {
  const afterFirstPrice = saleFromPercent(originalPrice, firstPercent);
  const salePrice = saleFromPercent(afterFirstPrice, secondPercent);
  const discountAmount = originalPrice - salePrice;
  const effectivePercent = effectiveStackedPercent(firstPercent, secondPercent);

  return { afterFirstPrice, salePrice, discountAmount, effectivePercent };
}

function okResult(
  mode: DiscountMode,
  values: {
    originalPrice: number;
    percentOff: number;
    discountAmount: number;
    salePrice: number;
    firstPercent?: number | null;
    secondPercent?: number | null;
    afterFirstPrice?: number | null;
    effectivePercent?: number | null;
  },
): DiscountResult {
  const youSavePercent = values.effectivePercent ?? values.percentOff;

  return {
    status: "ok",
    valid: true,
    error: null,
    mode,
    originalPrice: values.originalPrice,
    percentOff: values.percentOff,
    discountAmount: values.discountAmount,
    salePrice: values.salePrice,
    youSavePercent,
    firstPercent: values.firstPercent ?? null,
    secondPercent: values.secondPercent ?? null,
    afterFirstPrice: values.afterFirstPrice ?? null,
    effectivePercent: values.effectivePercent ?? null,
  };
}

function rejectPercentOver100(percentOff: number, mode: DiscountMode, label: string): DiscountResult | null {
  if (percentOff > 100) {
    return emptyResult(
      "discount_over_price",
      `${label} must be 100% or less. 100% off makes the sale price $0.`,
      mode,
    );
  }
  return null;
}

export function computeDiscount(input: DiscountInput): DiscountResult {
  const mode = input.mode;
  if (!MODES.includes(mode)) {
    return emptyResult("invalid", "Choose a calculation mode.", "list_percent");
  }

  if (mode === "sale_percent") {
    if (!isNonNegativeFinite(input.salePrice)) {
      return emptyResult("invalid", "Enter a finite sale price of 0 or more.", mode);
    }

    if (input.salePrice <= 0) {
      return emptyResult(
        "price_required",
        "Sale price must be greater than 0 to reverse a discount percent back to the original price.",
        mode,
      );
    }

    if (!isNonNegativeFinite(input.percentOff)) {
      return emptyResult("invalid", "Enter a finite, non-negative discount percent.", mode);
    }

    if (input.percentOff >= 100) {
      return emptyResult(
        "percent_unreachable",
        "Discount percent must be less than 100% to reverse to an original price. 100% off would imply an infinite list price.",
        mode,
      );
    }

    const salePrice = input.salePrice;
    const percentOff = input.percentOff;
    const originalPrice = originalFromSalePercent(salePrice, percentOff);
    const discountAmount = originalPrice - salePrice;

    return okResult(mode, { originalPrice, percentOff, discountAmount, salePrice });
  }

  if (!isNonNegativeFinite(input.originalPrice)) {
    return emptyResult("invalid", "Enter a finite, non-negative original (list) price.", mode);
  }

  if (input.originalPrice <= 0) {
    return emptyResult(
      "price_required",
      "Original price must be greater than 0 — a discount is a percent or dollar amount of the list price.",
      mode,
    );
  }

  const originalPrice = input.originalPrice;

  if (mode === "list_percent") {
    if (!isNonNegativeFinite(input.percentOff)) {
      return emptyResult("invalid", "Enter a finite, non-negative discount percent.", mode);
    }

    const over = rejectPercentOver100(input.percentOff, mode, "Discount percent");
    if (over) return over;

    const percentOff = input.percentOff;
    const discountAmount = discountFromPercent(originalPrice, percentOff);
    const salePrice = saleFromDiscount(originalPrice, discountAmount);

    return okResult(mode, { originalPrice, percentOff, discountAmount, salePrice });
  }

  if (mode === "list_dollars") {
    if (!isNonNegativeFinite(input.discountAmount)) {
      return emptyResult("invalid", "Enter a finite discount amount of 0 or more.", mode);
    }

    if (input.discountAmount > originalPrice) {
      return emptyResult(
        "discount_over_price",
        "Discount cannot be larger than the original price.",
        mode,
      );
    }

    const discountAmount = input.discountAmount;
    const salePrice = saleFromDiscount(originalPrice, discountAmount);
    const percentOff = percentFromDiscount(originalPrice, discountAmount);

    return okResult(mode, { originalPrice, percentOff, discountAmount, salePrice });
  }

  if (mode === "list_sale") {
    if (!isNonNegativeFinite(input.salePrice)) {
      return emptyResult("invalid", "Enter a finite sale price of 0 or more.", mode);
    }

    if (input.salePrice > originalPrice) {
      return emptyResult(
        "discount_over_price",
        "Sale price cannot be higher than the original price — that is a markup, not a discount.",
        mode,
      );
    }

    const salePrice = input.salePrice;
    const discountAmount = originalPrice - salePrice;
    const percentOff = percentFromSale(originalPrice, salePrice);

    return okResult(mode, { originalPrice, percentOff, discountAmount, salePrice });
  }

  if (!isNonNegativeFinite(input.firstPercent)) {
    return emptyResult("invalid", "Enter a finite, non-negative first discount percent.", mode);
  }

  if (!isNonNegativeFinite(input.secondPercent)) {
    return emptyResult("invalid", "Enter a finite, non-negative second discount percent.", mode);
  }

  const firstOver = rejectPercentOver100(input.firstPercent, mode, "First discount percent");
  if (firstOver) return firstOver;

  const secondOver = rejectPercentOver100(input.secondPercent, mode, "Second discount percent");
  if (secondOver) return secondOver;

  const firstPercent = input.firstPercent;
  const secondPercent = input.secondPercent;
  const stacked = applyStackedDiscounts(originalPrice, firstPercent, secondPercent);

  return okResult(mode, {
    originalPrice,
    percentOff: stacked.effectivePercent,
    discountAmount: stacked.discountAmount,
    salePrice: stacked.salePrice,
    firstPercent,
    secondPercent,
    afterFirstPrice: stacked.afterFirstPrice,
    effectivePercent: stacked.effectivePercent,
  });
}
