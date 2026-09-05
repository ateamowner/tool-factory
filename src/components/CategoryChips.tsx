"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES } from "@/lib/tools";

export function CategoryChips() {
  const pathname = usePathname();
  const onHome = pathname === "/";

  return (
    <nav aria-label="Categories" className="border-t border-line/80 md:hidden">
      <ul className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-2.5 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {Object.values(CATEGORIES).map((category) => {
          const href = onHome ? `#${category.id}` : category.href;
          const active =
            pathname === category.href || pathname.startsWith(`${category.href}/`);
          return (
            <li key={category.id}>
              <Link
                href={href}
                className={`chip inline-flex shrink-0 whitespace-nowrap ${
                  active ? "border-mint/40 text-text" : "text-muted"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {category.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
