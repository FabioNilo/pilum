/**
 * Vídeos de divulgação por nicho (vertical 1080×1920, 45–50 s, sem áudio).
 *
 * Roteiro: abertura acelerada → landing (escolhe o nicho, dores, arrasta o antes x depois) →
 * o SISTEMA RODANDO (lado do cliente no celular, painel de gestão no notebook) → toca no botão
 * do WhatsApp → tela final com a oferta. O site aparece dentro de uma moldura (celular ou notebook)
 * e os textos ficam numa faixa fora dela: nada cobre a tela.
 *
 *   npm run videos                         -> todos os nichos configurados
 *   npm run videos -- restaurantes         -> só um
 *
 * Os sistemas sobem como no `npm run capture` (Docker shots-pg + dados fictícios + anonimizador).
 * A cada cena roda o verificador de vazamento; se aparecer dado de cliente, o vídeo NÃO é gerado.
 * Saída: videos/<nicho>.mp4 (fora do git). A música entra depois, no Instagram/TikTok.
 */
import { execFileSync, execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, type Browser, type BrowserContext, type CDPSession, type Locator, type Page } from "playwright";
import { preview } from "vite";
import { startFixtureServer } from "./fixture-server";
import { GLOBAL_REPLACE, installAnonymizer, installTargetRoutes, killTree, leakCheck, startServer, waitForUrl, type Target } from "./lib";
import { targets } from "./targets";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "videos");
const tmpRoot = path.join(root, "scripts", ".tmp", "videos");
const SITE = "pilumcode.vercel.app";
const FADE = 0.35;

// ---------- Geometria da tela final (1080×1920) ----------
type Frame = { vw: number; vh: number; dpr: number; x: number; y: number; w: number; h: number };
/** Celular: viewport 390×760, gravado a 720×1404 e encaixado na moldura. */
const PHONE: Frame = { vw: 390, vh: 760, dpr: 720 / 390, x: 180, y: 150, w: 720, h: 1404 };
/** Notebook: viewport 1100×760 (ainda layout de computador, letras maiores), gravado a 1000×690. */
const LAPTOP: Frame = { vw: 1100, vh: 760, dpr: 1000 / 1100, x: 40, y: 600, w: 1000, h: 690 };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ---------- Roteiros ----------
type Say = (text: string, kicker?: string) => void;
type Shot = { page: Page; base: string; say: Say };
type Login = (page: Page, base: string) => Promise<void>;
type System = {
  target: string;
  /** Ajusta o banco local antes de gravar (ex.: traz as datas dos pedidos para "agora"). */
  prepare?: () => void;
  /** Trocas de texto só para o vídeo (somadas às do alvo e às globais). */
  replace?: [RegExp, string][];
  client: { login?: Login; path: string; run: (s: Shot) => Promise<void> };
  /** `vw`: largura da janela do painel (padrão 1100); alguns só mostram a barra lateral a partir de 1280. */
  admin?: { login: Login; path: string; warm?: string[]; vw?: number; run: (s: Shot) => Promise<void> };
};
type Niche = {
  id: string;
  /** Textos tocados no seletor da landing, em ordem (ex.: "Outro negócio" e depois o segmento). */
  pick: string[];
  hook: string;
  endTitle: string;
  system: System;
};

const SYS_KICKER = "Sistema real · dados fictícios";

function pg(db: string, sql: string) {
  return execSync(`docker exec -i shots-pg psql -U postgres -d ${db} -t -A -v ON_ERROR_STOP=1`, { input: sql, encoding: "utf8" }).trim();
}

/** Guarda os status originais na primeira gravação e os devolve nas seguintes (os cliques do vídeo mudam status). */
function restoreStatuses(db: string, table: string, where: string) {
  const file = path.join(tmpRoot, `${db}-${table}-status.json`);
  if (!existsSync(file)) {
    const rows = pg(db, `select coalesce(json_agg(json_build_object('id', id, 'status', status)), '[]') from ${table} where ${where}`);
    mkdirSync(tmpRoot, { recursive: true });
    writeFileSync(file, rows);
  }
  const rows = JSON.parse(readFileSync(file, "utf8")) as { id: string; status: string }[];
  if (rows.length) pg(db, rows.map((x) => `update ${table} set status = '${x.status}' where id = '${x.id}';`).join("\n"));
}

const loginWith =
  (path: string, user: string, pass: string, userSel: string, passSel: string, landing: (p: string) => boolean): Login =>
  async (page, base) => {
    // Primeira carga só aquece o servidor (o Vite pode recarregar a página ao otimizar dependências).
    await page.goto(base + path, { waitUntil: "load", timeout: 90_000 });
    await page.waitForTimeout(3000);
    await page.goto(base + path, { waitUntil: "load", timeout: 90_000 });
    await page.waitForTimeout(1000);
    await page.locator(userSel).first().fill(user);
    await page.locator(passSel).first().fill(pass);
    await page.locator(passSel).first().press("Enter");
    await page.waitForURL((u) => landing(u.pathname), { timeout: 90_000 });
    await page.waitForTimeout(1500);
  };

const niches: Niche[] = [
  {
    id: "restaurantes",
    pick: ["Restaurantes, bares e food"],
    hook: "Seu restaurante ainda perde pedido no <b>WhatsApp</b>?",
    endTitle: "Seu restaurante <b>organizado</b>",
    system: {
      target: "plataforma-restaurantes",
      prepare() {
        // Pedidos de demonstração com horário de agora (senão o painel mostra "6000 min" de espera).
        pg(
          "plataforma",
          `update "Order" set "createdAt" = "createdAt" + ((now() at time zone 'UTC') - (select max("createdAt") from "Order" where status = 'ENTREGUE')) - interval '40 min'
             where status = 'ENTREGUE';
           update "Order" o set status = v.s::"OrderStatus", "createdAt" = (now() at time zone 'UTC') - (v.m || ' min')::interval
             from (values (276,'RECEBIDO',4),(277,'RECEBIDO',2),(278,'CONFIRMADO',9),(279,'EM_PREPARO',14),(280,'EM_PREPARO',17),
                          (281,'EM_PREPARO',21),(282,'SAIU_PARA_ENTREGA',27),(283,'SAIU_PARA_ENTREGA',31)) as v(n, s, m)
             where o.number = v.n;
           -- Zona do seed com nome de bairro real de Ilhéus: o verificador de vazamento barra.
           update "DeliveryZone" set name = 'Jardim Atlântico' where name = 'Pontal';`,
        );
      },
      client: {
        path: "/demo",
        async run({ page, say }) {
          say("O cliente monta o pedido <b>sozinho</b>", SYS_KICKER);
          await sleep(900);
          await reveal(page, page.getByRole("button", { name: /Adicionar/ }), 300, 2000);
          await sleep(500);
          await tap(page, page.getByRole("button", { name: /Adicionar/ }));
          await sleep(500);
          await tap(page, page.getByRole("button", { name: /Adicionar/ }));
          await sleep(500);
          say("Sacola pronta, <b>sem atendente</b>", SYS_KICKER);
          await tap(page, page.locator('button[aria-label^="Abrir sacola"]'));
          await sleep(2600);
        },
      },
      admin: {
        async login(page, base) {
          await page.goto(base + "/login", { waitUntil: "load", timeout: 90_000 });
          await page.locator('input[name="email"]').fill("dono@demo.com");
          await page.locator('input[name="password"]').fill("senha123");
          await page.locator('input[name="password"]').press("Enter");
          await page.waitForURL((u) => u.pathname.startsWith("/painel"), { timeout: 90_000 });
        },
        path: "/painel",
        warm: ["/painel/metricas", "/painel/estoque"],
        async run({ page, say }) {
          say("O pedido chega no painel <b>na hora</b>", SYS_KICKER);
          await sleep(1800);
          await click(page, page.getByRole("button", { name: /^Confirmado/ }));
          say("Um clique e a cozinha <b>já sabe</b>", SYS_KICKER);
          await sleep(2600);
          await click(page, page.locator('a[href="/painel/metricas"]'));
          say("Quanto vendeu, <b>sem planilha</b>", SYS_KICKER);
          await sleep(1400);
          await scrollBy(page, 320, 1400);
          await sleep(1000);
          await click(page, page.locator('a[href="/painel/estoque"]'));
          say("Bebida acabando? <b>O estoque avisa</b>", SYS_KICKER);
          await sleep(3000);
        },
      },
    },
  },
  {
    id: "lanchonetes",
    pick: ["Lanchonetes e bistrôs"],
    hook: "Fila no balcão e <b>comanda que some</b>?",
    endTitle: "Sua lanchonete <b>sem fila</b>",
    system: {
      target: "restaurante-mesa",
      // O rodapé do cardápio mostra o Instagram do cliente real.
      replace: [[/@?nossobistro[\w.]*/gi, "@seurestaurante"]],
      prepare() {
        restoreStatuses("restaurante", "pedidos_mesa", "status <> 'entregue'");
        pg(
          "restaurante",
          `delete from pedidos_mesa where regexp_replace(coalesce(telefone_cliente, ''), '\\D', '', 'g') = '00987654321';
           create temp table d as select (now() - interval '3 hours') - max(fechada_em) as dt from contas_mesa;
           update contas_mesa set aberta_em = aberta_em + (select dt from d), fechada_em = fechada_em + (select dt from d) where status = 'fechada';
           update pedidos_mesa set created_at = created_at + (select dt from d), updated_at = updated_at + (select dt from d) where status = 'entregue';
           update pedidos_delivery set created_at = created_at + (select dt from d), updated_at = updated_at + (select dt from d),
             entregue_em = entregue_em + (select dt from d) where status = 'entregue';
           update pagamentos set created_at = created_at + (select dt from d);
           update contas_mesa c set aberta_em = now() - ((x.rn * 11 + 6) || ' min')::interval
             from (select id, row_number() over (order by mesa_id) rn from contas_mesa where status = 'aberta') x where c.id = x.id;
           update pedidos_mesa p set created_at = now() - ((x.rn * 3 + 1) || ' min')::interval, updated_at = now()
             from (select id, row_number() over (order by created_at) rn from pedidos_mesa where status <> 'entregue') x where p.id = x.id;
           update pedidos_delivery p set created_at = now() - ((x.rn * 6 + 4) || ' min')::interval, updated_at = now()
             from (select id, row_number() over (order by created_at) rn from pedidos_delivery where status <> 'entregue') x where p.id = x.id;`,
        );
      },
      client: {
        path: "/mesa/demo-mesa-3",
        async run({ page, say }) {
          say("Lê o QR da mesa e pede <b>pelo celular</b>", SYS_KICKER);
          await sleep(900);
          await reveal(page, page.getByRole("button", { name: /^Adicionar/ }), 400, 1600);
          await sleep(400);
          await tap(page, page.getByRole("button", { name: /^Adicionar/ }));
          await sleep(500);
          await tap(page, page.getByRole("button", { name: /Ver pedido/ }));
          await sleep(700);
          await tap(page, page.getByRole("button", { name: "Continuar" }));
          await sleep(500);
          say("Vai direto <b>para o caixa</b>", SYS_KICKER);
          await tap(page, page.locator('[id="mesa-nome"], [name="mesa-nome"]'));
          await page.keyboard.type("Ana", { delay: 110 });
          await tap(page, page.locator('[id="mesa-telefone"], [name="mesa-telefone"]'));
          await page.keyboard.type("00987654321", { delay: 55 });
          await sleep(300);
          await tap(page, page.getByRole("button", { name: /Enviar pedido para o caixa/ }));
          await sleep(1800);
        },
      },
      admin: {
        login: loginWith("/auth", "admin", "demo12345", "#username", "#password", (p) => p.startsWith("/admin")),
        path: "/admin/mesas",
        async run({ page, say }) {
          say("Cada mesa <b>ao vivo</b>, sem comanda de papel", SYS_KICKER);
          await sleep(2000);
          await click(page, page.locator('a[href="/admin/mesas/13"]').filter({ hasText: "Comanda" }));
          say("Confirma o pedido com <b>um clique</b>", SYS_KICKER);
          await sleep(1600);
          // O último da lista é o pedido que a "Ana" acabou de mandar pelo celular, nesta mesma gravação.
          await click(page, page.getByRole("button", { name: "Confirmar pedido" }).last());
          await sleep(1800);
          say("Conta dividida, <b>sem calculadora</b>", SYS_KICKER);
          await reveal(page, page.getByText("Fechar conta").first(), 70, 1300);
          await sleep(500);
          lastCursor = { x: lastCursor.x, y: Math.max(40, lastCursor.y - 300) };
          await click(page, page.getByRole("button", { name: "Dividir pagamento" }));
          await sleep(2400);
        },
      },
    },
  },
  {
    id: "clinicas",
    pick: ["Outro negócio", "Clínicas e consultórios"],
    hook: "Paciente marcou e <b>ninguém anotou</b>?",
    endTitle: "Sua clínica <b>organizada</b>",
    system: {
      target: "clinica-odonto",
      client: {
        // O paciente chega pelo assistente de WhatsApp (sem tela); no celular mostramos a agenda da clínica.
        login: loginWith("/admin/login", "admin@clinica.com", "demo12345", 'input[type="email"]', 'input[type="password"]', (p) => p.startsWith("/admin") && !p.includes("login")),
        path: "/admin/agenda",
        async run({ page, say }) {
          say("A agenda da clínica <b>no seu celular</b>", SYS_KICKER);
          await sleep(1000);
          await reveal(page, page.getByText("Compromissos do dia").first(), 80, 1800);
          await sleep(1300);
          await scrollBy(page, 420, 1600);
          await sleep(1600);
        },
      },
      admin: {
        login: loginWith("/admin/login", "admin@clinica.com", "demo12345", 'input[type="email"]', 'input[type="password"]', (p) => p.startsWith("/admin") && !p.includes("login")),
        path: "/admin",
        vw: 1280,
        async run({ page, say }) {
          say("O dia da clínica <b>num painel só</b>", SYS_KICKER);
          await sleep(2000);
          await click(page, page.locator('a[href="/admin/solicitacoes"]').filter({ hasText: /^Solicitac/ }));
          say("Pedidos do WhatsApp, <b>organizados pela IA</b>", SYS_KICKER);
          await sleep(900);
          await reveal(page, page.getByText("Entradas operacionais").first(), 70, 1300);
          await sleep(1600);
          await scrollBy(page, -3000, 700);
          await click(page, page.locator('a[href="/admin/agenda"]').filter({ hasText: /^Agenda/ }));
          say("Agenda do dia, <b>com o status</b> de cada paciente", SYS_KICKER);
          await sleep(900);
          await reveal(page, page.getByText("Compromissos do dia").first(), 60, 1300);
          await sleep(1800);
          await scrollBy(page, -3000, 700);
          await click(page, page.locator('a[href="/admin/financeiro"]').filter({ hasText: /^Financeiro/ }));
          say("Quem pagou e quem <b>está em aberto</b>", SYS_KICKER);
          await sleep(2700);
        },
      },
    },
  },
];

// ---------- Camada injetada nas páginas: dedo, cursor, rolagem suave ----------
const OVERLAY = `
(() => {
  const css = \`
    html { scroll-behavior: auto !important; }
    #vid-finger { position: fixed; left: 0; top: 0; width: 44px; height: 44px; margin: -22px 0 0 -22px; z-index: 2147483001;
      border-radius: 50%; background: rgb(255 255 255 / .55); border: 3px solid #fff; box-shadow: 0 6px 20px rgb(0 0 0 / .35);
      opacity: 0; pointer-events: none; transition: opacity .2s, transform .12s; }
    #vid-finger.on { opacity: 1; }
    #vid-finger.down { transform: scale(.8); background: rgb(179 38 30 / .55); }
    #vid-cursor { position: fixed; left: 0; top: 0; width: 26px; height: 26px; z-index: 2147483001; pointer-events: none; opacity: 0;
      transition: opacity .2s; filter: drop-shadow(0 2px 3px rgb(0 0 0 / .4)); }
    #vid-cursor.on { opacity: 1; }
    #vid-ripple { position: fixed; width: 40px; height: 40px; margin: -20px 0 0 -20px; border-radius: 50%; border: 3px solid #E0483D;
      z-index: 2147483000; pointer-events: none; opacity: 0; }
    #vid-ripple.go { animation: vidRipple .5s ease-out; }
    @keyframes vidRipple { from { opacity: 1; transform: scale(.3); } to { opacity: 0; transform: scale(1.4); } }
    nextjs-portal, [data-nextjs-toast], [data-lovable-badge], #lovable-badge, .lovable-badge, a[href*="lovable.dev"] { display: none !important; }
  \`;
  const mount = () => {
    const st = document.createElement("style");
    st.textContent = css;
    document.head.appendChild(st);
    const f = document.createElement("div");
    f.id = "vid-finger";
    const c = document.createElement("div");
    c.id = "vid-cursor";
    c.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26"><path d="M4 2l15 11-6.5 1.2L16 21l-3 1.3-3.4-6.8L5 19z" fill="#111" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    const r = document.createElement("div");
    r.id = "vid-ripple";
    document.body.append(f, c, r);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
  // Nenhum clique de vídeo abre o WhatsApp de verdade.
  document.addEventListener("click", (e) => { if (e.target.closest && e.target.closest('a[href*="wa.me"]')) e.preventDefault(); }, true);

  window.__finger = (x, y, state) => {
    const f = document.getElementById("vid-finger");
    if (!f) return;
    f.style.left = x + "px"; f.style.top = y + "px";
    f.className = state === "hide" ? "" : state === "down" ? "on down" : "on";
  };
  window.__cursor = (x, y, click) => {
    const c = document.getElementById("vid-cursor");
    if (!c) return;
    c.style.left = x - 4 + "px"; c.style.top = y - 2 + "px"; c.className = "on";
    if (click) {
      const r = document.getElementById("vid-ripple");
      r.style.left = x + "px"; r.style.top = y + "px";
      r.className = ""; void r.offsetWidth; r.className = "go";
    }
  };
  const animate = (to, ms) => new Promise((done) => {
    const from = window.scrollY, t0 = performance.now();
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const step = (now) => {
      const t = Math.min(1, (now - t0) / ms);
      window.scrollTo(0, from + (to - from) * ease(t));
      if (t < 1) requestAnimationFrame(step); else done();
    };
    requestAnimationFrame(step);
  });
  window.__scroll = (selector, offset, ms) => {
    const el = document.querySelector(selector);
    if (!el) return Promise.resolve();
    return animate(Math.max(0, el.getBoundingClientRect().top + window.scrollY - offset), ms);
  };
  window.__scrollBy = (dy, ms) => animate(window.scrollY + dy, ms);
})();
`;

const scrollTo = (page: Page, selector: string, offset: number, ms: number) =>
  page.evaluate(([s, o, m]) => (window as any).__scroll(s, o, m), [selector, offset, ms] as const);
const scrollBy = (page: Page, dy: number, ms: number) => page.evaluate(([d, m]) => (window as any).__scrollBy(d, m), [dy, ms] as const);
const finger = (page: Page, x: number, y: number, state: "on" | "down" | "hide") =>
  page.evaluate(([x, y, s]) => (window as any).__finger(x, y, s), [x, y, state] as const);
const cursor = (page: Page, x: number, y: number, clickNow = false) =>
  page.evaluate(([x, y, c]) => (window as any).__cursor(x, y, c), [x, y, clickNow] as const);

/** Rola até o primeiro elemento do localizador ficar a `top` px do topo da tela. */
async function reveal(page: Page, loc: Locator, top: number, ms: number) {
  const b = await loc.first().boundingBox();
  if (b) await scrollBy(page, b.y - top, ms);
}

/** Primeiro elemento do localizador que está inteiro dentro da tela. */
async function visible(page: Page, loc: Locator) {
  const vh = page.viewportSize()!.height;
  for (let i = 0; i < (await loc.count()); i++) {
    const b = await loc.nth(i).boundingBox();
    if (b && b.y >= 0 && b.y + b.height <= vh - 4) return b;
  }
  throw new Error(`nada visível para ${loc}`);
}

/** O "dedo" (celular) aparece, toca e some. */
async function tap(page: Page, loc: Locator) {
  const b = await visible(page, loc);
  const x = b.x + b.width / 2;
  const y = b.y + b.height / 2;
  await finger(page, x, y + 50, "on");
  await sleep(120);
  await finger(page, x, y, "on");
  await sleep(380);
  await finger(page, x, y, "down");
  await page.mouse.click(x, y);
  await sleep(200);
  await finger(page, x, y, "on");
  await sleep(220);
  await finger(page, x, y, "hide");
}

/** O cursor (notebook) desliza até o alvo e clica. */
let lastCursor = { x: 640, y: 400 };
async function click(page: Page, loc: Locator) {
  const b = await visible(page, loc);
  const to = { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  const steps = 22;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const e = 1 - Math.pow(1 - t, 3);
    const x = lastCursor.x + (to.x - lastCursor.x) * e;
    const y = lastCursor.y + (to.y - lastCursor.y) * e;
    await page.mouse.move(x, y);
    await cursor(page, x, y);
    await sleep(600 / steps);
  }
  lastCursor = to;
  await sleep(150);
  await cursor(page, to.x, to.y, true);
  await page.mouse.click(to.x, to.y);
}

// ---------- Gravação ----------
type Caption = { at: number; text: string; kicker?: string };
type Clip = { kind: "phone" | "laptop" | "full"; frames: { data: string; ts: number }[]; tEnd: number; captions: Caption[] };

async function startRecorder(cdp: CDPSession, maxWidth: number, maxHeight: number) {
  const frames: { data: string; ts: number }[] = [];
  cdp.on("Page.screencastFrame", (f) => {
    frames.push({ data: f.data, ts: f.metadata.timestamp ?? Date.now() / 1000 });
    cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
  });
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, maxWidth, maxHeight, everyNthFrame: 1 });
  return { frames, stop: async () => (await cdp.send("Page.stopScreencast"), Date.now() / 1000) };
}

const PROD_DATA_HOSTS = (url: URL) =>
  /\.easypanel\.host$|\.neon\.tech$|\.lovable\.app$|\.vercel\.app$/.test(url.hostname) ||
  (/\.supabase\.co$/.test(url.hostname) && !url.pathname.startsWith("/storage/v1/object/public/"));

async function makeContext(browser: Browser, f: Frame, t?: Target, base?: string, skipIntro = false, extra: [RegExp, string][] = []): Promise<BrowserContext> {
  const c = await browser.newContext({
    viewport: { width: f.vw, height: f.vh },
    deviceScaleFactor: f.dpr,
    locale: "pt-BR",
    timezoneId: "America/Bahia",
    colorScheme: "light",
    reducedMotion: "no-preference",
  });
  await c.addInitScript("globalThis.__name = (f) => f;");
  if (process.env.VIDEO_DEBUG) c.on("page", (p) => p.on("pageerror", (e) => console.log(`  [pageerror] ${e.message}`)));
  await c.addInitScript(OVERLAY);
  if (skipIntro) await c.addInitScript(() => sessionStorage.setItem("pi-intro", "1"));
  if (t && base) {
    await c.route(PROD_DATA_HOSTS, (route) => route.abort());
    await installAnonymizer(c, [...extra, ...(t.replace ?? []), ...GLOBAL_REPLACE]);
    await installTargetRoutes(c, t, base);
    await t.init?.(c, base);
    const hide = `${t.keepLogos ? "" : 'img[src*="logo" i], img[alt*="logo" i], img[src*="brand/" i] { visibility: hidden !important; }'} ${t.css ?? ""}`;
    await c.addInitScript((css) => {
      const add = () => document.head.appendChild(Object.assign(document.createElement("style"), { textContent: css }));
      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", add);
      else add();
    }, hide);
  }
  return c;
}

/** Grava uma cena: a página já está pronta (fora do vídeo); liga a gravação, roda o roteiro e confere vazamentos. */
async function recordScene(
  page: Page,
  kind: Clip["kind"],
  f: { w: number; h: number },
  run: (say: Say) => Promise<void>,
  opts: { leaks?: string[] } = {},
): Promise<Clip> {
  const cdp = await page.context().newCDPSession(page);
  const captions: Caption[] = [];
  const say: Say = (text, kicker) => captions.push({ at: Date.now() / 1000, text, kicker });
  const rec = await startRecorder(cdp, f.w, f.h);
  try {
    await run(say);
  } catch (err) {
    // Print da tela no momento da falha, para depurar o roteiro.
    mkdirSync(tmpRoot, { recursive: true });
    await page.screenshot({ path: path.join(tmpRoot, "falha.png") }).catch(() => {});
    throw err;
  }
  if (opts.leaks) opts.leaks.push(...(await leakCheck(page)));
  const tEnd = await rec.stop();
  return { kind, frames: rec.frames, tEnd, captions };
}

async function landingIntro(browser: Browser, base: string, n: Niche): Promise<Clip> {
  const ctx = await makeContext(browser, PHONE);
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Animation.enable");
  await page.goto(base + "/", { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#intro");
  await cdp.send("Animation.setPlaybackRate", { playbackRate: 2 });
  await page.evaluate(() => document.fonts.ready);
  const clip = await recordScene(page, "phone", PHONE, async (say) => {
    say(n.hook);
    await sleep(2700);
    await cdp.send("Animation.setPlaybackRate", { playbackRate: 1 });
    await page.locator("#intro").click({ force: true }).catch(() => {});
    await sleep(1500);
    say("");
    await scrollTo(page, "#seu-negocio-titulo", 110, 1100);
    await sleep(300);
    for (const label of n.pick) {
      await tap(page, page.locator(`button[role="radio"]:has-text("${label}")`));
      await sleep(450);
    }
    await scrollTo(page, "#dores", 90, 1000);
    await sleep(2200);
    const stage = 'div.group:has([role="slider"])';
    await scrollTo(page, stage, 175, 1000);
    say("Do <b>caos</b> ao <b>controle</b>");
    await sleep(1700);
    const box = (await page.locator(stage).first().boundingBox())!;
    const h = (await page.locator('[role="slider"]').boundingBox())!;
    const y = box.y + box.height / 2;
    const startX = h.x + h.width / 2;
    const target = box.x + box.width * 0.04;
    await finger(page, startX, y, "on");
    await sleep(300);
    await page.mouse.move(startX, y);
    await page.mouse.down();
    const steps = 60;
    let x = startX;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      x = startX + (target - startX) * (1 - Math.pow(1 - t, 2));
      await page.mouse.move(x, y);
      await finger(page, x, y, "down");
      await sleep(2600 / steps);
    }
    await page.mouse.up();
    await finger(page, x, y, "hide");
    await sleep(1300);
  });
  await ctx.close();
  return clip;
}

async function landingCta(browser: Browser, base: string, n: Niche): Promise<Clip> {
  const ctx = await makeContext(browser, PHONE, undefined, undefined, true);
  const page = await ctx.newPage();
  await page.goto(`${base}/?nicho=${n.id}`, { waitUntil: "load" });
  await page.waitForTimeout(800);
  const btn = page.locator("#solucoes a.btn-primary").first();
  await scrollTo(page, "#solucoes article", 120, 10);
  await page.waitForTimeout(1500);
  await btn.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, 220));
  await page.waitForTimeout(1200);
  const clip = await recordScene(page, "phone", PHONE, async (say) => {
    say("Gostou? <b>Fale comigo</b>", "Um toque e a conversa começa");
    await sleep(900);
    await tap(page, btn);
    await sleep(1100);
  });
  await ctx.close();
  return clip;
}

const END_HTML = (n: Niche) => `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@500;600&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet">
<style>
  html,body{margin:0;height:100%;background:radial-gradient(ellipse at top,#2A1414,#0E1116 65%);color:#ECEDEF}
  body{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:44px;padding:0 80px;text-align:center}
  body.go>*{opacity:0;animation:pop .55s cubic-bezier(.2,1.4,.4,1) forwards}
  .logo{font:400 130px/.95 Anton,Impact,sans-serif;text-transform:uppercase}
  .logo small{display:block;font:700 40px/1 "JetBrains Mono",monospace;letter-spacing:.55em;color:#E0483D;margin-top:14px}
  h1{font:400 96px/1.05 Anton,Impact,sans-serif;text-transform:uppercase;margin:0} h1 b{font-weight:400;color:#E0483D}
  .offer{font:600 50px/1.3 Inter,sans-serif;margin:0} .offer b{color:#FFD54A}
  .sub{font:500 36px/1.4 Inter,sans-serif;color:rgb(236 237 239/.7);margin:-16px 0 0}
  .url{font:700 48px/1 "JetBrains Mono",monospace;background:#B3261E;color:#fff;padding:34px 48px;border-radius:999px}
  body.go .url{animation:pop .55s cubic-bezier(.2,1.4,.4,1) forwards,ring 1.6s 1.6s ease-out infinite}
  @keyframes pop{from{opacity:0;transform:translateY(30px) scale(.92)}to{opacity:1;transform:none}}
  @keyframes ring{0%{box-shadow:0 0 0 0 rgb(224 72 61/.6)}100%{box-shadow:0 0 0 40px rgb(224 72 61/0)}}
</style></head><body>
<div class="logo" style="animation-delay:.2s">Pilum<small>Code</small></div>
<h1 style="animation-delay:.45s">${n.endTitle}</h1>
<p class="offer" style="animation-delay:.7s">Seu sistema pronto em <b>menos de 24 horas</b>, com a sua marca</p>
<p class="sub" style="animation-delay:.9s">Teste o protótipo antes de decidir.</p>
<div class="url" style="animation-delay:1.15s">${SITE}</div>
</body></html>`;

async function endCard(browser: Browser, n: Niche): Promise<Clip> {
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  // Carrega as fontes antes; a animação só começa (classe "go") com a gravação ligada.
  await page.setContent(END_HTML(n), { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const clip = await recordScene(page, "full", { w: 1080, h: 1920 }, async () => {
    await page.evaluate(() => document.body.classList.add("go"));
    await sleep(4300);
  });
  await ctx.close();
  return clip;
}

async function systemClips(browser: Browser, n: Niche, leaks: string[]): Promise<Clip[]> {
  const sys = n.system;
  const t = targets.find((x) => x.id === sys.target)!;
  const base = `http://127.0.0.1:${t.port}`;
  const servers = startServer(t);
  const clips: Clip[] = [];
  try {
    await waitForUrl(base, 180_000);
    sys.prepare?.();

    // Lado do cliente, no celular
    const cctx = await makeContext(browser, PHONE, t, base, false, sys.replace);
    const cp = await cctx.newPage();
    await sys.client.login?.(cp, base);
    // Primeira carga aquece o servidor (o Vite pode reotimizar dependências e quebrar a página); a segunda vale.
    await cp.goto(base + sys.client.path, { waitUntil: "load", timeout: 120_000 });
    await cp.waitForTimeout(4000);
    await cp.goto(base + sys.client.path, { waitUntil: "load", timeout: 120_000 });
    await cp.waitForTimeout(3500);
    leaks.push(...(await leakCheck(cp)));
    clips.push(await recordScene(cp, "phone", PHONE, (say) => sys.client.run({ page: cp, base, say }), { leaks }));
    await cctx.close();

    // Painel de gestão, no notebook
    if (sys.admin) {
      // Mesma área na moldura (1000×690); muda só a largura da janela gravada.
      const vw = sys.admin.vw ?? LAPTOP.vw;
      const view: Frame = { ...LAPTOP, vw, vh: Math.round((vw * LAPTOP.h) / LAPTOP.w), dpr: LAPTOP.w / vw };
      const actx = await makeContext(browser, view, t, base, false, sys.replace);
      const ap = await actx.newPage();
      await sys.admin.login(ap, base);
      if (process.env.VIDEO_DEBUG) {
        console.log(`  [debug] depois do login: ${ap.url()} cookies=${(await actx.cookies()).map((c) => c.name).join(",")}`);
        await ap.screenshot({ path: path.join(tmpRoot, "login.png") });
      }
      for (const w of sys.admin.warm ?? []) {
        await ap.goto(base + w, { waitUntil: "load", timeout: 120_000 });
        if (process.env.VIDEO_DEBUG) console.log(`  [debug] aquecendo ${w}: ${ap.url()}`);
      }
      // Alguns painéis perdem a sessão ao recarregar a página: só navega se o login não terminou na tela certa.
      if (new URL(ap.url()).pathname !== sys.admin.path) await ap.goto(base + sys.admin.path, { waitUntil: "load", timeout: 120_000 });
      await ap.waitForTimeout(3000);
      if (!new URL(ap.url()).pathname.startsWith(sys.admin.path)) throw new Error(`o painel não abriu (${ap.url()}): login perdido?`);
      leaks.push(...(await leakCheck(ap)));
      lastCursor = { x: 900, y: 500 };
      await ap.mouse.move(lastCursor.x, lastCursor.y);
      await cursor(ap, lastCursor.x, lastCursor.y);
      clips.push(await recordScene(ap, "laptop", LAPTOP, (say) => sys.admin!.run({ page: ap, base, say }), { leaks }));
      await actx.close();
    }
  } finally {
    servers.forEach(killTree);
  }
  return clips;
}

// ---------- Montagem ----------
const FONTS = `<link href="https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet">`;
const LOGO = (top: number) => `<div style="position:absolute;left:0;right:0;top:${top}px;text-align:center;font:400 60px/0.95 Anton,Impact,sans-serif;text-transform:uppercase;color:#ECEDEF">
  Pilum<small style="display:block;font:700 20px/1 'JetBrains Mono',monospace;letter-spacing:.55em;color:#E0483D;margin-top:6px;padding-left:.55em">Code</small></div>`;

/** Moldura (celular ou notebook) com o fundo da marca; o "buraco" da tela fica transparente. */
const FRAME_HTML = (kind: "phone" | "laptop") => {
  const f = kind === "phone" ? PHONE : LAPTOP;
  const bezel = kind === "phone" ? 18 : 14;
  const r = kind === "phone" ? 46 : 8;
  const extra =
    kind === "laptop"
      ? `<div style="position:absolute;left:0;width:1080px;top:${f.y + f.h + bezel}px;height:26px;border-radius:0 0 22px 22px;background:linear-gradient(#3a3f48,#1d2129)"></div>
         <div style="position:absolute;left:465px;width:150px;top:${f.y + f.h + bezel}px;height:10px;border-radius:0 0 10px 10px;background:#121418"></div>
         <div style="position:absolute;left:0;right:0;top:${f.y - 70}px;text-align:center;font:700 22px/1 'JetBrains Mono',monospace;letter-spacing:.2em;color:rgb(236 237 239/.55);text-transform:uppercase">Painel de gestão · no computador</div>`
      : "";
  return `<!doctype html><html><head><meta charset="utf-8">${FONTS}
<style>html,body{margin:0;width:1080px;height:1920px;background:transparent;overflow:hidden}</style></head><body>
<div style="position:absolute;left:${f.x}px;top:${f.y}px;width:${f.w}px;height:${f.h}px;border-radius:${r}px;box-shadow:0 0 0 3000px #0E1116"></div>
<div style="position:absolute;left:${f.x - bezel}px;top:${f.y - bezel}px;width:${f.w + 2 * bezel}px;height:${f.h + 2 * bezel}px;box-sizing:border-box;
  border:${bezel}px solid #1d2129;border-radius:${r + bezel}px"></div>
${extra}
${LOGO(kind === "phone" ? 28 : 160)}
</body></html>`;
};

/** Faixa de texto: abaixo do celular ou abaixo do notebook. */
const CAPTION_HTML = (kind: "phone" | "laptop", c: Caption) => {
  const top = kind === "phone" ? PHONE.y + PHONE.h + 44 : LAPTOP.y + LAPTOP.h + 110;
  return `<!doctype html><html><head><meta charset="utf-8">${FONTS}
<style>html,body{margin:0;width:1080px;height:1920px;background:transparent}
.k{font:700 24px/1 'JetBrains Mono',monospace;letter-spacing:.2em;text-transform:uppercase;color:#E0483D;margin-bottom:16px}
.t{font:400 ${kind === "phone" ? 68 : 84}px/1.05 Anton,Impact,sans-serif;text-transform:uppercase;color:#fff} .t b{font-weight:400;color:#FFD54A}</style></head><body>
<div style="position:absolute;left:50px;right:50px;top:${top}px;text-align:center">${c.kicker ? `<div class="k">${c.kicker}</div>` : ""}<div class="t">${c.text}</div></div>
</body></html>`;
};

async function renderPng(browser: Browser, html: string, file: string) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: file, omitBackground: true });
  await page.close();
}

function ffmpeg(args: string[], cwd: string) {
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args], { cwd, stdio: "inherit" });
}
const probe = (file: string) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], { encoding: "utf8" }).trim());

/** Uma cena: frames → vídeo no tamanho da tela; depois moldura + faixa de texto em 1080×1920. */
async function composeClip(browser: Browser, clip: Clip, dir: string, idx: number): Promise<string> {
  const cdir = path.join(dir, `c${idx}`);
  mkdirSync(cdir, { recursive: true });
  const list: string[] = [];
  clip.frames.forEach((fr, i) => {
    const file = `f${String(i).padStart(5, "0")}.jpg`;
    writeFileSync(path.join(cdir, file), Buffer.from(fr.data, "base64"));
    const next = i + 1 < clip.frames.length ? clip.frames[i + 1].ts : clip.tEnd;
    list.push(`file '${file}'`, `duration ${Math.max(0.001, next - fr.ts).toFixed(4)}`);
  });
  list.push(`file 'f${String(clip.frames.length - 1).padStart(5, "0")}.jpg'`);
  writeFileSync(path.join(cdir, "list.txt"), list.join("\n"));

  const t0 = clip.frames[0].ts;
  const dur = clip.tEnd - t0;
  const out = path.join(dir, `seg${idx}.mp4`);
  const enc = ["-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p", "-t", dur.toFixed(3), out];
  if (clip.kind === "full") {
    ffmpeg(["-f", "concat", "-safe", "0", "-i", "list.txt", "-vf", "fps=30,scale=1080:1920,setsar=1", ...enc], cdir);
    return out;
  }
  const f = clip.kind === "phone" ? PHONE : LAPTOP;
  await renderPng(browser, FRAME_HTML(clip.kind), path.join(cdir, "frame.png"));
  const inputs = ["-f", "concat", "-safe", "0", "-i", "list.txt", "-loop", "1", "-t", dur.toFixed(3), "-i", "frame.png"];
  let filter = `[0:v]fps=30,scale=${f.w}:${f.h},pad=1080:1920:${f.x}:${f.y}:color=0x0E1116,setsar=1[v0];[v0][1:v]overlay=0:0[v1]`;
  let last = "v1";
  const caps = clip.captions
    .map((c, i) => ({ ...c, start: Math.max(0, c.at - t0), end: i + 1 < clip.captions.length ? clip.captions[i + 1].at - t0 : dur }))
    .filter((c) => c.text);
  for (const [i, c] of caps.entries()) {
    const png = `cap${i}.png`;
    await renderPng(browser, CAPTION_HTML(clip.kind, c), path.join(cdir, png));
    inputs.push("-loop", "1", "-t", dur.toFixed(3), "-i", png);
    const outAt = Math.max(c.start + 0.3, c.end - 0.25);
    const fadeOut = c.end < dur - 0.05 ? `,fade=t=out:st=${outAt.toFixed(2)}:d=0.25:alpha=1` : "";
    filter += `;[${2 + i}:v]format=rgba,fade=t=in:st=${c.start.toFixed(2)}:d=0.3:alpha=1${fadeOut}[c${i}];[${last}][c${i}]overlay=0:0[o${i}]`;
    last = `o${i}`;
  }
  ffmpeg([...inputs, "-filter_complex", filter, "-map", `[${last}]`, ...enc], cdir);
  return out;
}

/** Junta as cenas com uma transição curta (fade) entre elas. */
function concatSegments(segs: string[], out: string, cwd: string) {
  const durs = segs.map(probe);
  const inputs = segs.flatMap((s) => ["-i", s]);
  let filter = "";
  let last = "0:v";
  let acc = durs[0];
  for (let i = 1; i < segs.length; i++) {
    filter += `${filter ? ";" : ""}[${last}][${i}:v]xfade=transition=fade:duration=${FADE}:offset=${(acc - FADE).toFixed(3)}[x${i}]`;
    last = `x${i}`;
    acc += durs[i] - FADE;
  }
  ffmpeg([...inputs, "-filter_complex", filter, "-map", `[${last}]`, "-c:v", "libx264", "-crf", "18", "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", out], cwd);
  return acc;
}

// ---------- Execução ----------
const only = process.argv.slice(2);
const selected = only.length ? niches.filter((n) => only.includes(n.id)) : niches;
if (!selected.length) {
  console.error(`Nenhum vídeo encontrado. Disponíveis: ${niches.map((n) => n.id).join(", ")}`);
  process.exit(1);
}

const landing = process.env.VIDEO_URL?.replace(/\/$/, "");
const server = landing ? null : await preview({ root, preview: { port: 4180, strictPort: true }, logLevel: "warn" });
const base = landing ?? "http://localhost:4180";
// O preview() do Vite define NODE_ENV=production neste processo; os sistemas que sobem depois herdariam
// isso e o Vite deles quebraria ("_jsxDEV is not a function").
delete process.env.NODE_ENV;
const fixtures = await startFixtureServer();
const browser = await chromium.launch();
let failures = 0;

try {
  for (const n of selected) {
    console.log(`\n▶ ${n.id}`);
    const leaks: string[] = [];
    const dir = path.join(tmpRoot, n.id);
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    try {
      const clips = [await landingIntro(browser, base, n), ...(await systemClips(browser, n, leaks)), await landingCta(browser, base, n), await endCard(browser, n)];
      if (leaks.length) throw new Error(`possível dado de cliente na tela: ${[...new Set(leaks)].join(" | ")}`);
      const segs: string[] = [];
      for (const [i, c] of clips.entries()) segs.push(await composeClip(browser, c, dir, i));
      mkdirSync(outDir, { recursive: true });
      const out = path.join(outDir, `${n.id}.mp4`);
      const total = concatSegments(segs, out, dir);
      console.log(`  ${path.relative(root, out)}: ${total.toFixed(1)} s (cenas: ${clips.map((c) => (c.tEnd - c.frames[0].ts).toFixed(1)).join(" + ")})`);
      if (total > 50.5) console.warn("  ⚠ passou de 50 s: encurte as pausas do roteiro.");
    } catch (err) {
      failures++;
      console.error(`  ✗ ${n.id}: ${(err as Error).message}`);
    }
  }
} finally {
  await browser.close();
  fixtures.close();
  await new Promise((r) => server?.httpServer.close(r) ?? r(null));
}
process.exit(failures ? 1 : 0);
