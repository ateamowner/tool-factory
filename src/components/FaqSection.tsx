import type { FaqItem } from "@/lib/faq-schema";

export function FaqSection({ faqs }: { faqs: FaqItem[] }) {
  return (
    <section className="mt-12" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="text-2xl font-semibold tracking-tight">
        Frequently asked questions
      </h2>
      <div className="mt-4 divide-y divide-line rounded-2xl border border-line bg-card">
        {faqs.map((faq) => (
          <details key={faq.question} className="group px-4 py-4">
            <summary className="cursor-pointer list-none font-medium marker:content-none">
              <span className="flex items-start justify-between gap-4">
                <span>{faq.question}</span>
                <span aria-hidden="true" className="text-muted group-open:rotate-45">
                  +
                </span>
              </span>
            </summary>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
