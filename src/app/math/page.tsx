import type { Metadata } from "next";
import { CategoryPage } from "@/components/CategoryPage";
import { toPublicUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Math Tools",
  description:
    "Free math calculators that run in your browser, including a ratio calculator, a proportion calculator that solves A / B = C / D, a GCF calculator that finds the greatest common factor, a factoring calculator for prime factorization, a slope calculator from two points, a standard deviation calculator, a mean median mode calculator with range, a system of equations calculator for 2x2 and 3x3 systems, a percentage calculator for percents and percent change, a long division calculator with steps, an LCM calculator for the least common multiple, a quadratic formula calculator with real and complex roots, a square root calculator that simplifies radicals, a scientific notation calculator with E notation, an exponent calculator for negative and fractional powers, a rounding calculator for decimal places and the nearest 10, 100 or 1,000, a significant figures calculator that counts and rounds sig figs, and a circumference calculator for the radius, diameter, circumference and area of a circle. Nothing is uploaded.",
  alternates: { canonical: toPublicUrl("/math") },
};

export default function MathHubPage() {
  return <CategoryPage categoryId="math" />;
}
