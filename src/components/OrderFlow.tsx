import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import type { Segment } from "@/data/segments";
import { gsap, ScrollTrigger } from "@/lib/motion";

const DESKTOP = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";
const MOBILE = "(max-width: 1023px) and (prefers-reduced-motion: no-preference)";

/**
 * Jornada de um pedido (ou atendimento, reserva, caso), etapa por etapa.
 * - Desktop: a seção fica fixa e cada etapa avança conforme a pessoa rola.
 * - Celular: toca sozinha enquanto está na tela (e para quando a pessoa toca numa etapa).
 * - Menos movimento: nada se move sozinho; a pessoa toca nas etapas.
 */
export function OrderFlow({ flow }: { flow: Segment["flow"] }) {
  const { steps, ticket } = flow;
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const pinned = useRef<ScrollTrigger | null>(null);
  const userTook = useRef(false);
  const n = steps.length;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(DESKTOP, () => {
        pinned.current = ScrollTrigger.create({
          trigger: root.current,
          start: "top top",
          end: `+=${n * 60}%`,
          pin: true,
          onUpdate: (self) => setActive(Math.min(n - 1, Math.floor(self.progress * n))),
        });
        return () => {
          pinned.current = null;
        };
      });

      mm.add(MOBILE, () => {
        let visible = false;
        const st = ScrollTrigger.create({
          trigger: root.current,
          start: "top 75%",
          end: "bottom 25%",
          onToggle: (self) => (visible = self.isActive),
        });
        const timer = window.setInterval(() => {
          if (visible && !userTook.current) setActive((a) => (a + 1) % n);
        }, 2600);
        return () => {
          window.clearInterval(timer);
          st.kill();
        };
      });
    },
    { scope: root },
  );

  // Toque numa etapa: no desktop rola até ela; no celular, mostra e para o autoplay.
  const go = (i: number) => {
    const st = pinned.current;
    if (st) {
      window.scrollTo({ top: st.start + ((i + 0.5) / n) * (st.end - st.start) });
      return;
    }
    userTook.current = true;
    setActive(i);
  };

  const progress = n > 1 ? (active / (n - 1)) * 100 : 100;

  return (
    // O wrapper externo é estável para o React; o GSAP envolve só o interno ao fixar a seção.
    <div>
      <div ref={root} className="bg-ink text-paper">
        <section aria-labelledby="simulacao" className="container flex flex-col justify-center py-16 sm:py-20 lg:min-h-screen lg:pb-12 lg:pt-32">
          <p className="eyebrow text-accent-bright">Na prática</p>
          <h2 id="simulacao" className="mt-2 max-w-2xl text-3xl uppercase text-paper sm:text-5xl">
            {flow.title}
          </h2>
          <p className="mt-3 max-w-2xl text-paper/70">
            <span className="hidden lg:inline">Role a página e acompanhe cada etapa no sistema.</span>
            <span className="lg:hidden">Acompanhe cada etapa no sistema, ou toque numa delas.</span>
          </p>

          <div className="mt-10 grid items-center gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
            {/* Lista de etapas (desktop) */}
            <ol className="relative hidden space-y-1 lg:block">
              <span className="absolute bottom-4 left-[1.15rem] top-4 w-0.5 bg-paper/10" aria-hidden />
              <span
                className="absolute left-[1.15rem] top-4 w-0.5 bg-accent-bright transition-all duration-500"
                style={{ height: `calc((100% - 2rem) * ${progress / 100})` }}
                aria-hidden
              />
              {steps.map((s, i) => (
                <li key={s.title}>
                  <button
                    type="button"
                    onClick={() => go(i)}
                    aria-current={i === active ? "step" : undefined}
                    className={`relative flex w-full items-start gap-4 rounded-xl p-2 text-left transition-colors ${
                      i === active ? "bg-ink-raised" : "hover:bg-ink-raised/50"
                    }`}
                  >
                    <span
                      className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 font-mono text-xs font-bold transition-colors ${
                        i <= active ? "border-accent-bright bg-accent-bright text-white" : "border-paper/20 bg-ink text-paper/50"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className={`pt-1 transition-colors ${i === active ? "text-paper" : "text-paper/50"}`}>
                      <span className="block font-semibold leading-snug">{s.title}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>

            {/* Palco: estações e o "ticket" do pedido */}
            <div className="rounded-3xl border border-paper/10 bg-ink-raised p-5 sm:p-8">
              <div className="relative px-4">
                <div className="absolute inset-x-4 top-1/2 h-0.5 -translate-y-1/2 bg-paper/10" aria-hidden />
                <div
                  className="absolute left-4 top-1/2 h-0.5 -translate-y-1/2 bg-accent-bright transition-all duration-500"
                  style={{ width: `calc((100% - 2rem) * ${progress / 100})` }}
                  aria-hidden
                />
                <ol className="relative flex justify-between">
                  {steps.map(({ icon: Icon, title }, i) => (
                    <li key={title}>
                      <button
                        type="button"
                        onClick={() => go(i)}
                        aria-label={`Etapa ${i + 1}: ${title}`}
                        aria-current={i === active ? "step" : undefined}
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 sm:h-12 sm:w-12 ${
                          i === active
                            ? "scale-110 border-accent-bright bg-accent-bright text-white shadow-[0_0_0_6px_rgb(224_72_61/.2)]"
                            : i < active
                              ? "border-accent-bright bg-ink text-accent-bright"
                              : "border-paper/20 bg-ink text-paper/40"
                        }`}
                      >
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
                      </button>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="relative mt-8 min-h-[13rem] sm:min-h-[12rem]" aria-live="polite">
                {steps.map((s, i) => (
                  <div
                    key={s.title}
                    aria-hidden={i !== active}
                    className={`absolute inset-0 transition-all duration-500 ${
                      i === active
                        ? "translate-y-0 opacity-100"
                        : i < active
                          ? "pointer-events-none -translate-y-3 opacity-0"
                          : "pointer-events-none translate-y-3 opacity-0"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent-bright">
                        {i + 1}/{steps.length} · {s.actor}
                      </p>
                      <span className="rounded-full border border-paper/15 px-3 py-1 font-mono text-[0.7rem] font-bold uppercase tracking-[0.1em] text-paper">
                        {s.status}
                      </span>
                    </div>
                    <h3 className="mt-3 text-2xl font-bold text-paper sm:text-3xl">{s.title}</h3>
                    <p className="mt-2 max-w-lg text-paper/70">{s.text}</p>
                  </div>
                ))}
              </div>

              {/* Ticket do pedido: o status muda a cada etapa */}
              <div className="mt-4 flex items-center gap-3 rounded-xl bg-paper px-4 py-3 text-ink">
                <span className="font-mono text-sm font-bold text-accent">{ticket.code}</span>
                <span className="text-sm text-ink-soft">{ticket.label}:</span>
                <span key={active} className="ml-auto animate-[pop-in_.35s_ease-out] rounded-full bg-ink px-3 py-1 text-xs font-semibold text-paper">
                  {steps[active].status}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
