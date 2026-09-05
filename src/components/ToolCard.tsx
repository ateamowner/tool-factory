import Link from "next/link";
import type { Tool } from "@/lib/tools";
import { CATEGORIES } from "@/lib/tools";

export function ToolCard({
  tool,
  featured = false,
  size = "default",
}: {
  tool: Tool;
  featured?: boolean;
  size?: "default" | "featured";
}) {
  const category = CATEGORIES[tool.category];
  const large = size === "featured";
  const benefit = large ? tool.summary : tool.description;

  return (
    <article
      className={`h-full rounded-2xl border border-line bg-card ${featured ? "card-glow" : ""}`}
    >
      <Link
        href={tool.href}
        className={`relative z-10 flex h-full flex-col ${large ? "p-7 sm:p-8" : "p-6"}`}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mint">
          {category.name}
        </p>
        <h3
          className={`mt-3 font-semibold tracking-tight text-text ${large ? "text-2xl" : "text-xl"}`}
        >
          {tool.title}
        </h3>
        <p className="mt-3 flex-1 text-sm leading-6 text-muted">{benefit}</p>
        <span
          className={`btn-primary mt-6 self-start ${large ? "" : "btn-primary-sm"}`}
        >
          {tool.cta}
        </span>
      </Link>
    </article>
  );
}
