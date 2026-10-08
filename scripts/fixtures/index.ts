import type { FxHandler } from "../fixture-server";
import { condoTables } from "./condo";
import { dentalHandler } from "./dental";
import { fakeSupabase } from "./supabase";

/** Um handler por app, indexado pelo primeiro segmento da URL (/marmitas-sb/..., /condo/...). */
export const handlers: Record<string, FxHandler> = {
  "marmitas-sb": fakeSupabase({
    apiLogin: { url: "http://127.0.0.1:8789/api/massas/auth/login", username: "admin", password: "demo12345" },
    tables: { user_roles: [{ role: "admin" }] },
  }),
  dental: dentalHandler,
  "dental-sb": fakeSupabase({}),
  condo: fakeSupabase({ tables: condoTables, email: "sindico@exemplo.com" }),
};
