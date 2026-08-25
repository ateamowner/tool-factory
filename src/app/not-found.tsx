import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-3 max-w-xl text-muted">
        That URL is not a published tool. Tool Factory only ships unique keyword
        pages — start from the homepage or a category hub.
      </p>
      <p className="mt-6">
        <Link
          href="/"
          className="inline-flex rounded-full bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Back to all tools
        </Link>
      </p>
    </main>
  );
}
