import type { Metadata } from "next";
import { CategoryPage } from "@/components/CategoryPage";

export const metadata: Metadata = {
  title: "Developer Tools",
  description:
    "Free developer utilities that stay on your device, including a UUID generator, online GUID generator, and JWT decoder.",
};

export default function DevHubPage() {
  return <CategoryPage categoryId="dev" />;
}
