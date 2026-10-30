import { MapPin } from "lucide-react";
import { founders, site } from "@/config";
import { useReveal } from "@/hooks/useReveal";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export function About() {
  const root = useReveal<HTMLElement>("[data-reveal]", { stagger: 0.12 });
  return (
    <section id="quem-somos" ref={root} className="section scroll-mt-16 border-t border-paper-line bg-paper-card">
      <div className="container grid gap-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-start">
        <div data-reveal>
          <p className="eyebrow">Quem somos</p>
          <h2 className="mt-2 max-w-xl text-3xl uppercase sm:text-5xl">Uma empresa pequena, de propósito</h2>
          {/* TODO(fabio): revisar o texto institucional. */}
          <div className="mt-5 max-w-xl space-y-3 text-ink-soft">
            <p>
              A {site.brand} desenvolve sistemas, sites e automações sob medida. Começamos atendendo restaurantes, clínicas e
              condomínios da nossa região, e hoje levamos o mesmo cuidado a empresas de qualquer porte.
            </p>
            <p>
              Trabalhamos com poucos projetos por vez: quem conversa com você é quem escreve o código, do primeiro protótipo ao
              suporte depois que o sistema está no ar.
            </p>
          </div>
          <p className="mt-5 flex items-center gap-1.5 text-sm text-ink-mute">
            <MapPin className="h-4 w-4" aria-hidden />
            {site.city}
          </p>
        </div>

        <ul className="grid gap-4">
          {founders.map((f) => (
            <li key={f.name} data-reveal className="flex gap-4 rounded-2xl border border-paper-line bg-paper p-5">
              {f.photo ? (
                <img src={f.photo} alt="" className="h-16 w-16 shrink-0 rounded-full object-cover" />
              ) : (
                <span aria-hidden className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-ink font-mono text-lg font-bold text-paper">
                  {initials(f.name)}
                </span>
              )}
              <div>
                <h3 className="font-bold leading-snug">{f.name}</h3>
                <p className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.14em] text-accent">{f.role}</p>
                <p className="mt-2 text-sm text-ink-soft">{f.bio}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
