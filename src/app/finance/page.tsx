import type { Metadata } from "next";
import { CategoryPage } from "@/components/CategoryPage";

export const metadata: Metadata = {
  title: "Finance Tools",
  description:
    "Free finance calculators that run in your browser, including a mortgage recast calculator, an emergency fund calculator, a paycheck calculator hourly, and a stock average calculator for weighted average cost.",
};

export default function FinanceHubPage() {
  return <CategoryPage categoryId="finance" />;
}
