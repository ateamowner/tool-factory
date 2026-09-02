import type { Metadata } from "next";
import { CategoryPage } from "@/components/CategoryPage";

export const metadata: Metadata = {
  title: "SEO Tools",
  description:
    "Free SEO and campaign tools in your browser, including a schema markup validator, schema checker, robots.txt builder, robot.txt generator, and UTM builder.",
};

export default function SeoHubPage() {
  return <CategoryPage categoryId="seo" />;
}
