"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CATEGORIES, CATEGORY_ORDER } from "@/lib/tools";

export function CategoryChips() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!onHome) {
      setActiveId(null);
      return;
    }

    const sections = CATEGORY_ORDER
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => Boolean(node));
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-35% 0px -50% 0px",
        threshold: [0.1, 0.25, 0.5],
      },
    );

    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, [onHome]);

  return (
    <nav aria-label="Categories" className="border-t border-line/80 md:hidden">
      <ul className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-2.5 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {Object.values(CATEGORIES).map((category) => {
          const href = onHome ? `#${category.id}` : category.href;
          const routeActive =
            pathname === category.href || pathname.startsWith(`${category.href}/`);
          const active = onHome ? activeId === category.id : routeActive;
          return (
            <li key={category.id}>
              <Link
                href={href}
                className={`category-chip shrink-0 whitespace-nowrap ${
                  active ? "category-chip-active" : ""
                }`}
                aria-current={active ? "true" : undefined}
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
