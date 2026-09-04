import type { Metadata } from "next";
import { CategoryPage } from "@/components/CategoryPage";
import { toPublicUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Developer Tools",
  description:
    "Free developer utilities that stay on your device, including a UUID generator, online GUID generator, JWT decoder, and cron expression generator.",
  alternates: { canonical: toPublicUrl("/dev") },
};

export default function DevHubPage() {
  return <CategoryPage categoryId="dev" />;
}
