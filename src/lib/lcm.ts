
export type LcmResult =
  | {
      valid: true;
      numbers: number[];
      lcm: number;
      gcf: number;
      factorizations: { n: number; primes: [number, number][] }[];
      /** Highest power of each prime used in the LCM, ascending by prime. */
      highestPowers: [number, number][];
      /** Running pairwise steps: lcm(a, b) = a × b / gcf(a, b). */
      steps: { a: number; b: number; gcf: number; lcm: number }[];
      /** First multiples of each number, for the listing-multiples method (only for small LCMs). */
      multiples: { n: number; list: number[] }[];
    }
  | { valid: false; error: string };

const MAX_VALUE = 1_000_000_000;

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

function gcfOfTwo(a: number, b: number): number {
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

/** Least common multiple of 2 to 20 positive whole numbers with prime factorization and step-by-step work. */
export function computeLcm(values: number[]): LcmResult {
  if (values.length < 2) return { valid: false, error: "Enter at least two whole numbers." };
  if (values.length > 20) return { valid: false, error: "Enter up to 20 numbers." };
  if (values.some((v) => !Number.isInteger(v))) return { valid: false, error: "Use whole numbers only (no decimals or fractions)." };
  const numbers = values.map((v) => Math.abs(v));
  if (numbers.some((v) => v === 0)) return { valid: false, error: "The LCM is only defined for non-zero numbers. Remove any zeros." };
  if (numbers.some((v) => v > MAX_VALUE)) return { valid: false, error: "Use numbers up to 1,000,000,000." };

  const steps: { a: number; b: number; gcf: number; lcm: number }[] = [];
  let lcm = numbers[0];
  let gcf = numbers[0];
  for (let i = 1; i < numbers.length; i++) {
    const g = gcfOfTwo(lcm, numbers[i]);
    const next = (lcm / g) * numbers[i];
    if (!Number.isSafeInteger(next)) return { valid: false, error: "The LCM is too large to compute exactly. Use smaller numbers." };
    steps.push({ a: lcm, b: numbers[i], gcf: g, lcm: next });
    lcm = next;
    gcf = gcfOfTwo(gcf, numbers[i]);
  }

  const factorizations = numbers.map((n) => ({ n, primes: n >= 2 ? primeFactorize(n) : [] }));
  const powers = new Map<number, number>();
  for (const f of factorizations) for (const [p, e] of f.primes) powers.set(p, Math.max(powers.get(p) ?? 0, e));
  const highestPowers = [...powers.entries()].sort((a, b) => a[0] - b[0]);

  const multiples =
    lcm <= 10_000 && numbers.every((n) => lcm / n <= 12)
      ? numbers.map((n) => ({ n, list: Array.from({ length: lcm / n }, (_, k) => n * (k + 1)) }))
      : [];

  return { valid: true, numbers, lcm, gcf, factorizations, highestPowers, steps, multiples };
}

export function formatHighestPowers(powers: [number, number][]): string {
  return formatFactorization(powers);
}
