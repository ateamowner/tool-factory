export type GcfResult =
  | {
      valid: true;
      numbers: number[];
      gcf: number;
      lcm: number;
      commonFactors: number[];
      factorizations: { n: number; primes: [number, number][] }[];
      steps: { a: number; b: number; q: number; r: number }[];
      coprime: boolean;
    }
  | { valid: false; error: string };

const MAX_VALUE = 1_000_000_000_000;

/** Parse a list like "12, 18 24" into numbers. Returns null if any token is not a number. */
export function parseIntegerList(input: string): number[] | null {
  const tokens = input.split(/[\s,;]+/).filter((t) => t !== "");
  const out: number[] = [];
  for (const t of tokens) {
    const n = Number(t);
    if (!Number.isFinite(n)) return null;
    out.push(n);
  }
  return out;
}

export function gcfOfTwo(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x;
}

/** Prime factorization as [prime, exponent] pairs for an integer >= 2. */
export function primeFactorize(n: number): [number, number][] {
  const out: [number, number][] = [];
  let m = Math.abs(n);
  for (let p = 2; p * p <= m; p += p === 2 ? 1 : 2) {
    let e = 0;
    while (m % p === 0) {
      m /= p;
      e++;
    }
    if (e) out.push([p, e]);
  }
  if (m > 1) out.push([m, 1]);
  return out;
}

export function formatFactorization(primes: [number, number][]): string {
  if (primes.length === 0) return "1";
  return primes.map(([p, e]) => (e > 1 ? `${p}^${e}` : `${p}`)).join(" × ");
}

/** All positive divisors of n, ascending. */
export function divisors(n: number): number[] {
  const m = Math.abs(n);
  const small: number[] = [];
  const large: number[] = [];
  for (let i = 1; i * i <= m; i++) {
    if (m % i === 0) {
      small.push(i);
      if (i !== m / i) large.unshift(m / i);
    }
  }
  return [...small, ...large];
}

/** Greatest common factor (GCD/HCF) of a list of whole numbers, with LCM, common factors, and Euclid steps. */
export function computeGcf(values: number[]): GcfResult {
  if (values.length < 2) return { valid: false, error: "Enter at least two whole numbers." };
  if (values.length > 20) return { valid: false, error: "Enter up to 20 numbers." };
  if (values.some((v) => !Number.isInteger(v))) return { valid: false, error: "Use whole numbers only (no decimals or fractions)." };
  const numbers = values.map((v) => Math.abs(v));
  if (numbers.some((v) => v > MAX_VALUE)) return { valid: false, error: "Use numbers up to 1,000,000,000,000." };
  if (numbers.every((v) => v === 0)) return { valid: false, error: "The GCF of all zeros is undefined. Enter at least one non-zero number." };

  const steps: { a: number; b: number; q: number; r: number }[] = [];
  let g = numbers[0];
  for (let i = 1; i < numbers.length; i++) {
    let x = Math.max(g, numbers[i]);
    let y = Math.min(g, numbers[i]);
    while (y) {
      const q = Math.floor(x / y);
      const r = x % y;
      steps.push({ a: x, b: y, q, r });
      [x, y] = [y, r];
    }
    g = x;
  }

  let lcm = 0;
  if (!numbers.includes(0)) {
    lcm = numbers[0];
    for (let i = 1; i < numbers.length; i++) lcm = (lcm / gcfOfTwo(lcm, numbers[i])) * numbers[i];
  }

  return {
    valid: true,
    numbers,
    gcf: g,
    lcm,
    commonFactors: divisors(g),
    factorizations: numbers.map((n) => ({ n, primes: n >= 2 ? primeFactorize(n) : [] })),
    steps,
    coprime: g === 1,
  };
}
