/**
 * Backend falso para os prints: os apps apontam para http://127.0.0.1:4999/<app>/...
 * e recebem somente dados fictícios de scripts/fixtures. Nenhuma chamada chega à produção.
 */
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { FIXTURE_PORT } from "./lib";
import { handlers } from "./fixtures";

export type FxRequest = {
  method: string;
  path: string;
  query: URLSearchParams;
  body: any;
  headers: IncomingMessage["headers"];
};
export type FxResult = { status?: number; json?: unknown; text?: string; headers?: Record<string, string> } | undefined;
export type FxHandler = (req: FxRequest) => FxResult | Promise<FxResult>;

function readBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : undefined);
      } catch {
        resolve(raw);
      }
    });
  });
}

function send(res: ServerResponse, status: number, body: string, headers: Record<string, string> = {}) {
  res.writeHead(status, {
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "*",
    "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "access-control-expose-headers": "content-range",
    ...headers,
  });
  res.end(body);
}

export function startFixtureServer(): Promise<{ close(): void }> {
  const server = createServer(async (req, res) => {
    if (req.method === "OPTIONS") return send(res, 204, "");
    const url = new URL(req.url ?? "/", "http://x");
    const [, app, ...rest] = url.pathname.split("/");
    const handler = handlers[app];
    const fxReq: FxRequest = {
      method: req.method ?? "GET",
      path: "/" + rest.join("/"),
      query: url.searchParams,
      body: await readBody(req),
      headers: req.headers,
    };
    try {
      const out = handler ? await handler(fxReq) : undefined;
      if (!out) {
        if (process.env.CAPTURE_DEBUG) console.log(`  [fixture 404] ${fxReq.method} /${app}${fxReq.path} ${JSON.stringify(fxReq.body ?? "")}`);
        return send(res, 404, JSON.stringify({ error: "fixture não encontrada" }), { "content-type": "application/json" });
      }
      if (out.text !== undefined) return send(res, out.status ?? 200, out.text, { "content-type": "text/plain", ...out.headers });
      return send(res, out.status ?? 200, JSON.stringify(out.json ?? null), { "content-type": "application/json", ...out.headers });
    } catch (e) {
      console.error(`  [fixture erro] /${app}${fxReq.path}: ${(e as Error).message}`);
      return send(res, 500, JSON.stringify({ error: (e as Error).message }), { "content-type": "application/json" });
    }
  });
  return new Promise((resolve) => server.listen(FIXTURE_PORT, "127.0.0.1", () => resolve({ close: () => server.close() })));
}
