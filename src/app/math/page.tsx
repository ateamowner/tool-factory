import type { Metadata } from "next";
import { CategoryPage } from "@/components/CategoryPage";
import { toPublicUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Math Tools",
  description:
    "Free math calculators that run in your browser, starting with a ratio calculator that simplifies ratios and solves A : B = C : D. Nothing is uploaded.",
  alternates: { canonical: toPublicUrl("/math") },
};

export default function MathHubPage() {
  return <CategoryPage categoryId="math" />;
}
