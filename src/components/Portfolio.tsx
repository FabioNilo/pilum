import { useEffect, useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { niches, projects, type NicheId, type ProjectWithSlides } from "@/data/projects";
import { serviceLabel, type ServiceId } from "@/data/services";
import { track } from "@/lib/track";
import { DeviceFrame } from "./DeviceFrame";
import { ProjectCard, StackChips } from "./ProjectCard";

/** Só os setores e serviços que têm case aparecem como filtro. */
const sectorFilters = niches.filter((n) => projects.some((p) => p.niche === n.id));
const serviceFilters: ServiceId[] = ["sistemas", "sites", "integracoes"];

const caseAnchor = (id: string) => `case-${id}`;

type Props = {
  service: ServiceId | null;
  onServiceChange: (id: ServiceId | null) => void;
};

/** Grade de cases com filtros. Abrir um case mostra o card completo (prints, problema, solução) logo abaixo da grade. */
export function Portfolio({ service, onServiceChange }: Props) {
  const [sector, setSector] = useState<NicheId | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const list = projects.filter((p) => (!sector || p.niche === sector) && (!service || p.services.includes(service)));
  const open = openId ? projects.find((p) => p.id === openId) : undefined;

  // Abriu um case: rola até ele.
  useEffect(() => {
    if (!openId) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => document.getElementById(caseAnchor(openId))?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" }), 60);
  }, [openId]);

  const openCase = (id: string) => {
    track("case_aberto", { id });
    setOpenId(id);
  };

  // Ir para outro case a partir dos links "talvez não seja para você".
  const seeOther = (id: string, ref: string) => {
    track("dor_click", { ref });
    setSector(null);
    onServiceChange(null);
    setOpenId(id);
  };

  return (
    <section id="portfolio" className="section scroll-mt-16">
      <div className="container">
        <p className="eyebrow">Portfólio</p>
        <h2 className="mt-2 max-w-2xl text-3xl uppercase sm:text-5xl">Projetos que já estão rodando</h2>
        <p className="mt-3 max-w-2xl text-ink-soft">
          Cada sistema nasceu de um problema real de um cliente. Os prints usam dados fictícios para proteger quem confiou na gente.
        </p>

        <div className="mt-8 space-y-3">
          <FilterRow label="Setor" all="Todos os setores" items={sectorFilters.map((n) => ({ id: n.id, label: n.label }))} value={sector} onChange={setSector} />
          <FilterRow
            label="Serviço"
            all="Todos os serviços"
            items={serviceFilters.map((id) => ({ id, label: serviceLabel(id) }))}
            value={service}
            onChange={onServiceChange}
          />
        </div>

        {list.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-dashed border-paper-line p-8 text-center text-ink-mute">
            Nenhum case com esses filtros ainda.{" "}
            <button
              type="button"
              className="font-semibold text-accent underline underline-offset-2"
              onClick={() => {
                setSector(null);
                onServiceChange(null);
              }}
            >
              Ver todos
            </button>
          </p>
        ) : (
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <li key={p.id}>
                <CaseTile project={p} active={p.id === openId} onOpen={() => openCase(p.id)} />
              </li>
            ))}
          </ul>
        )}

        {open && (
          <div className="relative mt-10">
            <button
              type="button"
              onClick={() => setOpenId(null)}
              className="absolute -top-4 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-ink text-paper shadow-card hover:bg-ink-raised"
              aria-label="Fechar case"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
            <ProjectCard key={open.id} project={open} flip={false} anchorId={caseAnchor(open.id)} onSee={seeOther} />
          </div>
        )}
      </div>
    </section>
  );
}

function FilterRow<T extends string>({
  label,
  all,
  items,
  value,
  onChange,
}: {
  label: string;
  all: string;
  items: { id: T; label: string }[];
  value: T | null;
  onChange: (id: T | null) => void;
}) {
  const chip = (active: boolean) =>
    `shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors ${
      active ? "border-ink bg-ink text-paper" : "border-paper-line bg-paper-card text-ink-soft hover:border-ink/40"
    }`;
  return (
    <div role="group" aria-label={`Filtrar por ${label.toLowerCase()}`} className="flex flex-wrap items-center gap-2">
      <span className="w-full font-mono text-[0.7rem] font-bold uppercase tracking-[0.16em] text-ink-mute sm:w-20">{label}</span>
      <button type="button" className={chip(value === null)} aria-pressed={value === null} onClick={() => onChange(null)}>
        {all}
      </button>
      {items.map((i) => (
        <button key={i.id} type="button" className={chip(value === i.id)} aria-pressed={value === i.id} onClick={() => onChange(i.id)}>
          {i.label}
        </button>
      ))}
    </div>
  );
}

function CaseTile({ project: p, active, onOpen }: { project: ProjectWithSlides; active: boolean; onOpen: () => void }) {
  const cover = p.slides.find((s) => s.device === "desktop") ?? p.slides[0];
  const sector = niches.find((n) => n.id === p.niche)?.label;
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-expanded={active}
      className={`group flex h-full w-full flex-col overflow-hidden rounded-2xl border bg-paper-card text-left transition-colors ${
        active ? "border-accent shadow-card" : "border-paper-line hover:border-ink/30"
      }`}
    >
      <div className="pointer-events-none border-b border-paper-line" aria-hidden>
        {cover ? <DeviceFrame slide={cover} /> : <div className="aspect-[16/10] bg-paper" />}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="eyebrow">{p.client ? p.client.name : sector}</p>
        <h3 className="mt-1.5 font-bold leading-snug">{p.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-ink-mute">
          <span className="font-medium text-ink-soft">Desafio:</span> {p.problem}
        </p>
        <StackChips stack={p.stack} className="mt-4" />
        <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-accent group-hover:underline">
          {active ? "Case aberto abaixo" : "Ver o case"}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </span>
      </div>
    </button>
  );
}
