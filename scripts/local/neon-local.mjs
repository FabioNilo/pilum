// Preload (tsx --import) que aponta o driver HTTP do Neon para o proxy local
// (docker: ghcr.io/timowilhelm/local-neon-http-proxy). Só usado nos prints.
import path from "node:path";
import { pathToFileURL } from "node:url";

const entry = path.join(process.cwd(), "node_modules", "@neondatabase", "serverless", "index.mjs");
const { neonConfig } = await import(pathToFileURL(entry).href);
neonConfig.fetchEndpoint = () => process.env.NEON_LOCAL_ENDPOINT ?? "http://127.0.0.1:4444/sql";
