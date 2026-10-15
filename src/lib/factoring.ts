import { divisors, formatFactorization, primeFactorize } from "./gcf";

export type NumberKind = "one" | "prime" | "composite";

export type FactoringResult =
  | {
      valid: true;
      n: number;
      primes: [number, number][];
      factorization: string;
      factors: number[];
      factorCount: number;
      kind: NumberKind;
    }
  | { valid: false; error: string };

const MAX_VALUE = 1_000_000_000_000;

/** Factor a single positive whole number: prime factorization, all factors, and prime/composite/1. */
export function computeFactoring(raw: unknown): FactoringResult {
  if (raw === null || raw === undefined || raw === "") {
    return { valid: false, error: "Enter a positive whole number." };
  }
  const n = typeof raw === "number" ? raw : Number(String(raw).trim());
  if (!Number.isFinite(n)) {
    return { valid: false, error: "Use a whole number only (no letters or symbols)." };
  }
  if (!Number.isInteger(n)) {
    return { valid: false, error: "Use a whole number only (no decimals or fractions)." };
  }
  if (n <= 0) {
    return { valid: false, error: "Enter a positive whole number (1 or greater)." };
  }
  if (n > MAX_VALUE) {
    return { valid: false, error: "Use a number up to 1,000,000,000,000." };
  }

  const primes = n >= 2 ? primeFactorize(n) : [];
  const factors = divisors(n);
  let kind: NumberKind;
  if (n === 1) kind = "one";
  else if (primes.length === 1 && primes[0][1] === 1) kind = "prime";
  else kind = "composite";

  return {
    valid: true,
    n,
    primes,
    factorization: formatFactorization(primes),
    factors,
    factorCount: factors.length,
    kind,
  };
}

export { formatFactorization };
