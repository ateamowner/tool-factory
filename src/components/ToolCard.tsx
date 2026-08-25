import Link from "next/link";
import type { Tool } from "@/lib/tools";
import { CATEGORIES } from "@/lib/tools";

export function ToolCard({ tool }: { tool: Tool }) {
  const category = CATEGORIES[tool.category];

  return (
    <article className="flex h-full flex-col rounded-2xl border border-line bg-card p-5 shadow-[0_1px_0_rgb(20_35_30/0.04)]">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
        {category.name}
      </p>
      <h3 className="mt-2 text-lg font-semibold tracking-tight">
        <Link className="hover:text-accent" href={tool.href}>
          {tool.title}
        </Link>
      </h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-muted">{tool.description}</p>
      <p className="mt-4">
        <Link
          href={tool.href}
          className="inline-flex rounded-full bg-accent px-3.5 py-1.5 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Open tool
        </Link>
      </p>
    </article>
  );
}
