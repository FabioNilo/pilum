import { useRef, type KeyboardEvent, type PointerEvent } from "react";
import { useGSAP } from "@gsap/react";
import {
  BarChart3,
  Building2,
  CalendarDays,
  ChevronsLeftRight,
  Clock,
  FileSpreadsheet,
  LayoutDashboard,
  MessageCircle,
  Receipt,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import type { After, Before, PayStatus, Segment, WeekSession } from "@/data/segments";
import { useReveal } from "@/hooks/useReveal";
import { gsap, NO_PREFERENCE } from "@/lib/motion";

type Props = { data: Segment["beforeAfter"] };

const clamp = (v: number) => Math.min(100, Math.max(0, v));

/**
 * Antes x depois: a bagunça de hoje de um lado (WhatsApp, agenda de papel ou planilha), o sistema da categoria do outro
 * (painel de pedidos, agenda semanal, vagas por passeio, financeiro do condomínio ou página pessoal).
 * O divisor é arrastável (mouse, toque ou setas do teclado). Ao entrar na tela, a bagunça "acontece"
 * (mensagens chegando, horários riscados, células com erro), o divisor mostra o "depois" inteiro e volta ao meio.
 */
export function BeforeAfter({ data }: Props) {
  const section = useReveal<HTMLElement>("[data-reveal]");
  const stage = useRef<HTMLDivElement>(null);
  const handle = useRef<HTMLDivElement>(null);
  const pos = useRef(50);
  const dragging = useRef(false);
  const intro = useRef<gsap.core.Timeline | null>(null);

  // Atualiza direto no DOM (variável CSS), sem re-renderizar o React a cada movimento.
  const setPos = (v: number) => {
    pos.current = clamp(v);
    stage.current?.style.setProperty("--pos", `${pos.current}%`);
    handle.current?.setAttribute("aria-valuenow", String(Math.round(pos.current)));
  };

  const stopIntro = () => {
    intro.current?.progress(1).kill();
    intro.current = null;
  };

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_PREFERENCE, () => {
        const o = { v: 92 };
        setPos(o.v);
        const tl = gsap.timeline({ scrollTrigger: { trigger: stage.current, start: "top 70%", once: true } });
        const strikes = gsap.utils.toArray<HTMLElement>("[data-strike]", stage.current);
        tl.from("[data-chaos]", { autoAlpha: 0, y: 10, scale: 0.96, duration: 0.35, stagger: 0.18, ease: "back.out(2)" });
        if (strikes.length) tl.from(strikes, { scaleX: 0, transformOrigin: "left center", duration: 0.3, stagger: 0.15 }, "-=0.4");
        tl.to(o, { v: 6, duration: 1.3, ease: "power2.inOut", onUpdate: () => setPos(o.v) }, "+=0.3")
          .from("[data-order]", { autoAlpha: 0, y: 8, duration: 0.3, stagger: 0.05, ease: "power2.out" }, "<0.3")
          .to(o, { v: 50, duration: 1.1, ease: "power2.inOut", onUpdate: () => setPos(o.v) }, "+=0.9");
        intro.current = tl;
        return () => setPos(50);
      });
    },
    { scope: stage },
  );

  const fromPointer = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setPos(((e.clientX - r.left) / r.width) * 100);
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 20 : 5;
    const next = { ArrowLeft: pos.current - step, ArrowRight: pos.current + step, Home: 0, End: 100 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    stopIntro();
    setPos(next);
  };

  const { heading, before, after, beforeCaption, afterCaption } = data;

  return (
    <section ref={section} aria-labelledby="antes-depois" className="section">
      <div className="container">
        <p data-reveal className="eyebrow">
          Antes e depois
        </p>
        <h2 data-reveal id="antes-depois" className="mt-2 max-w-3xl text-3xl uppercase sm:text-5xl">
          {heading}
        </h2>
        <p data-reveal className="mt-3 max-w-2xl text-ink-soft">
          Arraste a barra para comparar o seu dia hoje com o seu dia usando o sistema.
        </p>

        <div
          data-reveal
          ref={stage}
          style={{ ["--pos" as string]: "50%" }}
          className="relative mt-8 h-[400px] cursor-ew-resize touch-pan-y select-none overflow-hidden rounded-3xl border border-paper-line shadow-card sm:h-[440px]"
          onPointerDown={(e) => {
            stopIntro();
            dragging.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            fromPointer(e);
          }}
          onPointerMove={(e) => dragging.current && fromPointer(e)}
          onPointerUp={() => (dragging.current = false)}
          onPointerCancel={() => (dragging.current = false)}
        >
          {/* ANTES */}
          <div className="absolute inset-0" aria-hidden>
            <BeforeScene before={before} />
          </div>

          {/* DEPOIS: o sistema organizado de cada categoria, recortado a partir do divisor */}
          <div className="absolute inset-0" style={{ clipPath: "inset(0 0 0 var(--pos))" }} aria-hidden>
            <AfterScene after={after} />
          </div>

          {/* Rótulos */}
          <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-ink/80 px-3 py-1 font-mono text-[0.65rem] font-bold uppercase tracking-[0.16em] text-white">
            Antes
          </span>
          <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-accent px-3 py-1 font-mono text-[0.65rem] font-bold uppercase tracking-[0.16em] text-white">
            Depois
          </span>

          {/* Divisor arrastável */}
          <div
            className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_0_1px_rgb(14_17_22/.15)]"
            style={{ left: "var(--pos)" }}
          >
            <div
              ref={handle}
              role="slider"
              tabIndex={0}
              aria-label="Comparar antes e depois"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={50}
              aria-valuetext="Arraste para a esquerda para ver o depois"
              onKeyDown={onKey}
              className="pointer-events-auto absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-lg ring-2 ring-accent"
            >
              <ChevronsLeftRight className="h-5 w-5" aria-hidden />
            </div>
          </div>
        </div>

        <div data-reveal className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <p className="text-ink-mute">
            <span className="font-semibold text-ink">Antes:</span> {beforeCaption}
          </p>
          <p className="text-ink-mute sm:text-right">
            <span className="font-semibold text-accent">Depois:</span> {afterCaption}
          </p>
        </div>
      </div>
    </section>
  );
}

/** Os cenários de bagunça. Elementos com `data-chaos` aparecem um a um; `data-strike` são riscos que se desenham. */
function BeforeScene({ before }: { before: Before }) {
  if (before.kind === "chat") {
    return (
      <div className="flex h-full flex-col bg-[#EFEAE2]">
        <div className="flex items-center gap-3 bg-[#075E54] px-4 py-3 text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-bold">W</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">{before.title}</span>
            <span className="block text-xs text-white/70">digitando…</span>
          </span>
          <span className="rounded-full bg-[#25D366] px-2 py-0.5 text-xs font-bold text-[#075E54]">{before.unread}</span>
        </div>
        <div className="flex flex-1 flex-col gap-2 overflow-hidden p-3 pr-[12%] sm:p-4">
          {before.messages.map((m, i) => (
            <div
              key={i}
              data-chaos
              className={`max-w-[78%] rounded-lg px-3 py-1.5 text-[0.82rem] leading-snug text-[#111B21] shadow-sm sm:text-sm ${
                m.mine ? "ml-6 self-start bg-[#D9FDD3]" : "self-start bg-white"
              }`}
            >
              {m.text}
              <span className="ml-2 align-bottom text-[0.65rem] text-[#667781]">{m.time}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Tudo do "antes" fica na metade esquerda, que é a parte visível com o divisor no meio.
  if (before.kind === "agenda") {
    return (
      <div className="relative h-full overflow-hidden bg-[#FBF6E6] p-4 sm:p-6">
        {/* Linhas de caderno */}
        <div
          className="absolute inset-0 opacity-60"
          style={{ backgroundImage: "repeating-linear-gradient(to bottom, transparent 0 39px, #CBD5E1 39px 40px)" }}
        />
        <div className="absolute inset-y-0 left-14 w-px bg-[#F87171]/60 sm:left-20" />
        <div className="relative">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-[#92400E]">{before.title}</p>
          <ul className="mt-3 sm:mt-4">
            {before.slots.map((s) => (
              <li key={s.time} data-chaos className="flex h-10 items-center gap-4 sm:gap-8">
                <span className="w-10 shrink-0 font-mono text-xs text-ink-mute sm:w-12 sm:text-sm">{s.time}</span>
                <span
                  className={`relative italic text-[#1E3A8A] ${s.state === "duvida" ? "text-[#B45309]" : ""}`}
                  style={{ fontFamily: "'Segoe Print', 'Bradley Hand', 'Comic Sans MS', cursive" }}
                >
                  {s.text}
                  {s.state === "riscado" && (
                    <span data-strike className="absolute left-[-4px] right-[-4px] top-1/2 h-0.5 -rotate-3 rounded bg-[#DC2626]" />
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
        {before.notes.map((n, i) => (
          <div
            key={n}
            data-chaos
            className={`absolute w-28 bg-[#FDE047] p-2 text-xs font-semibold leading-snug text-ink shadow-md sm:w-36 sm:p-3 sm:text-sm ${
              i === 0 ? "bottom-20 left-[6%] rotate-3 sm:left-[10%]" : "bottom-6 left-[22%] -rotate-2 sm:left-[28%]"
            }`}
            style={{ fontFamily: "'Segoe Print', 'Bradley Hand', 'Comic Sans MS', cursive" }}
          >
            {n}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center gap-2 bg-[#107C41] px-4 py-3 text-white">
        <FileSpreadsheet className="h-5 w-5" />
        <span className="truncate text-sm font-semibold">{before.title}</span>
      </div>
      <div className="flex-1 overflow-hidden p-2 sm:p-4">
        <table className="w-full table-fixed border-collapse font-mono text-[0.7rem] sm:text-sm">
          <thead>
            <tr>
              {before.headers.map((h) => (
                <th key={h} className="border border-[#D4D4D4] bg-[#F3F3F3] px-1 py-1.5 text-left font-semibold text-ink-soft sm:px-2">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {before.rows.map((r, ri) => (
              <tr key={ri}>
                {r.cells.map((c, ci) => {
                  const bad = r.bad?.includes(ci);
                  return (
                    <td
                      key={ci}
                      {...(bad ? { "data-chaos": "" } : {})}
                      className={`h-9 truncate border border-[#D4D4D4] px-1 sm:h-11 sm:px-2 ${
                        bad ? "animate-[cell-alarm_1.6s_ease-in-out_infinite] font-bold text-[#B91C1C]" : "text-ink"
                      }`}
                    >
                      {c}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * O "depois" de cada categoria, desenhado no estilo do sistema real. Elementos com `data-order`
 * entram um a um quando o divisor revela o "depois" pela primeira vez.
 */
function AfterScene({ after }: { after: After }) {
  if (after.kind === "board") return <BoardAfter after={after} />;
  if (after.kind === "week") return <WeekAfter after={after} />;
  if (after.kind === "spots") return <SpotsAfter after={after} />;
  if (after.kind === "finance") return <FinanceAfter after={after} />;
  return <ProfileAfter after={after} />;
}

type Of<K extends After["kind"]> = Extract<After, { kind: K }>;

/** Alimentação: painel de pedidos em colunas. */
function BoardAfter({ after }: { after: Of<"board"> }) {
  return (
    <div className="flex h-full flex-col bg-paper">
      <div className="flex items-center gap-2 bg-ink px-4 py-3 text-paper">
        <LayoutDashboard className="h-5 w-5 text-accent-bright" />
        <span className="text-sm font-semibold">{after.title}</span>
        <span className="ml-auto flex items-center gap-1.5 text-xs text-paper/70">
          <span className="h-2 w-2 rounded-full bg-[#25D366]" />
          ao vivo
        </span>
      </div>
      <div className="grid flex-1 grid-cols-3 gap-2 p-3 sm:gap-3 sm:p-4">
        {after.columns.map((col, ci) => (
          <div key={col} className="flex min-w-0 flex-col gap-2 rounded-xl bg-paper-line/50 p-1.5 sm:p-2">
            <p className="truncate px-1 font-mono text-[0.6rem] font-bold uppercase tracking-[0.1em] text-ink-mute sm:text-[0.68rem]">
              {col} · {after.orders.filter((o) => o.col === ci).length}
            </p>
            {after.orders
              .filter((o) => o.col === ci)
              .map((o) => (
                <div key={o.id + o.who} data-order className="rounded-lg border border-paper-line bg-paper-card p-2 shadow-sm">
                  <p className="flex items-center justify-between gap-1 text-[0.65rem] sm:text-xs">
                    <span className="truncate font-mono font-bold text-accent">{o.id}</span>
                    <span className="truncate text-ink-mute">{o.who}</span>
                  </p>
                  <p className="mt-1 text-[0.7rem] font-medium leading-snug text-ink sm:text-[0.8rem]">{o.items}</p>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const SESSION_STYLE: Record<WeekSession["status"], { box: string; label: string }> = {
  confirmado: { box: "border-emerald-500 bg-emerald-50 text-emerald-900", label: "Confirmado" },
  pendente: { box: "border-amber-500 bg-amber-50 text-amber-900", label: "A confirmar" },
  pago: { box: "border-sky-500 bg-sky-50 text-sky-900", label: "Pago" },
  falta: { box: "border-dashed border-rose-400 bg-rose-50 text-rose-800", label: "Faltou" },
};

/** Clínica: agenda semanal com cada sessão e o status dela. */
function WeekAfter({ after }: { after: Of<"week"> }) {
  const { days, hours, sessions } = after;
  return (
    <div className="flex h-full flex-col bg-[#FBF8F3]">
      <div className="flex items-center gap-2 bg-[#21424A] px-4 py-3 text-white">
        <CalendarDays className="h-5 w-5 text-[#9ED9C6]" />
        <span className="text-sm font-semibold">{after.title}</span>
        <span className="ml-auto rounded-md border border-white/20 px-2 py-0.5 text-xs text-white/80">Semana atual</span>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 px-3 pt-2 text-[0.6rem] sm:px-4 sm:text-[0.68rem]">
        {Object.values(SESSION_STYLE).map(({ box, label }) => (
          <span key={label} className="flex items-center gap-1 text-ink-soft">
            <span className={`h-2.5 w-2.5 rounded-sm border-l-4 ${box}`} />
            {label}
          </span>
        ))}
      </div>
      <div
        className="m-2 grid flex-1 overflow-hidden rounded-xl border border-[#E7E0D5] bg-white sm:m-3"
        style={{
          gridTemplateColumns: `2.4rem repeat(${days.length}, minmax(0, 1fr))`,
          gridTemplateRows: `auto repeat(${hours.length}, minmax(0, 1fr))`,
        }}
      >
        <span className="border-b border-[#E7E0D5] bg-[#F6F1EA]" />
        {days.map((d) => (
          <span
            key={d}
            className="truncate border-b border-l border-[#E7E0D5] bg-[#F6F1EA] px-1 py-1.5 text-center text-[0.6rem] font-semibold text-ink-soft sm:text-xs"
          >
            {d}
          </span>
        ))}
        {hours.map((h, hi) =>
          [
            <span
              key={h}
              className="border-t border-[#E7E0D5] px-1 pt-1 font-mono text-[0.55rem] text-ink-mute sm:text-[0.65rem]"
              style={{ gridColumn: 1, gridRow: hi + 2 }}
            >
              {h}
            </span>,
            ...days.map((d, di) => (
              <span key={h + d} className="border-l border-t border-[#E7E0D5]" style={{ gridColumn: di + 2, gridRow: hi + 2 }} />
            )),
          ].flat(),
        )}
        {sessions.map((s) => {
          const st = SESSION_STYLE[s.status];
          return (
            <div
              key={`${s.day}-${s.hour}`}
              data-order
              className={`m-0.5 min-w-0 overflow-hidden rounded-md border-l-4 px-1 py-0.5 sm:m-1 sm:px-1.5 ${st.box}`}
              style={{ gridColumn: s.day + 2, gridRow: s.hour + 2 }}
            >
              <p className="truncate text-[0.58rem] font-semibold leading-tight sm:text-[0.72rem]">{s.who}</p>
              <p className="truncate text-[0.52rem] leading-tight opacity-80 sm:text-[0.62rem]">
                {s.kind} · {st.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Turismo: página do cliente com as vagas de cada passeio. */
function SpotsAfter({ after }: { after: Of<"spots"> }) {
  return (
    <div className="flex h-full flex-col bg-[#F4F8FB]">
      <div className="flex items-center justify-between bg-white px-4 py-3 shadow-sm">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#0B2545] sm:text-sm">{after.brand}</span>
        <span className="flex items-center gap-1.5 rounded-lg bg-[#0B6FB8] px-3 py-1.5 text-[0.65rem] font-semibold text-white sm:text-xs">
          <CalendarDays className="h-3.5 w-3.5" />
          Reservar
        </span>
      </div>
      <div className="px-4 pt-3">
        <p className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[#0B6FB8] sm:text-[0.68rem]">Vagas · {after.date}</p>
        <p className="text-lg font-extrabold leading-tight text-[#0B2545] sm:text-2xl">{after.title}</p>
      </div>
      <div className="grid flex-1 grid-cols-2 gap-2 p-3 sm:gap-3 sm:p-4">
        {after.tours.map((t) => {
          const left = t.total - t.booked;
          const full = left <= 0;
          const last = !full && left <= 2;
          const bar = full ? "bg-rose-400" : last ? "bg-amber-300" : "bg-emerald-300";
          return (
            <div
              key={t.name}
              data-order
              className="flex min-w-0 flex-col justify-between rounded-xl bg-gradient-to-br from-[#13315C] to-[#0B2545] p-2.5 text-white shadow-md sm:p-3"
            >
              <div>
                <p className="truncate text-[0.75rem] font-bold sm:text-sm">{t.name}</p>
                <p className="mt-1 flex flex-wrap gap-1 text-[0.55rem] sm:text-[0.65rem]">
                  <span className="flex items-center gap-1 rounded-full bg-white/15 px-1.5 py-0.5">
                    <Clock className="h-2.5 w-2.5" />
                    {t.schedule}
                  </span>
                  <span className="rounded-full bg-white/15 px-1.5 py-0.5">{t.price}</span>
                </p>
              </div>
              <div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/20">
                  <div className={`h-full rounded-full ${bar}`} style={{ width: `${(t.booked / t.total) * 100}%` }} />
                </div>
                <div className="mt-1.5 flex items-center justify-between gap-1">
                  <span className="flex items-center gap-1 text-[0.58rem] text-white/80 sm:text-[0.68rem]">
                    <Users className="h-3 w-3" />
                    {full ? "Esgotado" : left === 1 ? "Última vaga" : last ? `Últimas ${left} vagas` : `${left} vagas livres`}
                  </span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[0.58rem] font-semibold sm:text-[0.68rem] ${
                      full ? "bg-white/10 text-white/50" : "bg-white text-[#0B2545]"
                    }`}
                  >
                    {full ? "Lotado" : "Reservar"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const PAY_STYLE: Record<PayStatus, { cls: string; label: string }> = {
  pago: { cls: "bg-emerald-100 text-emerald-800", label: "Pago" },
  pendente: { cls: "bg-amber-100 text-amber-800", label: "Pendente" },
  atraso: { cls: "bg-red-100 text-red-700", label: "Em atraso" },
};

function Pay({ status }: { status: PayStatus }) {
  const { cls, label } = PAY_STYLE[status];
  return <span className={`whitespace-nowrap rounded-full px-1.5 py-0.5 text-[0.55rem] font-semibold sm:text-[0.65rem] ${cls}`}>{label}</span>;
}

/** Condomínio: o painel financeiro, no estilo do CondoGestão. */
function FinanceAfter({ after }: { after: Of<"finance"> }) {
  const nav = [
    { icon: LayoutDashboard, label: "Dashboard", active: true },
    { icon: Wallet, label: "Receitas" },
    { icon: Receipt, label: "Despesas" },
    { icon: Users, label: "Moradores" },
    { icon: BarChart3, label: "Relatório mensal" },
  ];
  const th = "py-1 pr-1 text-left font-mono text-[0.5rem] font-bold uppercase tracking-[0.08em] text-ink-mute sm:text-[0.6rem]";
  const td = "border-t border-paper-line py-1 pr-1 text-[0.58rem] text-ink sm:py-1.5 sm:text-[0.7rem]";
  return (
    <div className="flex h-full bg-white">
      <aside className="hidden w-36 shrink-0 flex-col bg-[#14213D] p-3 text-white sm:flex">
        <p className="flex items-center gap-1.5 text-sm font-bold">
          <Building2 className="h-4 w-4 text-[#34D399]" />
          {after.brand}
        </p>
        <p className="text-[0.6rem] text-white/50">Gestão financeira</p>
        <ul className="mt-4 space-y-1">
          {nav.map(({ icon: Icon, label, active }) => (
            <li
              key={label}
              className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[0.68rem] ${active ? "bg-white/5 font-semibold text-[#34D399]" : "text-white/60"}`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </li>
          ))}
        </ul>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col gap-2 overflow-hidden p-3 sm:gap-3 sm:p-4">
        <div>
          <p className="text-sm font-bold text-ink sm:text-lg">Dashboard</p>
          <p className="text-[0.6rem] text-ink-mute sm:text-xs">Visão geral do condomínio</p>
        </div>
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {after.kpis.map((k) => (
            <div key={k.label} data-order className="rounded-lg border border-paper-line p-1.5 sm:p-2">
              <p className="truncate font-mono text-[0.5rem] font-bold uppercase tracking-[0.08em] text-ink-mute sm:text-[0.6rem]">{k.label}</p>
              <p className={`truncate text-[0.7rem] font-bold sm:text-base ${k.bad ? "text-red-700" : "text-ink"}`}>{k.value}</p>
            </div>
          ))}
        </div>
        <div className="grid min-h-0 flex-1 gap-2 sm:gap-3 lg:grid-cols-2">
          <div data-order className="min-w-0 rounded-lg border border-paper-line px-2 py-1.5">
            <p className="text-[0.68rem] font-bold text-ink sm:text-sm">Receitas por unidade</p>
            <table className="mt-1 w-full table-fixed">
              <thead>
                <tr>
                  <th className={`${th} w-[38%]`}>Unidade</th>
                  <th className={`${th} hidden sm:table-cell`}>Comp.</th>
                  <th className={th}>Valor</th>
                  <th className={th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {after.revenues.map((r) => (
                  <tr key={r.unit}>
                    <td className={`${td} truncate`}>{r.unit}</td>
                    <td className={`${td} hidden sm:table-cell`}>{r.ref}</td>
                    <td className={td}>{r.value}</td>
                    <td className={td}>
                      <Pay status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div data-order className="min-w-0 rounded-lg border border-paper-line px-2 py-1.5">
            <p className="text-[0.68rem] font-bold text-ink sm:text-sm">Últimas despesas</p>
            <table className="mt-1 w-full table-fixed">
              <thead>
                <tr>
                  <th className={`${th} w-[38%]`}>Descrição</th>
                  <th className={`${th} hidden sm:table-cell`}>Venc.</th>
                  <th className={th}>Valor</th>
                  <th className={th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {after.expenses.map((e) => (
                  <tr key={e.desc}>
                    <td className={`${td} truncate`}>{e.desc}</td>
                    <td className={`${td} hidden sm:table-cell`}>{e.due}</td>
                    <td className={td}>{e.value}</td>
                    <td className={td}>
                      <Pay status={e.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Advocacia: página pessoal do profissional, com serviços e botão de contato numa tela só. */
function ProfileAfter({ after }: { after: Of<"profile"> }) {
  const mark = after.name
    .replace(/^Dra?\.\s*/, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  return (
    <div className="flex h-full flex-col bg-[radial-gradient(ellipse_at_top_right,#2A2A2A,#111111_60%)] text-white">
      <div className="flex items-center justify-between px-4 py-3 text-[0.6rem] sm:px-6 sm:text-xs">
        <span className="font-semibold tracking-wide text-[#E0A526]">{after.name}</span>
        <span className="hidden gap-4 text-white/60 sm:flex">
          <span>Sobre</span>
          <span>Serviços</span>
          <span>Contato</span>
        </span>
      </div>
      <div className="flex flex-1 flex-col justify-center gap-4 px-4 pb-6 sm:flex-row sm:items-center sm:gap-8 sm:px-8">
        <div
          data-order
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3A3A3A] to-[#1C1C1C] text-xl font-bold text-[#E0A526] ring-4 ring-[#E0A526]/50 sm:h-36 sm:w-36 sm:text-4xl"
        >
          {mark}
        </div>
        <div className="min-w-0">
          <p data-order className="font-mono text-[0.55rem] font-bold uppercase tracking-[0.2em] text-[#E0A526] sm:text-[0.68rem]">
            {after.role}
          </p>
          <p data-order className="mt-1 text-xl font-bold leading-tight sm:text-4xl">
            {after.name}
          </p>
          <p data-order className="mt-1 text-xs font-semibold text-[#E0A526] sm:text-lg">
            {after.headline}
          </p>
          <p data-order className="mt-1.5 max-w-md text-[0.68rem] text-white/70 sm:text-sm">
            {after.bio}
          </p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {after.services.map((sv) => (
              <li
                key={sv}
                data-order
                className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2 py-1 text-[0.58rem] sm:px-3 sm:text-xs"
              >
                <ShieldCheck className="h-3 w-3 text-[#E0A526]" />
                {sv}
              </li>
            ))}
          </ul>
          <span
            data-order
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#F2B33D] to-[#D9921A] px-4 py-2 text-[0.68rem] font-bold text-[#1A1206] shadow-lg sm:text-sm"
          >
            <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {after.cta}
          </span>
        </div>
      </div>
    </div>
  );
}
