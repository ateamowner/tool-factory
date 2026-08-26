export function AdSlot() {
  return (
    <aside className="px-4 pb-4 sm:px-6" aria-label="Advertisement">
      <div className="mx-auto max-w-6xl">
        <div
          className="ad-slot flex min-h-20 items-center justify-center rounded-2xl px-4 py-8 text-center"
          data-ad-slot="placeholder"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            AD SLOT
          </p>
        </div>
      </div>
    </aside>
  );
}
