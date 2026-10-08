/**
 * Procura nomes de clientes reais nos arquivos de texto que vão para o site.
 * Os prints (webp) são anonimizados na captura; confira-os visualmente também.
 *   npm run check:anon
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// A cidade do Fabio (rodapé) é legítima; nos prints ela é trocada em scripts/lib.ts.
const FORBIDDEN = [/nosso\s*bistr/i, /neide/i, /pasta\s*brasiliana/i, /florecer/i, /mileide/i, /neidemarmitafit/i, /nossobistro/i, /easypanel/i, /supabase\.co/i];
const DIRS = ["src", "public", "index.html", "dist"];
const TEXT = /\.(tsx?|jsx?|css|html|json|svg|txt|md|xml|webmanifest)$/i;

const hits: string[] = [];
function walk(p: string) {
  let st;
  try {
    st = statSync(p);
  } catch {
    return;
  }
  if (st.isDirectory()) return readdirSync(p).forEach((f) => walk(path.join(p, f)));
  if (!TEXT.test(p)) return;
  readFileSync(p, "utf8")
    .split("\n")
    .forEach((line, i) => {
      for (const re of FORBIDDEN) if (re.test(line)) hits.push(`${path.relative(root, p)}:${i + 1}  ${re}  ${line.trim().slice(0, 100)}`);
    });
}
DIRS.forEach((d) => walk(path.join(root, d)));

if (hits.length) {
  console.error(`✗ ${hits.length} ocorrência(s) de nomes/hosts de clientes:\n${hits.join("\n")}`);
  process.exit(1);
}
console.log("✓ Nenhum nome de cliente encontrado em src/, public/, index.html e dist/.");
