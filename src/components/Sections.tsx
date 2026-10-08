import {
  ArrowDown,
  BarChart3,
  CalendarX2,
  FileSpreadsheet,
  Github,
  Mail,
  MapPin,
  MessageCircle,
  MessagesSquare,
  Percent,
  ShieldCheck,
  Smartphone,
  Wallet,
} from "lucide-react";
import { site } from "@/config";
import { niches, type NicheId, type ProjectWithSlides } from "@/data/projects";
import { defaultMessage, whatsappLink } from "@/lib/whatsapp";
import { DeviceFrame } from "./DeviceFrame";
import { PilumLogo } from "./Logo";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-paper-line/80 bg-paper/85 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <a href="#topo" className="rounded-sm" aria-label={`${site.brand}, voltar ao início`}>
          <PilumLogo className="text-[1.6rem]" />
        </a>
        <nav className="flex items-center gap-1 text-sm sm:gap-4">
          <a href="#solucoes" className="hidden rounded-full px-3 py-2 text-ink-soft hover:text-ink sm:block">
            Soluções
          </a>
          <a href="#como-funciona" className="hidden rounded-full px-3 py-2 text-ink-soft hover:text-ink sm:block">
            Como funciona
          </a>
          <a href={whatsappLink(defaultMessage)} target="_blank" rel="noopener noreferrer" className="btn-dark py-2">
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

  return (
    <section id="topo" className="relative overflow-hidden">
      <div className="container grid items-center gap-12 pb-16 pt-12 sm:pt-20 lg:grid-cols-2 lg:pb-24">
        <div>
          <p className="eyebrow">Sistemas sob medida para pequenos negócios</p>
          <h1 className="mt-4 text-[2.6rem] uppercase leading-[1.02] sm:text-6xl lg:text-[4.1rem]">
            Menos planilha e papel. <span className="text-accent">Mais vendas e controle.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ink-soft">
            Sistemas sob medida para restaurantes, delivery, clínicas e condomínios. Antes de escrever código, entendo
            onde o seu negócio perde tempo e dinheiro, e o sistema mira exatamente ali: pedidos pelo WhatsApp, agenda,
            financeiro e relatórios, tudo no celular.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a className="btn-primary" href={whatsappLink(defaultMessage)} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" aria-hidden />
              Falar no WhatsApp
            </a>
            <a className="btn-ghost" href="#solucoes">
              Ver soluções
              <ArrowDown className="h-4 w-4" aria-hidden />
            </a>
          </div>
          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-paper-line pt-6">
            <Stat value={String(projects.length)} label="soluções prontas para adaptar" />
            <Stat value={String(niches.length)} label="nichos atendidos" />
            <Stat value="100%" label="responsivo, feito para o celular" />
          </dl>
        </div>

        {desktop && (
          <div className="relative mx-auto w-full max-w-xl lg:max-w-none" aria-hidden>
            <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-accent-soft via-paper to-paper-line" />
            <div className="overflow-hidden rounded-2xl border border-paper-line shadow-card">
              <DeviceFrame slide={desktop} eager />
            </div>
            {mobile && (
              <div className="absolute -bottom-8 -left-2 w-[28%] overflow-hidden rounded-[1.4rem] border-[5px] border-ink bg-ink shadow-2xl sm:-left-8">
                <img src={mobile.src} alt="" className="aspect-[390/844] w-full rounded-[1rem] object-cover object-top" />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd className="font-display text-3xl">{value}</dd>
      <dd className="mt-1 text-xs leading-snug text-ink-mute">{label}</dd>
    </div>
  );
}

const pains: { icon: typeof Percent; title: string; text: string; niche: NicheId }[] = [
  { icon: Percent, title: "Comissão de aplicativo", text: "Venda direto, sem perder parte de cada pedido.", niche: "restaurantes" },
  { icon: MessagesSquare, title: "Pedido perdido no WhatsApp", text: "Pedidos organizados num painel, nada fica para trás.", niche: "alimentacao" },
  { icon: CalendarX2, title: "Agenda e prontuário no papel", text: "Pacientes, sessões e cobranças num só lugar.", niche: "saude" },
  { icon: FileSpreadsheet, title: "Planilha que ninguém entende", text: "Prestação de contas pronta em PDF.", niche: "condominios" },
];

export function PainStrip({ onPick }: { onPick: (n: NicheId) => void }) {
  return (
    <section aria-labelledby="dores" className="border-y border-paper-line bg-paper-card">
      <div className="container py-12">
        <h2 id="dores" className="text-center font-mono text-xs font-medium uppercase tracking-[0.2em] text-ink-mute">
          Qual destes problemas você tem hoje?
        </h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {pains.map(({ icon: Icon, title, text, niche }) => (
            <a
              key={title}
              href="#solucoes"
              onClick={() => onPick(niche)}
              className="group flex gap-3 rounded-2xl border border-paper-line p-4 transition-colors hover:border-accent/50 hover:bg-accent-soft/60"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink text-paper">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span>
                <span className="block font-semibold">{title}</span>
                <span className="mt-0.5 block text-sm text-ink-mute">{text}</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function NicheFilter({ value, onChange }: { value: NicheId | "todos"; onChange: (v: NicheId | "todos") => void }) {
  const items = [{ id: "todos" as const, label: "Todos" }, ...niches];
  return (
    <div role="tablist" aria-label="Filtrar por nicho" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      {items.map((n) => {
        const active = value === n.id;
        return (
          <button
            key={n.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(n.id)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              active ? "border-ink bg-ink text-white" : "border-paper-line bg-white text-ink-soft hover:border-ink/30"
            }`}
          >
            {n.label}
          </button>
        );
      })}
    </div>
  );
}

const steps = [
  { title: "Conversa", text: "Você me conta como o negócio funciona hoje e onde perde tempo ou dinheiro." },
  { title: "Protótipo", text: "Adapto uma solução pronta ao seu nicho, com a sua marca, e você testa antes." },
  { title: "No ar", text: "Publico, treino sua equipe e acompanho os primeiros dias de uso." },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="section scroll-mt-16 bg-ink text-paper">
      <div className="container">
        <p className="eyebrow text-accent-bright">Como funciona</p>
        <h2 className="mt-2 max-w-2xl text-3xl uppercase text-paper sm:text-5xl">Do primeiro papo ao sistema rodando</h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="rounded-2xl border border-paper/10 bg-ink-raised p-6">
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

const diffs = [
  { icon: MessageCircle, title: "WhatsApp integrado", text: "Pedidos, agendamentos e contato onde seu cliente já está." },
  {
    icon: Wallet,
    title: "Sem comissão da Pilum",
    text: "Sem comissão da Pilum sobre suas vendas. A taxa da operadora de pagamento (Pix/cartão) é cobrada à parte pela operadora.",
  },
  // TODO(fabio): confirmar o que realmente fica com o cliente (dados, domínio, painel, contas de hospedagem).
  { icon: ShieldCheck, title: "Tudo fica com você", text: "Seus dados, seu domínio e seu painel ficam com você." },
  { icon: Smartphone, title: "Funciona no celular", text: "Para o cliente e para você, até instalado como app." },
  { icon: BarChart3, title: "Números na mão", text: "Vendas, ticket médio, inadimplência e relatórios em PDF." },
  // TODO(fabio): confirmar que LGPD e proteção de dados estão realmente implementadas, principalmente nos nichos de saúde.
  { icon: ShieldCheck, title: "Dados protegidos", text: "Acesso com senha, perfis de equipe e adequação à LGPD." },
];

export function Differentials() {
  return (
    <section className="section">
      <div className="container">
        <p className="eyebrow">Por que trabalhar comigo</p>
        <h2 className="mt-2 max-w-2xl text-3xl uppercase sm:text-5xl">Feito para quem toca o negócio no dia a dia</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {diffs.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-paper-line bg-paper-card p-5">
              <Icon className="h-6 w-6 text-accent" aria-hidden />
              <h3 className="mt-3 font-bold">{title}</h3>
              <p className="mt-1 text-sm text-ink-mute">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CtaFooter() {
  return (
    <footer>
      <section className="container pb-16">
        <div className="rounded-3xl bg-accent px-6 py-12 text-center text-white sm:px-12 sm:py-16">
          <h2 className="mx-auto max-w-2xl text-3xl uppercase sm:text-5xl">Vamos resolver o gargalo do seu negócio?</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">
            Me chame no WhatsApp, conte como funciona hoje e eu mostro como a solução ficaria para você. Sem compromisso.
          </p>
          <a
            className="btn mt-8 bg-white text-accent-ink hover:bg-paper"
            href={whatsappLink(defaultMessage)}
            target="_blank"
            rel="noopener noreferrer"
          >
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
              {site.role}, por <span className="text-paper">{site.name}</span>.
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
              <a className="flex items-center gap-1.5 hover:text-paper" href={site.github} target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4" aria-hidden />
                GitHub
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
