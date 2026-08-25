import type { Metadata } from "next";
import { CategoryPage } from "@/components/CategoryPage";

export const metadata: Metadata = {
  title: "Developer Tools",
  description:
    "Free developer utilities that stay on your device, starting with a UUID generator and online GUID generator.",
};

export default function DevHubPage() {
  return <CategoryPage categoryId="dev" />;
}
