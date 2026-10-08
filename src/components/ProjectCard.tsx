import { ArrowUpRight, Check, ChevronDown, MessageCircle } from "lucide-react";
import { primaryNiches, projects, type ProjectWithSlides } from "@/data/projects";
import { track } from "@/lib/track";
import { waProps } from "@/lib/whatsapp";
import { Slideshow } from "./Slideshow";

type Props = {
  project: ProjectWithSlides;
  flip: boolean;
  /** Versão mais discreta, usada em "Também desenvolvo para". */
  compact?: boolean;
  /** Rola até outra solução (usado nos links de "talvez não seja para você"). */
  onSee?: (projectId: string, ref: string) => void;
};

export function ProjectCard({ project, flip, compact = false, onSee }: Props) {
  const p = project;
  // Nichos de comida: "no meu restaurante". Os demais: convite mais geral.
  const food = primaryNiches.includes(p.niche);
  return (
    <article
      id={p.id}
      className={`grid scroll-mt-24 items-start gap-8 rounded-3xl border border-paper-line lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12 ${
        compact ? "bg-paper p-5" : "bg-paper-card p-5 shadow-card sm:p-8"
      }`}
    >
      <div className={flip ? "min-w-0 lg:order-2" : "min-w-0"}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <p className="eyebrow">{p.audience}</p>
          {p.tier && !compact && (
            <span className="rounded-full bg-ink px-2.5 py-1 font-mono text-[0.65rem] font-bold uppercase tracking-[0.12em] text-paper">
              {p.tier.name}
            </span>
          )}
        </div>
        <h3 className={`mt-2 font-bold leading-tight ${compact ? "text-xl" : "text-2xl sm:text-[1.75rem]"}`}>{p.title}</h3>

        <p className="mt-3 text-[0.95rem] text-ink-soft">{p.whatIs}</p>

        {!compact && (
          <dl className="mt-5 space-y-3 text-[0.95rem]">
            <div className="rounded-xl bg-paper px-4 py-3">
              <dt className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-ink-mute">O problema</dt>
              <dd className="mt-0.5 text-ink-soft">{p.problem}</dd>
            </div>
            <div className="rounded-xl bg-ink px-4 py-3">
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

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            className="btn-primary"
            {...waProps(
              food
                ? `Olá, Fabio! Vi "${p.title}" no seu site e quero ver como ficaria no meu negócio.`
                : `Olá, Fabio! Vi "${p.title}" no seu site e quero conversar sobre isso.`,
              `card-${p.id}`,
            )}
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            {food ? "Ver como ficaria no meu restaurante" : "Quero conversar sobre isso"}
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
  const hasAny = p.forWho?.length || p.notForWho?.length || p.includes?.length || p.needsFromYou?.length || p.timeline || p.pricingModel;
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
        <List title="O que preciso de você" items={p.needsFromYou} />
        <Fact title="Prazo" text={p.timeline} />
        <Fact title="Como é cobrado" text={p.pricingModel} />
      </div>
    </details>
  );
}
