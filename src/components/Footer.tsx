import Link from "next/link";
import { CATEGORIES, TOOLS } from "@/lib/tools";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-card">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="font-semibold">Tool Factory</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Free, mobile-first utilities that run entirely in your browser. No
            accounts. Your inputs never leave this device.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Hubs</p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {Object.values(CATEGORIES).map((category) => (
              <li key={category.id}>
                <Link className="text-accent hover:underline" href={category.href}>
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Tools</p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {TOOLS.map((tool) => (
              <li key={tool.href}>
                <Link className="text-accent hover:underline" href={tool.href}>
                  {tool.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-5xl px-4 py-4 text-xs text-muted">
          © {new Date().getFullYear()} Tool Factory. All tools are client-side.
        </p>
      </div>
    </footer>
  );
}
