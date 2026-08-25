import type { Metadata } from "next";
import { CategoryPage } from "@/components/CategoryPage";

export const metadata: Metadata = {
  title: "SEO Tools",
  description:
    "Free SEO and campaign tools in your browser, starting with a UTM builder, UTM generator, and UTM link maker.",
};

export default function SeoHubPage() {
  return <CategoryPage categoryId="seo" />;
}
