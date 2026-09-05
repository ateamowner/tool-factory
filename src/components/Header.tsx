"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CategoryChips } from "@/components/CategoryChips";
import { HeaderSearch } from "@/components/HeaderSearch";
import { CATEGORIES } from "@/lib/tools";

const nav = Object.values(CATEGORIES).map((category) => ({
  href: category.href,
  label: category.name,
}));

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-ink/90 backdrop-blur">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-4 px-4 py-4 md:grid-cols-[1fr_minmax(16rem,28rem)_1fr] md:px-6">
        <Link href="/" className="justify-self-start text-[17px] font-semibold tracking-tight">
          <span className="text-text">Tool</span>{" "}
          <span className="text-mint">Factory</span>
        </Link>
        <HeaderSearch />
        <nav aria-label="Primary" className="hidden justify-self-end md:block">
          <ul className="flex items-center gap-6 text-sm font-medium">
            {nav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={active ? "text-text" : "text-muted hover:text-text"}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      <CategoryChips />
    </header>
  );
}
