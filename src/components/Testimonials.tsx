import { Quote } from "lucide-react";

type Testimonial = {
  /** Tipo de negócio, ex.: "Marmita fitness". */
  business: string;
  /** Nome (ou só o primeiro nome) de quem autorizou a publicação. */
  author: string;
  /** Texto do depoimento, exatamente como autorizado. */
  quote: string;
};

/**
 * Preencha `author` e `quote` com depoimentos AUTORIZADOS.
 * Enquanto um item estiver vazio ele não aparece, e se nenhum estiver preenchido a seção inteira some da página.
 */
const testimonials: Testimonial[] = [
  // TODO(fabio): inserir depoimento autorizado (marmita fitness)
  { business: "Marmita fitness", author: "", quote: "" },
  // TODO(fabio): inserir depoimento autorizado (delivery de comida italiana)
  { business: "Delivery de comida italiana", author: "", quote: "" },
  // TODO(fabio): inserir depoimento autorizado (bistrô/cafeteria)
  { business: "Bistrô e cafeteria", author: "", quote: "" },
];

export function Testimonials() {
  const ready = testimonials.filter((t) => t.quote.trim() && t.author.trim());
  if (ready.length === 0) return null;

  return (
    <section aria-labelledby="quem-usa" className="section border-t border-paper-line bg-paper-card">
      <div className="container">
        <p className="eyebrow">Quem já usa</p>
        <h2 id="quem-usa" className="mt-2 max-w-2xl text-3xl uppercase sm:text-5xl">
          O que dizem os donos
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {ready.map((t) => (
            <figure key={`${t.business}-${t.author}`} className="flex flex-col rounded-2xl border border-paper-line bg-paper p-6">
              <Quote className="h-6 w-6 text-accent" aria-hidden />
              <blockquote className="mt-3 flex-1 text-ink-soft">{t.quote}</blockquote>
              <figcaption className="mt-4 text-sm">
                <span className="font-semibold text-ink">{t.author}</span>
                <span className="text-ink-mute"> · {t.business}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
