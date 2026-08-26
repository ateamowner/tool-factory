import Link from "next/link";
import type { Tool } from "@/lib/tools";
import { CATEGORIES } from "@/lib/tools";

export function ToolCard({
  tool,
  featured = false,
}: {
  tool: Tool;
  featured?: boolean;
}) {
  const category = CATEGORIES[tool.category];

  return (
    <article
      className={`h-full rounded-2xl border border-line bg-card ${featured ? "card-glow" : ""}`}
    >
      <Link href={tool.href} className="relative z-10 flex h-full flex-col p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mint">
          {category.name}
        </p>
        <h3 className="mt-3 text-xl font-semibold tracking-tight text-text">
          {tool.title}
        </h3>
        <p className="mt-3 flex-1 text-sm leading-6 text-muted">{tool.description}</p>
        <p className="mt-6 text-sm font-medium text-mint">
          {tool.cta} →
        </p>
      </Link>
    </article>
  );
}
