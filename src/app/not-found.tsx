import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-[650] tracking-tight">Page not found</h1>
      <p className="mt-3 max-w-xl text-muted">
        That URL is not a published tool. Tool Factory only ships unique keyword
        pages — start from the homepage or a category hub.
      </p>
      <p className="mt-6">
        <Link href="/" className="btn-primary">
          Back to all tools
        </Link>
      </p>
    </main>
  );
}
