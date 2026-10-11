import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import {
  BatteryFull,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Ellipsis,
  Lock,
  RefreshCw,
  Share,
  Signal,
  Smartphone,
  SquarePlus,
  Wifi,
  Zap,
} from "lucide-react";
import type { Segment } from "@/data/segments";
import { useReveal } from "@/hooks/useReveal";
import { gsap, NO_PREFERENCE } from "@/lib/motion";

const initials = (name: string) =>
  name
    .replace(/[^\p{L}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

const STEPS = [
  "Abra o link do sistema no celular",
  "Toque em “Adicionar à tela inicial”",
  "O ícone com a sua marca aparece",
  "Um toque e abre como app",
];

/**
 * "Vira um app na tela inicial": um celular mostra, em loop, a instalação do sistema (PWA)
 * e o app abrindo com a marca do nicho. Sem animação (menos movimento), mostra a tela inicial com o ícone.
 */
export function PwaDemo({ pwa }: { pwa: Segment["pwa"] }) {
  const section = useReveal<HTMLElement>("[data-reveal]");
  const phone = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(-1);
  const mark = initials(pwa.appName);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_PREFERENCE, () => {
        const q = (k: string) => `[data-pwa="${k}"]`;
        const tap = (k: string) =>
          gsap
            .timeline()
            .fromTo(q(k), { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 0.9, scale: 1, duration: 0.25, ease: "power2.out" })
            .to(q(k), { autoAlpha: 0, scale: 1.3, duration: 0.3 });

        const tl = gsap.timeline({
          repeat: -1,
          repeatDelay: 0.6,
          scrollTrigger: { trigger: phone.current, start: "top 85%", end: "bottom 15%", toggleActions: "play pause resume pause" },
        });
        tl.set(q("browser"), { autoAlpha: 1 })
          .set(q("home"), { autoAlpha: 0 })
          .set(q("icon"), { scale: 0 })
          .set(q("sheet"), { y: 0, yPercent: 105 })
          .set(q("scrim"), { autoAlpha: 0 })
          .set([q("app"), q("splash")], { autoAlpha: 0 })
          .call(() => setStep(0))
          .to({}, { duration: 1 })
          .add(tap("tap-share"))
          .to(q("scrim"), { autoAlpha: 1, duration: 0.3 })
          .to(q("sheet"), { yPercent: 0, duration: 0.45, ease: "power3.out" }, "<")
          .call(() => setStep(1))
          .to({}, { duration: 0.8 })
          .add(tap("tap-add"))
          .to(q("sheet"), { yPercent: 105, duration: 0.35, ease: "power2.in" })
          .to(q("scrim"), { autoAlpha: 0, duration: 0.3 }, "<")
          .to(q("browser"), { autoAlpha: 0, duration: 0.3 })
          .to(q("home"), { autoAlpha: 1, duration: 0.3 }, "<")
          .to(q("icon"), { scale: 1, duration: 0.5, ease: "back.out(2.5)" }, "+=0.2")
          .call(() => setStep(2))
          .to({}, { duration: 1 })
          .add(tap("tap-icon"))
          .fromTo(q("splash"), { autoAlpha: 0, scale: 0.15 }, { autoAlpha: 1, scale: 1, duration: 0.45, ease: "power2.out" })
          .set(q("app"), { autoAlpha: 1 }, "+=0.5")
          .to(q("splash"), { autoAlpha: 0, duration: 0.4 })
          .call(() => setStep(3))
          .to({}, { duration: 2.4 });

        return () => setStep(-1);
      });
    },
    { scope: phone },
  );

  const benefits = [
    { icon: Zap, text: "Abre com um toque, em tela cheia, como um app" },
    { icon: Download, text: "Sem loja de aplicativos: instala em segundos, pelo navegador" },
    { icon: RefreshCw, text: "Atualiza sozinho, sem ninguém precisar baixar nada" },
    { icon: Smartphone, text: "Funciona em Android e iPhone" },
  ];

  return (
    <section ref={section} aria-labelledby="pwa-titulo" className="section border-y border-paper-line bg-paper-card">
      <div className="container grid items-center gap-12 lg:grid-cols-2">
        <div>
          <p data-reveal className="eyebrow">
            No celular
          </p>
          <h2 data-reveal id="pwa-titulo" className="mt-2 max-w-xl text-3xl uppercase sm:text-5xl">
            Vira um app na tela inicial
          </h2>
          <p data-reveal className="mt-3 max-w-xl text-ink-soft">
            O sistema instala direto pelo navegador, com o nome e a marca do seu negócio (como “{pwa.appName}”). Você acompanha tudo pelo celular, e
            os seus {pwa.audience} abrem com um toque.
          </p>
          <ul className="mt-6 space-y-3">
            {benefits.map(({ icon: Icon, text }) => (
              <li key={text} data-reveal className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <span className="pt-1 text-ink">{text}</span>
              </li>
            ))}
          </ul>
          <ol data-reveal className="mt-8 grid gap-2 sm:grid-cols-2" aria-label="Como instalar">
            {STEPS.map((s, i) => (
              <li
                key={s}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors duration-300 ${
                  step === -1 || step === i ? "border-accent/40 bg-accent-soft/60 text-ink" : "border-paper-line text-ink-mute"
                }`}
              >
                <span className="font-mono text-xs font-bold text-accent">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </div>

        {/* Celular */}
        <div data-reveal className="flex justify-center" aria-hidden>
          <div ref={phone} className="relative isolate h-[520px] w-[256px] rounded-[2.6rem] bg-ink p-2.5 shadow-2xl ring-1 ring-ink/20">
            <div className="relative h-full w-full overflow-hidden rounded-[2.1rem] bg-white">
              {/* Barra de status */}
              <div className="absolute inset-x-0 top-0 z-40 flex items-center justify-between px-6 pt-2.5 text-[0.65rem] font-semibold text-ink">
                <span>9:41</span>
                <span className="flex items-center gap-1">
                  <Signal className="h-3 w-3" />
                  <Wifi className="h-3 w-3" />
                  <BatteryFull className="h-3.5 w-3.5" />
                </span>
              </div>

              {/* 1. Navegador com o site */}
              <div data-pwa="browser" className="invisible absolute inset-0 flex flex-col bg-white pt-7 opacity-0">
                <div className="mx-3 flex items-center gap-1.5 rounded-full bg-paper px-3 py-1.5 text-[0.65rem] text-ink-soft">
                  <Lock className="h-3 w-3" />
                  <span className="truncate">{pwa.url}</span>
                </div>
                <AppPage name={pwa.appName} mark={mark} />
                <div className="flex items-center justify-around border-t border-paper-line bg-white py-2.5 text-ink-soft">
                  <ChevronLeft className="h-4 w-4" />
                  <ChevronRight className="h-4 w-4" />
                  <span className="relative">
                    <Share className="h-4 w-4 text-[#2563EB]" />
                    <Tap k="tap-share" />
                  </span>
                  <Bookmark className="h-4 w-4" />
                  <Ellipsis className="h-4 w-4" />
                </div>
              </div>

              {/* Menu de compartilhar */}
              <div data-pwa="scrim" className="invisible absolute inset-0 z-10 bg-ink/40 opacity-0" />
              <div data-pwa="sheet" className="absolute inset-x-0 bottom-0 z-20 translate-y-[105%] rounded-t-2xl bg-white p-3 shadow-2xl">
                <div className="flex items-center gap-2 border-b border-paper-line pb-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-[0.6rem] font-bold text-white">{mark}</span>
                  <span className="min-w-0 text-[0.7rem] leading-tight">
                    <span className="block truncate font-semibold text-ink">{pwa.appName}</span>
                    <span className="block truncate text-ink-mute">{pwa.url}</span>
                  </span>
                </div>
                <ul className="mt-1 text-[0.72rem] text-ink">
                  <li className="flex items-center justify-between py-2">
                    Copiar link <Copy className="h-3.5 w-3.5 text-ink-mute" />
                  </li>
                  <li className="relative -mx-1.5 flex items-center justify-between rounded-lg bg-paper px-1.5 py-2 font-semibold">
                    Adicionar à tela inicial <SquarePlus className="h-3.5 w-3.5" />
                    <Tap k="tap-add" />
                  </li>
                  <li className="flex items-center justify-between py-2">
                    Adicionar aos favoritos <Bookmark className="h-3.5 w-3.5 text-ink-mute" />
                  </li>
                </ul>
              </div>

              {/* 2. Tela inicial com o ícone novo (estado padrão, sem animação) */}
              <div data-pwa="home" className="absolute inset-0 bg-gradient-to-b from-accent-soft via-paper to-[#DCE3EC] px-4 pt-12">
                <div className="grid grid-cols-4 gap-x-3 gap-y-4">
                  {Array.from({ length: 11 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <span className="h-11 w-11 rounded-xl bg-white/80 shadow-sm" />
                      <span className="h-1.5 w-8 rounded-full bg-ink/15" />
                    </div>
                  ))}
                  <div data-pwa="icon" className="relative flex flex-col items-center gap-1">
                    <span
                      className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-sm font-bold text-white shadow-md ring-2 ring-white"
                    >
                      {mark}
                    </span>
                    <span className="w-14 truncate text-center text-[0.55rem] font-medium text-ink">{pwa.appName}</span>
                    <Tap k="tap-icon" />
                  </div>
                </div>
                <div className="absolute inset-x-3 bottom-3 flex justify-around rounded-3xl bg-white/50 py-2.5 backdrop-blur">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <span key={i} className="h-10 w-10 rounded-xl bg-white/90 shadow-sm" />
                  ))}
                </div>
              </div>

              {/* 3. Abertura e app em tela cheia */}
              <div data-pwa="app" className="invisible absolute inset-0 z-30 flex flex-col bg-white pt-7 opacity-0">
                <AppPage name={pwa.appName} mark={mark} />
                <p className="mx-3 mb-3 rounded-lg bg-ink px-3 py-2 text-center text-[0.65rem] font-semibold text-paper">
                  Aberto como app · tela cheia
                </p>
              </div>
              <div data-pwa="splash" className="invisible absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-accent opacity-0">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-xl font-bold text-accent">{mark}</span>
                <span className="text-sm font-semibold text-white">{pwa.appName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Conteúdo genérico do sistema (cabeçalho com a marca e blocos), usado no navegador e no app. */
function AppPage({ name, mark }: { name: string; mark: string }) {
  return (
    <div className="mt-2 flex flex-1 flex-col gap-2.5 overflow-hidden px-3">
      <div className="flex items-center gap-2 rounded-xl bg-ink px-3 py-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-[0.6rem] font-bold text-white">{mark}</span>
        <span className="truncate text-xs font-semibold text-paper">{name}</span>
      </div>
      <div className="h-24 rounded-xl bg-gradient-to-br from-accent-bright to-accent-ink" />
      <div className="h-2 w-3/4 rounded-full bg-paper-line" />
      <div className="h-2 w-1/2 rounded-full bg-paper-line" />
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1.5 rounded-lg border border-paper-line p-2">
            <div className="h-8 rounded bg-paper" />
            <div className="h-1.5 w-3/4 rounded-full bg-paper-line" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Círculo de "toque do dedo". */
function Tap({ k }: { k: string }) {
  return (
    <span
      data-pwa={k}
      className="pointer-events-none invisible absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink/25 opacity-0 ring-2 ring-white"
    />
  );
}
