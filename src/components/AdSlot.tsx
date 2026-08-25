export function AdSlot() {
  return (
    <aside className="border-b border-line" aria-label="Advertisement">
      <div className="mx-auto max-w-5xl px-4 py-3">
        <div
          className="ad-slot flex min-h-20 items-center justify-center rounded-lg px-4 py-5 text-center"
          data-ad-slot="placeholder"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Advertisement
            </p>
            <p className="mt-1 text-sm text-muted">
              Ad slot placeholder. Add your ad network snippet here — do not invent publisher IDs.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
