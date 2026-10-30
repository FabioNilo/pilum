import { ArrowUpRight, Check, ChevronDown, MessageCircle, Smartphone } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";
import { primaryNiches, projects, type ProjectWithSlides } from "@/data/projects";
import { track } from "@/lib/track";
import { waProps } from "@/lib/whatsapp";
import { Slideshow } from "./Slideshow";

type Props = {
  project: ProjectWithSlides;
  flip: boolean;
  /** Versão mais discreta, sem problema/solução nem detalhes. */
  compact?: boolean;
  /** Âncora do card. O mesmo projeto aparece no portfólio e no setor, então os ids não podem repetir. */
  anchorId?: string;
  /** Rola até outra solução (usado nos links de "talvez não seja para você"). */
  onSee?: (projectId: string, ref: string) => void;
  /** Frase que adapta o sistema ao nicho escolhido (ex.: "Na lanchonete: ..."). */
  note?: string;
  /** Texto do botão de WhatsApp (ex.: "Ver como ficaria na minha lanchonete"). */
  ctaLabel?: string;
};

export function ProjectCard({ project, flip, compact = false, anchorId, onSee, note, ctaLabel }: Props) {
  const p = project;
  // Nichos de comida: "no meu restaurante". Os demais: convite mais geral.
  const food = primaryNiches.includes(p.niche);
  // Problema primeiro, solução depois (só na versão completa).
  const root = useReveal<HTMLElement>("[data-reveal]", { y: 16, duration: 0.5, stagger: 0.35 });
  return (
    <article
      id={anchorId ?? p.id}
      ref={root}
      className={`grid scroll-mt-32 items-start gap-8 rounded-3xl border border-paper-line lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12 ${
        compact ? "bg-paper p-5" : "bg-paper-card p-5 shadow-card sm:p-8"
      }`}
    >
      <div className={flip ? "min-w-0 lg:order-2" : "min-w-0"}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          {p.client?.logo && <img src={p.client.logo} alt="" className="h-7 w-auto" />}
          <p className="eyebrow">{p.client ? p.client.name : p.audience}</p>
          {p.tier && !compact && (
            <span className="rounded-full bg-ink px-2.5 py-1 font-mono text-[0.65rem] font-bold uppercase tracking-[0.12em] text-paper">
              {p.tier.name}
            </span>
          )}
          {/* Todos os sistemas são PWA: instalam na tela inicial do celular. */}
          <span className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent-soft px-2.5 py-1 font-mono text-[0.65rem] font-bold uppercase tracking-[0.12em] text-accent-ink">
            <Smartphone className="h-3 w-3" aria-hidden />
            Instala no celular
          </span>
        </div>
        <h3 className={`mt-2 font-bold leading-tight ${compact ? "text-xl" : "text-2xl sm:text-[1.75rem]"}`}>{p.title}</h3>

        {note && <p className="mt-3 rounded-lg border-l-4 border-accent bg-accent-soft/60 px-3 py-2 text-sm font-medium text-ink">{note}</p>}

        <p className="mt-3 text-[0.95rem] text-ink-soft">{p.whatIs}</p>

        {!compact && (
          <dl className="mt-5 space-y-3 text-[0.95rem]">
            <div data-reveal className="rounded-xl bg-paper px-4 py-3">
              <dt className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-ink-mute">O problema</dt>
              <dd className="mt-0.5 text-ink-soft">{p.problem}</dd>
            </div>
            <div data-reveal className="rounded-xl bg-ink px-4 py-3">
              <dt className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-accent-bright">A solução</dt>
              <dd className="mt-0.5 text-paper">{p.solution}</dd>
            </div>
          </dl>
        )}

        <ul className="mt-5 space-y-2.5">
          {p.benefits.map((b) => (
            <li key={b} className="flex gap-2.5 text-sm text-ink-soft">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
              {b}
            </li>
          ))}
        </ul>

        {!compact && p.extras && p.extras.length > 0 && (
          <p className="mt-4 text-xs leading-relaxed text-ink-mute">
            <span className="font-medium text-ink-soft">Também inclui:</span> {p.extras.join(" · ")}
          </p>
        )}

        {p.result && (
          <p className="mt-4 rounded-lg bg-accent-soft/60 px-3 py-2 text-sm text-ink">
            <span className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.16em] text-accent-ink">Resultado · </span>
            {p.result}
          </p>
        )}

        {!compact && <StackChips stack={p.stack} className="mt-4" />}

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            className="btn-primary"
            {...waProps(
              food
                ? `Olá, Pilum Code! Vi o case "${p.title}" no site de vocês e quero ver como ficaria no meu negócio.`
                : `Olá, Pilum Code! Vi o case "${p.title}" no site de vocês e quero conversar sobre algo parecido.`,
              `card-${p.id}`,
            )}
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            {ctaLabel ?? (food ? "Ver como ficaria no meu negócio" : "Quero algo parecido")}
          </a>
          {p.demoUrl && (
            <a className="btn-ghost" href={p.demoUrl} target="_blank" rel="noopener noreferrer">
              Ver demonstração
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </a>
          )}
        </div>

        {!compact && <Details p={p} onSee={onSee} />}
      </div>

      <div className={flip ? "min-w-0 lg:order-1" : "min-w-0"}>
        <Slideshow slides={p.slides} title={p.title} videoUrl={p.videoUrl} label={p.demoLabel} />
      </div>
    </article>
  );
}

/** Tecnologias do case, discretas: interessam a quem é técnico sem atrapalhar quem não é. */
export function StackChips({ stack, className = "" }: { stack: string[]; className?: string }) {
  if (stack.length === 0) return null;
  return (
    <ul aria-label="Tecnologias" className={`flex flex-wrap gap-1.5 ${className}`}>
      {stack.map((t) => (
        <li key={t} className="rounded-md border border-paper-line bg-paper px-2 py-0.5 font-mono text-[0.68rem] text-ink-mute">
          {t}
        </li>
      ))}
    </ul>
  );
}

function List({ title, items }: { title: string; items?: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <h4 className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.16em] text-ink-mute">{title}</h4>
      <ul className="mt-1.5 list-disc space-y-1 pl-4 text-ink-soft marker:text-accent">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}

function Fact({ title, text }: { title: string; text?: string }) {
  if (!text) return null;
  return (
    <div>
      <h4 className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.16em] text-ink-mute">{title}</h4>
      <p className="mt-1.5 text-ink-soft">{text}</p>
    </div>
  );
}

/** Detalhes recolhidos: quem lê só os benefícios não precisa rolar por tudo isto. */
function Details({ p, onSee }: { p: ProjectWithSlides; onSee?: Props["onSee"] }) {
  const hasAny = p.forWho?.length || p.notForWho?.length || p.includes?.length || p.needsFromYou?.length || p.timeline;
  if (!hasAny) return null;

  return (
    <details
      className="group mt-5 rounded-xl border border-paper-line bg-paper"
      onToggle={(e) => (e.currentTarget as HTMLDetailsElement).open && track("detalhes_aberto", { id: p.id })}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
        Ver o que está incluso, para quem é e prazo
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden />
      </summary>

      <div className="space-y-5 border-t border-paper-line px-4 py-4 text-sm">
        <List title="É para você se…" items={p.forWho} />

        {p.notForWho && p.notForWho.length > 0 && (
          <div>
            <h4 className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.16em] text-ink-mute">Talvez não seja para você se…</h4>
            <ul className="mt-1.5 list-disc space-y-1.5 pl-4 text-ink-soft marker:text-ink-mute">
              {p.notForWho.map((n) => {
                const target = n.seeId ? projects.find((x) => x.id === n.seeId) : undefined;
                return (
                  <li key={n.text}>
                    {n.text}
                    {target && onSee && (
                      <>
                        {" "}
                        <a
                          href={`#${target.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            onSee(target.id, `ver-${target.id}`);
                          }}
                          className="font-semibold text-accent underline underline-offset-2"
                        >
                          Ver {target.tier ? `"${target.tier.name}"` : "a opção indicada"}
                        </a>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <List title="O que você recebe" items={p.includes} />
        <List title="O que precisamos de você" items={p.needsFromYou} />
        <Fact title="Prazo" text={p.timeline} />
      </div>
    </details>
  );
}
