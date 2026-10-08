import { ArrowUpRight, Check, MessageCircle } from "lucide-react";
import type { ProjectWithSlides } from "@/data/projects";
import { whatsappLink } from "@/lib/whatsapp";
import { Slideshow } from "./Slideshow";

type Props = {
  project: ProjectWithSlides;
  flip: boolean;
  /** Versão mais discreta, usada em "Também desenvolvo para". */
  compact?: boolean;
};

export function ProjectCard({ project, flip, compact = false }: Props) {
  const p = project;
  return (
    <article
      id={p.id}
      className={`grid scroll-mt-24 items-start gap-8 rounded-3xl border border-paper-line lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12 ${
        compact ? "bg-paper p-5" : "bg-paper-card p-5 shadow-card sm:p-8"
      }`}
    >
      <div className={flip ? "min-w-0 lg:order-2" : "min-w-0"}>
        <p className="eyebrow">{p.audience}</p>
        <h3 className={`mt-2 font-bold leading-tight ${compact ? "text-xl" : "text-2xl sm:text-[1.75rem]"}`}>{p.title}</h3>

        {compact ? (
          <p className="mt-3 text-[0.95rem] text-ink-soft">{p.solution}</p>
        ) : (
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
            href={whatsappLink(`Olá, Fabio! Vi a solução "${p.title}" no seu portfólio e quero algo parecido para o meu negócio.`)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            Quero um desse
          </a>
          {p.demoUrl && (
            <a className="btn-ghost" href={p.demoUrl} target="_blank" rel="noopener noreferrer">
              Ver demonstração
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </a>
          )}
        </div>
      </div>

      <div className={flip ? "min-w-0 lg:order-1" : "min-w-0"}>
        <Slideshow slides={p.slides} title={p.title} videoUrl={p.videoUrl} label={p.demoLabel} />
      </div>
    </article>
  );
}
