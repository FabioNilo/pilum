import type { FxHandler } from "../fixture-server";

/**
 * Supabase falso (Auth + PostgREST) para apps que fazem login pelo supabase-js.
 * O access_token emitido é um JWT válido da API local (obtido em `apiLogin`),
 * para que as chamadas autenticadas ao backend local também funcionem.
 */
export function fakeSupabase(opts: {
  apiLogin?: { url: string; username: string; password: string };
  tables?: Record<string, unknown[] | ((query: URLSearchParams) => unknown[])>;
  email?: string;
}): FxHandler {
  const user = {
    id: "00000000-0000-4000-8000-000000000001",
    aud: "authenticated",
    role: "authenticated",
    email: opts.email ?? "admin@exemplo.com",
    app_metadata: { provider: "email" },
    user_metadata: { full_name: "Admin Demo" },
    created_at: new Date(Date.now() - 90 * 86_400_000).toISOString(),
  };

  async function token() {
    if (!opts.apiLogin) return "fx-access-token";
    const res = await fetch(opts.apiLogin.url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: opts.apiLogin.username, password: opts.apiLogin.password }),
    });
    const json = (await res.json()) as { data?: { access_token?: string } };
    return json.data?.access_token ?? "fx-access-token";
  }

  return async (req) => {
    if (req.path.startsWith("/auth/v1/token")) {
      return {
        json: {
          access_token: await token(),
          token_type: "bearer",
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          refresh_token: "fx-refresh-token",
          user,
        },
      };
    }
    if (req.path === "/auth/v1/user") return { json: user };
    if (req.path === "/auth/v1/logout") return { status: 204, text: "" };
    if (req.path.startsWith("/rest/v1/")) {
      const table = req.path.slice("/rest/v1/".length).split("?")[0];
      const rows = opts.tables?.[table];
      const data = applyFilters(typeof rows === "function" ? rows(req.query) : rows ?? [], req.query);
      const single = (req.headers.accept ?? "").includes("vnd.pgrst.object");
      return { json: single ? data[0] ?? null : data, headers: { "content-range": `0-${Math.max(data.length - 1, 0)}/${data.length}` } };
    }
    return undefined;
  };
}

const RESERVED = new Set(["select", "order", "limit", "offset", "on_conflict", "columns"]);

/** Subconjunto dos filtros do PostgREST (eq, neq, gt, gte, lt, lte, in, is) e do order. */
function applyFilters(rows: unknown[], query: URLSearchParams) {
  let out = rows as Record<string, any>[];
  for (const [key, raw] of query) {
    if (RESERVED.has(key)) continue;
    const dot = raw.indexOf(".");
    const op = raw.slice(0, dot);
    const val = raw.slice(dot + 1);
    out = out.filter((r) => {
      const v = r[key];
      switch (op) {
        case "eq": return String(v) === val;
        case "neq": return String(v) !== val;
        case "gt": return v > val;
        case "gte": return v >= val;
        case "lt": return v < val;
        case "lte": return v <= val;
        case "in": return val.replace(/^\(|\)$/g, "").split(",").map((s) => s.replace(/"/g, "")).includes(String(v));
        case "is": return val === "null" ? v === null || v === undefined : String(v) === val;
        default: return true;
      }
    });
  }
  const order = query.get("order");
  if (order) {
    const keys = order.split(",").map((o) => {
      const [col, dir] = o.split(".");
      return { col, desc: dir === "desc" };
    });
    out = [...out].sort((a, b) => {
      for (const { col, desc } of keys) {
        if (a[col] === b[col]) continue;
        const cmp = (a[col] ?? "") > (b[col] ?? "") ? 1 : -1;
        return desc ? -cmp : cmp;
      }
      return 0;
    });
  }
  const limit = Number(query.get("limit") ?? 0);
  return limit ? out.slice(0, limit) : out;
}
