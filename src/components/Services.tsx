import { ArrowDown } from "lucide-react";
import { services, type ServiceId } from "@/data/services";
import { useReveal } from "@/hooks/useReveal";

/** O que a Pilum Code faz. Os serviços que têm cases levam ao portfólio já filtrado. */
export function Services({ onPick }: { onPick: (id: ServiceId) => void }) {
  const root = useReveal<HTMLElement>("[data-reveal]", { stagger: 0.1 });
  return (
    <section id="servicos" ref={root} className="section scroll-mt-16 border-t border-paper-line bg-paper-card">
      <div className="container">
        <p className="eyebrow">O que fazemos</p>
        <h2 className="mt-2 max-w-2xl text-3xl uppercase sm:text-5xl">Software do jeito que a sua empresa trabalha</h2>
        <p className="mt-3 max-w-2xl text-ink-soft">
          Para pequenos negócios que querem sair do papel e da planilha, e para empresas que precisam de um sistema que os
          prontos não atendem.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map(({ id, icon: Icon, title, text, examples }) => (
            <div key={id} data-reveal className="flex flex-col rounded-2xl border border-paper-line bg-paper p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink text-paper">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 text-lg font-bold leading-snug">{title}</h3>
              <p className="mt-1.5 text-sm text-ink-soft">{text}</p>
              <ul className="mt-3 space-y-1 text-xs text-ink-mute">
                {examples.map((e) => (
                  <li key={e}>· {e}</li>
                ))}
              </ul>
              {id !== "suporte" && (
                <a
                  href="#portfolio"
                  onClick={(e) => {
                    e.preventDefault();
                    onPick(id);
                  }}
                  className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-accent hover:underline"
                >
                  Ver cases
                  <ArrowDown className="h-3.5 w-3.5" aria-hidden />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
