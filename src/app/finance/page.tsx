import type { Metadata } from "next";
import { CategoryPage } from "@/components/CategoryPage";
import { toPublicUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Finance Tools",
  description:
    "Free finance calculators that run in your browser, including a refinance calculator auto loan, a mortgage recast calculator, an emergency fund calculator, a paycheck calculator hourly, and a stock average calculator for weighted average cost.",
  alternates: { canonical: toPublicUrl("/finance") },
};

export default function FinanceHubPage() {
  return <CategoryPage categoryId="finance" />;
}
