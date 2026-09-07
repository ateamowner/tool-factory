import type { Metadata } from "next";
import { CategoryPage } from "@/components/CategoryPage";
import { publicPageMetadata } from "@/lib/site";

export const metadata: Metadata = {
  title: "Developer Tools",
  description:
    "Free developer utilities that stay on your device, including a UUID generator, online GUID generator, JWT decoder, and cron expression generator.",
  ...publicPageMetadata("/dev"),
};

export default function DevHubPage() {
  return <CategoryPage categoryId="dev" />;
}
