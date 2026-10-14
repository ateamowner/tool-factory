import type { Metadata } from "next";
import { CategoryPage } from "@/components/CategoryPage";
import { toPublicUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Math Tools",
  description:
    "Free math calculators that run in your browser, including a ratio calculator, a proportion calculator that solves A / B = C / D, and a GCF calculator that finds the greatest common factor. Nothing is uploaded.",
  alternates: { canonical: toPublicUrl("/math") },
};

export default function MathHubPage() {
  return <CategoryPage categoryId="math" />;
}
