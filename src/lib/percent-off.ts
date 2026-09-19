export type PercentOffMode = "price_percent" | "price_final" | "price_discount";

export type PercentOffStatus = "ok" | "invalid" | "price_required" | "discount_over_price";

export type PercentOffInput = {
  mode: PercentOffMode;
  originalPrice: number;
  percentOff: number;
  finalPrice: number;
  discountAmount: number;
};

export type PercentOffResult = {
  status: PercentOffStatus;
  valid: boolean;
  error: string | null;
  mode: PercentOffMode;
  originalPrice: number | null;
  percentOff: number | null;
  discountAmount: number | null;
  finalPrice: number | null;
  youSavePercent: number | null;
};

const emptyResult = (
  status: PercentOffStatus,
  error: string,
  mode: PercentOffMode,
): PercentOffResult => ({
  status,
  valid: false,
  error,
  mode,
  originalPrice: null,
  percentOff: null,
  discountAmount: null,
  finalPrice: null,
  youSavePercent: null,
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

/** Discount $ = original × (percent off / 100). */
export function discountFromPercent(originalPrice: number, percentOff: number): number {
  return originalPrice * (percentOff / 100);
}

/** Sale price = original − discount. */
export function finalFromDiscount(originalPrice: number, discountAmount: number): number {
  return originalPrice - discountAmount;
}

/** Percent off = ((original − sale price) / original) × 100. Requires original > 0. */
export function percentFromFinal(originalPrice: number, finalPrice: number): number {
  return ((originalPrice - finalPrice) / originalPrice) * 100;
}

/** Percent off = (discount $ / original) × 100. Requires original > 0. */
export function percentFromDiscount(originalPrice: number, discountAmount: number): number {
  return (discountAmount / originalPrice) * 100;
}

export function computePercentOff(input: PercentOffInput): PercentOffResult {
  const mode = input.mode;
  if (mode !== "price_percent" && mode !== "price_final" && mode !== "price_discount") {
    return emptyResult("invalid", "Choose a calculation mode.", "price_percent");
  }

  if (!isNonNegativeFinite(input.originalPrice)) {
    return emptyResult("invalid", "Enter a finite, non-negative original price.", mode);
  }

  if (input.originalPrice <= 0) {
    return emptyResult(
      "price_required",
      "Original price must be greater than 0 — percent off is a percent of the original price.",
      mode,
    );
  }

  const originalPrice = input.originalPrice;

  if (mode === "price_percent") {
    if (!isNonNegativeFinite(input.percentOff)) {
      return emptyResult("invalid", "Enter a finite, non-negative percent off.", mode);
    }

    if (input.percentOff > 100) {
      return emptyResult(
        "discount_over_price",
        "Percent off must be 100% or less. 100% off makes the sale price $0.",
        mode,
      );
    }

    const percentOff = input.percentOff;
    const discountAmount = discountFromPercent(originalPrice, percentOff);
    const finalPrice = finalFromDiscount(originalPrice, discountAmount);

    return {
      status: "ok",
      valid: true,
      error: null,
      mode,
      originalPrice,
      percentOff,
      discountAmount,
      finalPrice,
      youSavePercent: percentOff,
    };
  }

  if (mode === "price_final") {
    if (!isNonNegativeFinite(input.finalPrice)) {
      return emptyResult("invalid", "Enter a finite sale price of 0 or more.", mode);
    }

    if (input.finalPrice > originalPrice) {
      return emptyResult(
        "discount_over_price",
        "Sale price cannot be higher than the original price — that is a markup, not a percent off.",
        mode,
      );
    }

    const finalPrice = input.finalPrice;
    const discountAmount = originalPrice - finalPrice;
    const percentOff = percentFromFinal(originalPrice, finalPrice);

    return {
      status: "ok",
      valid: true,
      error: null,
      mode,
      originalPrice,
      percentOff,
      discountAmount,
      finalPrice,
      youSavePercent: percentOff,
    };
  }

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
  const finalPrice = finalFromDiscount(originalPrice, discountAmount);
  const percentOff = percentFromDiscount(originalPrice, discountAmount);

  return {
    status: "ok",
    valid: true,
    error: null,
    mode,
    originalPrice,
    percentOff,
    discountAmount,
    finalPrice,
    youSavePercent: percentOff,
  };
}
