import type { Metadata } from "next";
import { CategoryPage } from "@/components/CategoryPage";

export const metadata: Metadata = {
  title: "Convert Tools",
  description:
    "Free file converters that run in your browser, starting with a HEIC to PNG converter. Nothing is uploaded.",
};

export default function ConvertHubPage() {
  return <CategoryPage categoryId="convert" />;
}
