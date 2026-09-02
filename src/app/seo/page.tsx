import type { Metadata } from "next";
import { CategoryPage } from "@/components/CategoryPage";
import { toPublicUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "SEO Tools",
  description:
    "Free SEO and campaign tools in your browser, including a schema markup validator, schema checker, robots.txt builder, robot.txt generator, and UTM builder.",
  alternates: { canonical: toPublicUrl("/seo") },
};

export default function SeoHubPage() {
  return <CategoryPage categoryId="seo" />;
}
