/**
 * Captura prints anonimizados de cada projeto e atualiza src/data/shots.json.
 *
 *   npm run capture                 -> todos os alvos
 *   npm run capture -- consultorio-psi condominio
 *   CAPTURE_DEBUG=1 npm run capture -> mostra o log dos dev servers
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, type BrowserContext, type Page } from "playwright";
import sharp from "sharp";
import { startFixtureServer } from "./fixture-server";
import { anonymize, GLOBAL_REPLACE, installAnonymizer, installTargetRoutes, killTree, newContext, startServer, waitForUrl, type Ctx, type Device, type Shot } from "./lib";
import { targets } from "./targets";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const shotsDir = path.join(root, "public", "shots");
const manifestPath = path.join(root, "src", "data", "shots.json");

const only = process.argv.slice(2);
const selected = only.length ? targets.filter((t) => only.includes(t.id)) : targets;
if (!selected.length) {
  console.error(`Nenhum alvo encontrado. Disponíveis: ${targets.map((t) => t.id).join(", ")}`);
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as Record<string, (Shot & { src: string })[]>;
const fixtures = await startFixtureServer();
const browser = await chromium.launch();
let failures = 0;

for (const t of selected) {
  console.log(`\n▶ ${t.id}`);
  const base = `http://127.0.0.1:${t.port}`;
  const servers = startServer(t);
  const contexts: Partial<Record<Device, BrowserContext>> = {};
  const pages: Partial<Record<Device, Page>> = {};
  const shots: (Shot & { src: string })[] = [];
  const outDir = path.join(shotsDir, t.id);

  try {
    await waitForUrl(base);
    rmSync(outDir, { recursive: true, force: true });
    mkdirSync(outDir, { recursive: true });

    const ctx: Ctx = {
      base,
      async page(device) {
        if (pages[device]) return pages[device]!;
        const c = await newContext(browser, device);
        await installAnonymizer(c, [...(t.replace ?? []), ...GLOBAL_REPLACE]);
        await installTargetRoutes(c, t, base);
        await t.init?.(c, base);
        const p = await c.newPage();
        p.on("pageerror", (e) => process.env.CAPTURE_DEBUG && console.log(`  [pageerror] ${e.message}`));
        contexts[device] = c;
        pages[device] = p;
        return p;
      },
      async goto(page, route, waitFor) {
        await page.goto(base + route, { waitUntil: "load", timeout: 60_000 });
        // Telas com polling nunca ficam "networkidle": espera curta e segue.
        await page.waitForLoadState("networkidle", { timeout: 8_000 }).catch(() => undefined);
        if (waitFor) await page.waitForSelector(waitFor, { timeout: 20_000 });
        await page
          .waitForFunction(() => ![...document.querySelectorAll(".animate-spin")].some((el) => (el as HTMLElement).offsetParent), null, { timeout: 15_000 })
          .catch(() => console.log(`  ! ainda carregando em ${route}`));
        await page.waitForTimeout(800);
      },
      async shot(page, name, caption, opts) {
        const device: Device = (page.viewportSize()?.width ?? 1440) < 800 ? "mobile" : "desktop";
        await anonymize(page, t.css ?? "", t.keepLogos);
        await page.evaluate(() => document.fonts?.ready);
        await page.waitForTimeout(300);
        const png = await page.screenshot({ fullPage: opts?.fullPage ?? false, animations: "disabled" });
        const idx = String(shots.length + 1).padStart(2, "0");
        const file = `${idx}-${name}.webp`;
        const width = device === "mobile" ? 600 : 1440;
        await sharp(png).resize({ width, withoutEnlargement: true }).webp({ quality: 78 }).toFile(path.join(outDir, file));
        shots.push({ name, caption, device, src: `/shots/${t.id}/${file}` });
        console.log(`  ✓ ${file}`);
      },
    };

    await t.run(ctx);
    manifest[t.id] = shots.map(({ src, caption, device }) => ({ src, caption, device }) as Shot & { src: string });
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  } catch (err) {
    failures++;
    console.error(`  ✗ ${t.id}: ${(err as Error).message}`);
    if (shots.length) {
      manifest[t.id] = shots;
      writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
      console.error(`    (${shots.length} prints salvos antes do erro)`);
    }
  } finally {
    await Promise.all(Object.values(contexts).map((c) => c?.close()));
    servers.forEach(killTree);
  }
}

await browser.close();
fixtures.close();
console.log(failures ? `\nConcluído com ${failures} falha(s).` : "\nConcluído.");
process.exit(failures ? 1 : 0);
