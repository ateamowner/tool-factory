import Link from "next/link";
import { CATEGORIES } from "@/lib/tools";

const nav = [
  { href: CATEGORIES.finance.href, label: CATEGORIES.finance.name },
  { href: CATEGORIES.seo.href, label: CATEGORIES.seo.name },
  { href: CATEGORIES.dev.href, label: CATEGORIES.dev.name },
];

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-line/80 bg-canvas/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span
            aria-hidden="true"
            className="grid size-8 place-items-center rounded-lg bg-accent text-sm font-bold text-white"
          >
            TF
          </span>
          <span>Tool Factory</span>
        </Link>
        <nav aria-label="Primary">
          <ul className="flex flex-wrap items-center gap-1 text-sm font-medium">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-full px-3 py-1.5 text-ink/90 hover:bg-accent-soft hover:text-accent"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
