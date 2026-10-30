import { useEffect, useState } from "react";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Briefcase, Check } from "lucide-react";
import { foodSegments, getSegment, otherSegments, segments, type Segment, type SegmentId } from "@/data/segments";
import { useReveal } from "@/hooks/useReveal";
import { ScrollTrigger } from "@/lib/motion";

type Props = {
  value: SegmentId;
  onChange: (id: SegmentId, origin: string) => void;
  /** Id do bloco com o conteúdo do nicho: a barra fixa aparece enquanto ele está na tela. */
  contentId: string;
};

/** Troca de nicho e leva a pessoa ao começo do conteúdo novo. */
function switchAndScroll(id: SegmentId, origin: string, onChange: Props["onChange"], contentId: string) {
  onChange(id, origin);
  const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.setTimeout(() => document.getElementById(contentId)?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" }), 120);
}

/**
 * "Qual é o seu negócio?": um toque troca dores, demonstrações, soluções e CTA.
 * Os 3 de alimentação ficam em destaque; o 4º cartão abre os outros segmentos.
 * Restaurantes já vem escolhido, então ninguém vê a página vazia.
 */
export function SegmentPicker({ value, onChange, contentId }: Props) {
  const root = useReveal<HTMLElement>("[data-reveal]", { stagger: 0.1 });
  const [showBar, setShowBar] = useState(false);
  const current = getSegment(value);
  const otherActive = current.group === "other";
  const [othersOpen, setOthersOpen] = useState(otherActive);

  // Chegou num segmento "outro" (link, barra ou card do fim): deixa a lista aberta.
  useEffect(() => {
    if (otherActive) setOthersOpen(true);
  }, [otherActive]);

  useGSAP(() => {
    const st = ScrollTrigger.create({
      trigger: `#${contentId}`,
      start: "top 64px",
      end: "bottom 120px",
      onToggle: (self) => setShowBar(self.isActive),
    });
    return () => st.kill();
  });

  const card = (active: boolean) =>
    `relative flex h-full w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-colors sm:flex-col sm:items-start sm:p-5 ${
      active ? "border-accent bg-accent-soft/70 shadow-card" : "border-paper-line bg-paper-card hover:border-ink/30"
    }`;
  const badge = (active: boolean) =>
    `flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors ${active ? "bg-accent text-white" : "bg-ink text-paper"}`;

  return (
    <>
      <section id="seu-negocio" ref={root} aria-labelledby="seu-negocio-titulo" className="scroll-mt-16 py-12 sm:py-16">
        <div className="container">
          <p data-reveal className="eyebrow text-center">
            Soluções por setor
          </p>
          <h2 data-reveal id="seu-negocio-titulo" className="mt-2 text-center text-3xl uppercase sm:text-5xl">
            Qual é o seu negócio?
          </h2>
          <p data-reveal className="mx-auto mt-3 max-w-xl text-center text-ink-soft">
            Escolha o seu setor e veja os problemas que já resolvemos, como o sistema funciona no dia a dia e por onde começar.
          </p>

          <div role="radiogroup" aria-labelledby="seu-negocio-titulo" className="mt-8 grid gap-3 sm:grid-cols-3">
            {foodSegments.map(({ id, icon: Icon, label, desc }) => {
              const active = id === value;
              return (
                <div key={id} data-reveal>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => {
                      setOthersOpen(false);
                      onChange(id, "seletor");
                    }}
                    className={card(active)}
                  >
                    <span className={badge(active)}>
                      <Icon className="h-6 w-6" aria-hidden />
                    </span>
                    <span>
                      <span className="block font-bold leading-snug">{label}</span>
                      <span className="mt-0.5 block text-sm text-ink-mute">{desc}</span>
                    </span>
                    {active && <ActiveCheck />}
                  </button>
                </div>
              );
            })}

            <div data-reveal>
              <button
                type="button"
                role="radio"
                aria-checked={otherActive}
                aria-expanded={othersOpen}
                aria-controls="outros-negocios"
                onClick={() => setOthersOpen((o) => !o)}
                className={card(otherActive)}
              >
                <span className={badge(otherActive)}>
                  {otherActive ? <current.icon className="h-6 w-6" aria-hidden /> : <Briefcase className="h-6 w-6" aria-hidden />}
                </span>
                <span>
                  <span className="block font-bold leading-snug">{otherActive ? current.label : "Outro negócio"}</span>
                  <span className="mt-0.5 block text-sm text-ink-mute">
                    {otherActive ? "Toque para ver os outros segmentos" : "Clínicas, condomínios, turismo e advocacia"}
                  </span>
                </span>
                {otherActive && <ActiveCheck />}
              </button>
            </div>
          </div>

          {/* Outros segmentos: abre com uma transição de altura (grid 0fr → 1fr), sem JS de animação. */}
          <div
            id="outros-negocios"
            className={`grid transition-[grid-template-rows,opacity] duration-300 ${othersOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
          >
            <div className="overflow-hidden">
              <div
                role="radiogroup"
                aria-label="Outros negócios"
                className="mt-3 flex flex-wrap gap-2 rounded-2xl border border-paper-line bg-paper-card p-3"
              >
                {otherSegments.map(({ id, icon: Icon, label }) => {
                  const active = id === value;
                  return (
                    <button
                      key={id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      tabIndex={othersOpen ? 0 : -1}
                      onClick={() => onChange(id, "seletor-outros")}
                      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                        active ? "border-accent bg-accent text-white" : "border-paper-line bg-white text-ink hover:border-ink/30"
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Barra fina que acompanha a rolagem: troca de nicho sem voltar ao topo. */}
      <div
        aria-hidden={!showBar}
        className={`fixed inset-x-0 top-16 z-30 border-b border-paper-line/80 bg-paper/90 backdrop-blur transition-all duration-300 ${
          showBar ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-full opacity-0"
        }`}
      >
        <div className="container flex items-center gap-2 overflow-x-auto py-2">
          <span className="hidden shrink-0 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-ink-mute sm:block">Seu negócio:</span>
          {segments.map(({ id, icon: Icon, short, group }, i) => {
            const active = id === value;
            return (
              <span key={id} className="flex shrink-0 items-center gap-2">
                {group === "other" && segments[i - 1]?.group === "food" && <span className="h-5 w-px bg-paper-line" aria-hidden />}
                <button
                  type="button"
                  tabIndex={showBar ? 0 : -1}
                  aria-pressed={active}
                  onClick={() => switchAndScroll(id, "barra", onChange, contentId)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                    active ? "border-ink bg-ink text-white" : "border-paper-line bg-white text-ink-soft hover:border-ink/30"
                  }`}
                >
                  <Icon className="hidden h-4 w-4 sm:block" aria-hidden />
                  {short}
                </button>
              </span>
            );
          })}
        </div>
      </div>
    </>
  );
}

function ActiveCheck() {
  return (
    <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white">
      <Check className="h-4 w-4" aria-hidden />
    </span>
  );
}

/** "Seu negócio é outro?": no fim do conteúdo do nicho, atalhos para os demais segmentos. */
export function SegmentSwitcher({ value, onChange, contentId }: Props) {
  const root = useReveal<HTMLElement>("[data-reveal]", { stagger: 0.06 });
  const rest = segments.filter((s) => s.id !== value);
  const chip = (s: Segment) => (
    <button
      key={s.id}
      data-reveal
      type="button"
      onClick={() => switchAndScroll(s.id, "card-fim", onChange, contentId)}
      className="group flex items-center gap-2 rounded-full border border-paper/15 bg-ink-raised px-4 py-2 text-sm font-medium text-paper transition-colors hover:border-accent-bright hover:bg-accent"
    >
      <s.icon className="h-4 w-4 text-accent-bright group-hover:text-white" aria-hidden />
      {s.label}
      <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
    </button>
  );

  return (
    <section ref={root} aria-labelledby="outro-segmento" className="container pb-16">
      <div className="rounded-3xl bg-ink p-6 text-paper sm:p-10">
        <p data-reveal className="eyebrow text-accent-bright">
          Não é o seu caso?
        </p>
        <h2 data-reveal id="outro-segmento" className="mt-2 text-2xl uppercase text-paper sm:text-4xl">
          Seu negócio é outro?
        </h2>
        <p data-reveal className="mt-2 max-w-xl text-paper/70">
          Escolha abaixo e a página se adapta: dores, demonstração e solução do seu segmento.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">{rest.map(chip)}</div>
      </div>
    </section>
  );
}
