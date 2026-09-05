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
      className={`h-full rounded-xl border bg-card ${
        large ? "min-h-[22rem] border-mint/20" : "border-line"
      } ${featured ? "card-glow" : ""}`}
    >
      <Link
        href={tool.href}
        className={`relative z-10 flex h-full flex-col ${large ? "p-5" : "p-5"}`}
      >
        <p className="section-label">{category.name}</p>
        <h3 className="mt-3 text-[18px] leading-[26px] font-semibold tracking-tight text-text">
          {tool.title}
        </h3>
        <p className="mt-3 flex-1 text-sm leading-[22px] text-muted">{benefit}</p>
        <span
          className={`btn-card mt-6 ${large ? "w-full sm:w-auto" : "self-start"}`}
        >
          {tool.cta}
        </span>
      </Link>
    </article>
  );
}
