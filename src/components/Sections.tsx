import {
  ArrowDown,
  ClipboardList,
  FlaskConical,
  Instagram,
  LifeBuoy,
  Mail,
  MapPin,
  MessageCircle,
  Palette,
  Smartphone,
  UserRound,
  Workflow,
} from "lucide-react";
import { site } from "@/config";
import { projects, type ProjectWithSlides } from "@/data/projects";
import type { Pain } from "@/data/segments";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { useReveal } from "@/hooks/useReveal";
import { gsap, NO_PREFERENCE, whenIntroDone } from "@/lib/motion";
import { defaultMessage, waProps } from "@/lib/whatsapp";
import { DeviceFrame } from "./DeviceFrame";
import { PilumLogo } from "./Logo";

const navLinks = [
  { href: "#servicos", label: "Serviços" },
  { href: "#portfolio", label: "Portfólio" },
  { href: "#como-funciona", label: "Como trabalhamos" },
  { href: "#quem-somos", label: "Quem somos" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-paper-line/80 bg-paper/85 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <a href="#topo" className="rounded-sm" aria-label={`${site.brand}, voltar ao início`}>
          <PilumLogo className="text-[1.6rem]" />
        </a>
        <nav className="flex items-center gap-1 text-sm lg:gap-2">
          {navLinks.map(({ href, label }) => (
            <a key={href} href={href} className="hidden rounded-full px-3 py-2 text-ink-soft hover:text-ink lg:block">
              {label}
            </a>
          ))}
          <a {...waProps(defaultMessage, "header")} className="btn-dark py-2">
            <MessageCircle className="h-4 w-4" aria-hidden />
            <span>Conversar</span>
          </a>
        </nav>
      </div>
    </header>
  );
}

export function Hero({ projects }: { projects: ProjectWithSlides[] }) {
  const all = projects.flatMap((p) => p.slides);
  const desktop = all.find((s) => s.device === "desktop");
  const mobile = all.find((s) => s.device === "mobile");

  // Entrada em sequência, só depois da abertura sumir. O estado escondido é aplicado por JS.
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_PREFERENCE, () => {
        gsap.set("[data-hero]", { autoAlpha: 0, y: 20 });
        gsap.set("[data-hero-shot]", { autoAlpha: 0, y: 40 });
        let tl: gsap.core.Timeline | undefined;
        const cancel = whenIntroDone(() => {
          tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.7 } });
          tl.to("[data-hero]", { autoAlpha: 1, y: 0, stagger: 0.12 }).to("[data-hero-shot]", { autoAlpha: 1, y: 0, stagger: 0.25, duration: 0.9 }, 0.2);
        });
        return () => {
          cancel();
          tl?.kill();
        };
      });
    },
    { scope: root },
  );

  return (
    <section id="topo" ref={root} className="relative overflow-hidden">
      <div className="container grid items-center gap-12 pb-16 pt-12 sm:pt-20 lg:grid-cols-2 lg:pb-24">
        <div>
          <p data-hero className="eyebrow">{site.role}</p>
          <p data-hero className="mt-2 flex items-center gap-1.5 text-sm text-ink-mute">
            <MapPin className="h-4 w-4" aria-hidden />
            Ilhéus e Itabuna – BA · atendimento em todo o Brasil
          </p>
          <h1 data-hero className="mt-4 text-[1.75rem] leading-tight sm:text-4xl lg:text-[2.6rem]">
            Desenvolvemos sistemas, sites e automações para pequenos negócios e empresas. Antes de escrever código,
            entendemos onde a operação perde tempo e dinheiro, e <span className="text-accent">o software mira exatamente ali.</span>
          </h1>
          <p data-hero className="mt-5 max-w-xl text-lg text-ink-soft">
            Cada negócio tem sua rotina e seus próprios desafios. Entendemos como a sua operação funciona, identificamos onde
            estão os gargalos e desenvolvemos soluções personalizadas para reduzir falhas, otimizar processos e simplificar a
            gestão.
          </p>
          <div data-hero className="mt-8 flex flex-wrap gap-3">
            <a className="btn-primary" {...waProps(defaultMessage, "hero")}>
              <MessageCircle className="h-4 w-4" aria-hidden />
              Falar no WhatsApp
            </a>
            <a className="btn-ghost" href="#portfolio">
              Ver portfólio
              <ArrowDown className="h-4 w-4" aria-hidden />
            </a>
          </div>
          <ul data-hero className="mt-10 max-w-md space-y-3 border-t border-paper-line pt-6">
            {heroPoints.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-[0.95rem] text-ink">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
                {text}
              </li>
            ))}
          </ul>
        </div>

        {desktop && (
          <div className="relative mx-auto w-full max-w-xl lg:max-w-none" aria-hidden>
            <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-accent-soft via-paper to-paper-line" />
            <div data-hero-shot className="overflow-hidden rounded-2xl border border-paper-line shadow-card">
              <DeviceFrame slide={desktop} eager />
            </div>
            {mobile && (
              <div data-hero-shot className="absolute -bottom-8 -left-2 w-[28%] overflow-hidden rounded-[1.4rem] border-[5px] border-ink bg-ink shadow-2xl sm:-left-8">
                <img src={mobile.src} alt="" className="aspect-[390/844] w-full rounded-[1rem] object-cover object-top" />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

const heroPoints = [
  { icon: ClipboardList, text: `${projects.length} sistemas no portfólio, de restaurantes a condomínios` },
  { icon: Workflow, text: "Integra com WhatsApp, pagamento online e impressoras" },
  { icon: Smartphone, text: "Instala no celular como app, para a equipe e para o cliente" },
];

// Cada dor leva à solução que a resolve. As dores de cada nicho ficam em src/data/segments.ts.
export function PainStrip({ pains, onPick }: { pains: Pain[]; onPick: (projectId: string, ref: string) => void }) {
  // Dor primeiro, alívio depois: cada card entra e só então revela a frase de alívio.
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_PREFERENCE, () => {
        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          scrollTrigger: { trigger: root.current, start: "top 80%", once: true },
        });
        tl.from("[data-pain-title]", { autoAlpha: 0, y: 12, duration: 0.5 })
          .from("[data-pain]", { autoAlpha: 0, y: 36, duration: 0.6, stagger: 0.14 }, "-=0.2")
          .from("[data-pain-icon]", { scale: 0.6, duration: 0.5, ease: "back.out(2)", stagger: 0.14 }, "<")
          .from("[data-pain-relief]", { autoAlpha: 0, y: 8, duration: 0.5, stagger: 0.14 }, "-=0.2");
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="dores" className="border-y border-paper-line bg-paper-card">
      <div className="container py-12">
        <h2 id="dores" data-pain-title className="text-center font-mono text-xs font-medium uppercase tracking-[0.2em] text-ink-mute">
          Qual destes problemas você tem hoje?
        </h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {pains.map(({ icon: Icon, scene, relief, projectId, ref }) => (
            <a
              key={ref}
              data-pain
              href={`#${projectId}`}
              onClick={(e) => {
                e.preventDefault();
                onPick(projectId, ref);
              }}
              className="group flex flex-col gap-3 rounded-2xl border border-paper-line p-4 transition-colors hover:border-accent/50 hover:bg-accent-soft/60"
            >
              <span data-pain-icon className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink text-paper">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="block font-semibold leading-snug">{scene}</span>
              <span data-pain-relief className="block text-sm text-ink-mute">{relief}</span>
              <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-accent group-hover:underline">
                Ver a solução
                <ArrowDown className="h-3.5 w-3.5" aria-hidden />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  { title: "Conversa", text: "Você conta como a empresa funciona hoje e onde perde tempo ou dinheiro. O orçamento sai depois dessa conversa." },
  // TODO(fabio): confirmar se o protótipo em 24 horas vale também para projetos maiores (empresas médias).
  { title: "Protótipo", text: "Primeira versão em menos de 24 horas, com a sua marca. Você testa antes de decidir; ajustes e novas funções a gente combina numa reunião." },
  { title: "No ar", text: "Publicamos, treinamos a equipe e acompanhamos os primeiros dias de uso." },
  { title: "Evolução", text: "Com o suporte mensal, cuidamos da hospedagem, dos ajustes e das novas funções que o negócio pedir." },
];

export function HowItWorks() {
  const root = useReveal<HTMLElement>("[data-reveal]", { stagger: 0.12 });
  return (
    <section id="como-funciona" ref={root} className="section scroll-mt-16 bg-ink text-paper">
      <div className="container">
        <p className="eyebrow text-accent-bright">Como trabalhamos</p>
        <h2 className="mt-2 max-w-2xl text-3xl uppercase text-paper sm:text-5xl">Do primeiro papo ao sistema rodando</h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.title} data-reveal className="rounded-2xl border border-paper/10 bg-ink-raised p-6">
              <span className="font-mono text-sm font-bold tracking-[0.2em] text-accent-bright">0{i + 1}</span>
              <h3 className="mt-2 text-xl font-bold text-paper">{s.title}</h3>
              <p className="mt-2 text-paper/70">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const whyUs = [
  {
    icon: UserRound,
    title: "Você fala com quem desenvolve",
    text: "Sem intermediário nem central de atendimento: o contato é direto com quem escreve o código.",
  },
  {
    icon: Palette,
    title: "Feito para o seu processo",
    text: "Sua marca e o fluxo do dia a dia da sua empresa, não um modelo engessado.",
  },
  {
    icon: FlaskConical,
    title: "Você testa antes de decidir",
    text: "O protótipo vem antes do compromisso: só segue em frente se gostar do que viu funcionando.",
  },
  {
    // TODO(fabio): confirmar o suporte por WhatsApp e, se for citar, o prazo de resposta que vocês conseguem cumprir sempre.
    icon: LifeBuoy,
    title: "Suporte de quem conhece o código",
    text: "Dúvidas e ajustes resolvidos por WhatsApp, por quem construiu o sistema.",
  },
];

export function Differentials() {
  const root = useReveal<HTMLElement>("[data-reveal]", { stagger: 0.1 });
  return (
    <section ref={root} className="section">
      <div className="container">
        <p className="eyebrow">Por que a {site.brand}</p>
        <h2 className="mt-2 max-w-2xl text-3xl uppercase sm:text-5xl">Atendimento de perto, de quem desenvolve</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {whyUs.map(({ icon: Icon, title, text }) => (
            <div key={title} data-reveal className="rounded-2xl border border-paper-line bg-paper-card p-5">
              <Icon className="h-6 w-6 text-accent" aria-hidden />
              <h3 className="mt-3 font-bold leading-snug">{title}</h3>
              <p className="mt-1 text-sm text-ink-mute">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

type CtaProps = { title?: string; text?: string; message?: string };

export function CtaFooter({
  title = "Vamos resolver o gargalo da sua empresa?",
  text = "Chame a gente no WhatsApp, conte como funciona hoje e mostramos como a solução ficaria para você. Orçamento sem compromisso.",
  message = defaultMessage,
}: CtaProps) {
  const root = useReveal<HTMLElement>("[data-reveal]", { y: 32, duration: 0.8 });
  return (
    <footer>
      <section ref={root} className="container pb-16">
        <div data-reveal className="rounded-3xl bg-accent px-6 py-12 text-center text-white sm:px-12 sm:py-16">
          <h2 className="mx-auto max-w-2xl text-3xl uppercase sm:text-5xl">{title}</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">{text}</p>
          <a className="btn mt-8 bg-white text-accent-ink hover:bg-paper" {...waProps(message, "rodape")}>
            <MessageCircle className="h-4 w-4" aria-hidden />
            Falar no WhatsApp
          </a>
        </div>
      </section>
      <div className="bg-ink text-paper/70">
        <div className="container flex flex-col gap-8 py-10 text-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <PilumLogo variant="dark" tagline className="text-[2rem]" />
            <p className="mt-4">
              <span className="text-paper">{site.brand}</span> · {site.role}
              {site.cnpj && <> · CNPJ {site.cnpj}</>}
            </p>
          </div>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            <li className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" aria-hidden />
              {site.city}
            </li>
            <li>
              <a className="flex items-center gap-1.5 hover:text-paper" href={`mailto:${site.email}`}>
                <Mail className="h-4 w-4" aria-hidden />
                {site.email}
              </a>
            </li>
            <li>
              <a className="flex items-center gap-1.5 hover:text-paper" href={`https://instagram.com/${site.instagram}`} target="_blank" rel="noopener noreferrer">
                <Instagram className="h-4 w-4" aria-hidden />
                @{site.instagram}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
