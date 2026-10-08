import { spawn, execSync, type ChildProcess } from "node:child_process";
import path from "node:path";
import type { Browser, BrowserContext, Page } from "playwright";

export type Device = "desktop" | "mobile";

export const FIXTURE_PORT = 4999;
export const FX = `http://127.0.0.1:${FIXTURE_PORT}`;

export type Shot = { name: string; caption: string; device: Device };

export type Ctx = {
  base: string;
  /** Abre (ou reaproveita) uma aba no tamanho do dispositivo. */
  page(device: Device): Promise<Page>;
  shot(page: Page, name: string, caption: string, opts?: { fullPage?: boolean }): Promise<void>;
  goto(page: Page, path: string, waitFor?: string): Promise<void>;
};

export type Target = {
  id: string;
  cwd: string;
  /** Comando(s) que sobem o app (ex.: API + Vite). {port} é substituído. */
  cmd: string | string[];
  port: number;
  env?: Record<string, string>;
  /** Trocas de texto específicas deste app (além das globais). */
  replace?: [string | RegExp, string][];
  /** CSS extra injetado antes de cada print (ex.: esconder logo). */
  css?: string;
  /** Logos do próprio produto (não de cliente) podem aparecer. */
  keepLogos?: boolean;
  /** Prepara o contexto (localStorage, cookies) antes da primeira navegação. */
  init?: (context: BrowserContext, base: string) => Promise<void>;
  /** Encaminha requisições da própria origem (ex.: "/api") para um backend local. */
  proxy?: {
    prefix: string;
    to: string;
    /** Reescreve o caminho antes de encaminhar (ex.: /api/marmitas/ -> /api/massas/). */
    rewrite?: [RegExp, string];
    /** Ações do admin ({ action }) respondidas com dados fictícios em vez do backend. */
    actions?: Record<string, (body: any) => unknown>;
    /** Ajusta a resposta JSON do backend antes de entregar ao app. */
    transform?: (pathname: string, json: any) => any;
  };
  /** Serve arquivos locais num prefixo da própria origem (ex.: fotos de produtos). */
  files?: { prefix: string; dir: string };
  /** Substitui o public/runtime-config.js do app (que pode apontar para produção). */
  runtimeConfig?: Record<string, string>;
  run(ctx: Ctx): Promise<void>;
};

// Nomes de clientes reais: nunca podem aparecer nos prints.
export const GLOBAL_REPLACE: [string | RegExp, string][] = [
  [/Nosso Bistr[ôo] Caf[ée]/gi, "Seu Restaurante"],
  [/Nosso Bistr[ôo]/gi, "Seu Restaurante"],
  [/Neide Gama Congelados/gi, "Sua Marca Fit"],
  [/Neide Gama/gi, "Sua Marca"],
  [/Neide/g, "Sua Marca"],
  [/Pasta Brasiliana/gi, "Sua Cantina"],
  [/Florecer/gi, "Clínica Exemplo"],
  [/Mileide/gi, "Exemplo"],
  [/Ilh[ée]us|Itabuna/g, "Sua Cidade"],
  [/neidemarmitafit\.com\.br|nossobistro\.vercel\.app/gi, "seunegocio.com.br"],
];

export const VIEWPORTS: Record<Device, { width: number; height: number; deviceScaleFactor: number; isMobile: boolean; hasTouch: boolean }> = {
  desktop: { width: 1440, height: 900, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
  mobile: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};

export async function waitForUrl(url: string, timeoutMs = 120_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.status < 500) return;
    } catch {
      // ainda subindo
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Timeout esperando ${url}`);
}

export function startServer(t: Target): ChildProcess[] {
  return (Array.isArray(t.cmd) ? t.cmd : [t.cmd]).map((c) => spawnOne(t, c.replaceAll("{port}", String(t.port))));
}

function spawnOne(t: Target, cmd: string): ChildProcess {
  const child = spawn(cmd, {
    cwd: t.cwd,
    shell: true,
    env: { ...process.env, BROWSER: "none", ...t.env },
    stdio: ["ignore", "pipe", "pipe"],
  });
  const log = (d: Buffer) => process.env.CAPTURE_DEBUG && process.stdout.write(`[${t.id}] ${d}`);
  child.stdout?.on("data", log);
  child.stderr?.on("data", log);
  return child;
}

export function killTree(child: ChildProcess) {
  if (!child.pid) return;
  try {
    if (process.platform === "win32") execSync(`taskkill /pid ${child.pid} /T /F`, { stdio: "ignore" });
    else process.kill(-child.pid);
  } catch {
    // já encerrado
  }
}

function serializeRules(rules: [string | RegExp, string][]) {
  return rules.map(([from, to]) =>
    from instanceof RegExp
      ? { src: from.source, flags: from.flags.includes("g") ? from.flags : from.flags + "g", to }
      : { src: from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags: "g", to },
  );
}

/**
 * Script injetado antes de qualquer código da página: troca textos sensíveis
 * (texto, placeholder, title, alt, aria-label) e continua observando o DOM,
 * para que re-renderizações do React não tragam o nome original de volta.
 */
function anonymizerScript(rules: [string | RegExp, string][]) {
  return `(() => {
    const regs = ${JSON.stringify(serializeRules(rules))}.map((r) => ({ re: new RegExp(r.src, r.flags), to: r.to }));
    const fix = (s) => regs.reduce((acc, r) => acc.replace(r.re, r.to), s);
    const attrs = ["placeholder", "title", "alt", "aria-label"];
    const fixNode = (root) => {
      if (root.nodeType === 3) {
        const v = root.nodeValue || "", f = fix(v);
        if (f !== v) root.nodeValue = f;
        return;
      }
      if (root.nodeType !== 1 && root.nodeType !== 9) return;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = walker.nextNode())) {
        const v = n.nodeValue || "", f = fix(v);
        if (f !== v) n.nodeValue = f;
      }
      const els = root.querySelectorAll ? root.querySelectorAll("*") : [];
      for (const el of [root, ...els]) {
        if (!el.getAttribute) continue;
        for (const a of attrs) {
          const v = el.getAttribute(a);
          if (v) { const f = fix(v); if (f !== v) el.setAttribute(a, f); }
        }
        if ((el.tagName === "INPUT" || el.tagName === "TEXTAREA") && el.value) {
          const f = fix(el.value); if (f !== el.value) el.value = f;
        }
      }
    };
    window.__anonRun = () => { fixNode(document.body); const t = fix(document.title); if (t !== document.title) document.title = t; };
    const start = () => {
      window.__anonRun();
      new MutationObserver((muts) => {
        for (const m of muts) {
          if (m.type === "characterData") fixNode(m.target);
          else if (m.type === "attributes") fixNode(m.target);
          else m.addedNodes.forEach(fixNode);
        }
      }).observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: attrs });
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
  })();`;
}

export async function installTargetRoutes(context: BrowserContext, t: Target, base: string) {
  if (t.runtimeConfig) {
    const body = `window.__MARMITAS_CONFIG__ = ${JSON.stringify(t.runtimeConfig)};`;
    await context.route("**/runtime-config.js*", (route) => route.fulfill({ status: 200, contentType: "application/javascript", body }));
  }
  if (t.files) {
    const { prefix, dir } = t.files;
    await context.route((url) => url.origin === base && url.pathname.startsWith(prefix + "/"), (route) =>
      route.fulfill({ path: path.join(dir, decodeURIComponent(new URL(route.request().url()).pathname.slice(prefix.length + 1))) }),
    );
  }
  if (t.proxy) {
    const { prefix, to, rewrite, actions, transform } = t.proxy;
    await context.route((url) => url.origin === base && url.pathname.startsWith(prefix + "/"), async (route) => {
      const req = route.request();
      let body: any;
      try {
        body = req.postDataJSON();
      } catch {
        body = undefined;
      }
      const fixture = body?.action && actions?.[body.action];
      if (fixture) {
        return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data: fixture(body) }) });
      }
      const u = new URL(req.url());
      const pathname = rewrite ? u.pathname.replace(rewrite[0], rewrite[1]) : u.pathname;
      const response = await route.fetch({ url: to + pathname + u.search });
      if (process.env.CAPTURE_DEBUG && response.status() >= 400) console.log(`  [proxy ${response.status()}] ${req.method()} ${pathname} ${body?.action ?? ""}`);
      if (transform && (response.headers()["content-type"] ?? "").includes("json")) {
        const json = transform(pathname, await response.json());
        return route.fulfill({ response, body: JSON.stringify(json) });
      }
      await route.fulfill({ response });
    });
  }
}

export async function installAnonymizer(context: BrowserContext, rules: [string | RegExp, string][]) {
  await context.addInitScript(anonymizerScript(rules));
}

/** Passada final antes do print: reaplica as trocas e injeta o CSS que esconde logos. */
export async function anonymize(page: Page, css: string, keepLogos = false) {
  await page.evaluate(() => (window as any).__anonRun?.());
  await page.addStyleTag({
    content: `
      ${keepLogos ? "" : 'img[src*="logo" i], img[alt*="logo" i], img[src*="brand/" i] { visibility: hidden !important; }'}
      nextjs-portal, [data-nextjs-toast], [data-lovable-badge], #lovable-badge, .lovable-badge, a[href*="lovable.dev"] { display: none !important; }
      *, *::before, *::after { caret-color: transparent !important; transition: none !important; animation-duration: 0s !important; }
      ${css}
    `,
  });
}

export async function newContext(browser: Browser, device: Device) {
  const vp = VIEWPORTS[device];
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.deviceScaleFactor,
    isMobile: vp.isMobile,
    hasTouch: vp.hasTouch,
    locale: "pt-BR",
    timezoneId: "America/Bahia",
    colorScheme: "light",
    reducedMotion: "reduce",
  });
  // O tsx (esbuild keepNames) injeta __name() nas funções passadas ao page.evaluate.
  await context.addInitScript("globalThis.__name = (f) => f;");
  // Rede de segurança: nenhuma chamada de dados pode chegar a backends de produção.
  await context.route(PROD_DATA_HOSTS, (route) => {
    console.log(`  ! bloqueado (produção): ${route.request().method()} ${route.request().url().slice(0, 90)}`);
    return route.abort();
  });
  return context;
}

const PROD_DATA_HOSTS = (url: URL) =>
  /\.easypanel\.host$|\.neon\.tech$|\.lovable\.app$|\.vercel\.app$/.test(url.hostname) ||
  (/\.supabase\.co$/.test(url.hostname) && !url.pathname.startsWith("/storage/v1/object/public/"));
