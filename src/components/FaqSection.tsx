import type { FaqItem } from "@/lib/faq-schema";

export function FaqSection({ faqs }: { faqs: FaqItem[] }) {
  return (
    <section className="mt-16 max-w-3xl" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">
        Frequently asked questions
      </h2>
      <div className="mt-8 space-y-8">
        {faqs.map((faq) => (
          <div key={faq.question}>
            <h3 className="text-base font-semibold tracking-tight text-text sm:text-lg">
              {faq.question}
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted sm:text-[15px]">{faq.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
