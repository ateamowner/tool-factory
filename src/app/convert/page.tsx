import type { Metadata } from "next";
import { CategoryPage } from "@/components/CategoryPage";

export const metadata: Metadata = {
  title: "Convert Tools",
  description:
    "Free file converters that run in your browser, including an Excel to PDF converter, HEIC to PNG, and HEIC to PDF. Nothing is uploaded.",
};

export default function ConvertHubPage() {
  return <CategoryPage categoryId="convert" />;
}
