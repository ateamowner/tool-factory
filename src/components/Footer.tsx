import Link from "next/link";
import { SITE_FOOTER_LINE, SITE_NAME } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          <Link href="/" className="text-muted hover:text-text">
            {SITE_NAME}
          </Link>
        </p>
        <p>{SITE_FOOTER_LINE}</p>
      </div>
    </footer>
  );
}
