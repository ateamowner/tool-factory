import type { Metadata } from "next";
import { CategoryPage } from "@/components/CategoryPage";
import { toPublicUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Household Tools",
  description:
    "Free household calculators that run in your browser, including a soft wash mix calculator, house sq-ft estimator, vinyl siding cleanability checker, and roof algae quiz.",
  alternates: { canonical: toPublicUrl("/home") },
};

export default function HomeHubPage() {
  return <CategoryPage categoryId="home" />;
}
