import { ExternalLink } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";
import { track } from "@/lib/track";

type LiveSite = { id: string; name: string; text: string; url: string };

/** Sites de clientes publicados com autorização. Diferente dos prints do portfólio, aqui os nomes são reais. */
const sites: LiveSite[] = [
  {
    id: "nosso-bistro",
    name: "Nosso Bistrô",
    text: "Bistrô e cafeteria em Ilhéus: cardápio digital e pedidos de delivery direto pelo site.",
    url: "https://nossobistro.vercel.app/",
  },
  {
    id: "pasta-brasiliana",
    name: "Pasta Brasiliana",
    text: "Massas italianas em Ilhéus: cardápio online e pedidos de delivery sem depender de aplicativo.",
    url: "https://pastabrasiliana.vercel.app/",
  },
];

export function LiveSites() {
  const root = useReveal<HTMLElement>("[data-reveal]", { stagger: 0.12 });
  return (
    <section id="projetos-no-ar" ref={root} aria-labelledby="projetos-no-ar-titulo" className="section scroll-mt-16 border-t border-paper-line">
      <div className="container">
        <p className="eyebrow">No ar</p>
        <h2 id="projetos-no-ar-titulo" className="mt-2 max-w-2xl text-3xl uppercase sm:text-5xl">
          Projetos em funcionamento
        </h2>
        <p className="mt-3 max-w-2xl text-ink-soft">Sites de restaurantes que desenvolvemos e que estão recebendo pedidos agora.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {sites.map((s) => (
            <div key={s.id} data-reveal className="flex flex-col rounded-2xl border border-paper-line bg-paper-card p-6">
              <h3 className="text-xl font-bold leading-snug">{s.name}</h3>
              <p className="mt-2 flex-1 text-ink-soft">{s.text}</p>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("site_click", { id: s.id })}
                className="btn-primary mt-6 self-start"
              >
                Ver site
                <ExternalLink className="h-4 w-4" aria-hidden />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
