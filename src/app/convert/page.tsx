import type { Metadata } from "next";
import { CategoryPage } from "@/components/CategoryPage";
import { publicPageMetadata } from "@/lib/site";

export const metadata: Metadata = {
  title: "Convert Tools",
  description:
    "Free file converters that run in your browser, including a PNG to JPG converter, Excel to PDF, HEIC to PNG, and HEIC to PDF. Nothing is uploaded.",
  ...publicPageMetadata("/convert"),
};

export default function ConvertHubPage() {
  return <CategoryPage categoryId="convert" />;
}
