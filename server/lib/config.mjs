/* Sender-side configuration. Secrets live here (server env), never in the browser bundle. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, "..", "..");

/** Minimal .env reader: KEY=VALUE lines, '#' comments, quotes stripped. Real env vars win. */
export function loadEnvFile(file) {
  let text;
  try {
    text = fs.readFileSync(file, "utf8");
  } catch {
    return {};
  }
  const out = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    )
      val = val.slice(1, -1);
    out[key] = val;
  }
  return out;
}

/**
 * @param {NodeJS.ProcessEnv} env
 * @param {{skipFile?: boolean}} opts  skipFile for hermetic tests
 */
export function readConfig(env = process.env, opts = {}) {
  const file = opts.skipFile ? {} : loadEnvFile(path.join(ROOT, ".env"));
  const val = (k) => (env[k] && env[k].trim()) || file[k] || "";
  const ingestSecret = val("TABAH_INGEST_SECRET");
  const execUrl = val("TABAH_EXEC_URL");
  const cfg = {
    port: Number(val("PORT")) || 8788,
    execUrl,
    ingestSecret,
    allowedOrigins: val("ALLOWED_ORIGINS")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    isProd: (env.NODE_ENV || "production") === "production",
    distDir: val("TABAHS_DIST_DIR") || val("TABAH_DIST_DIR") || path.join(ROOT, "dist"),
    rateLimitPerMin: Number(val("RATE_LIMIT_PER_MIN")) || 30,
    bodyLimit: 16 * 1024,
    sessionTtlMs: 4 * 60 * 60 * 1000,
  };
  cfg.configured =
    /^https?:\/\/.+\/exec$/.test(execUrl) &&
    /^[A-Za-z0-9_-]{43,128}$/.test(ingestSecret);
  cfg.liveGoogleUrl = /^https:\/\/script\.google\.com\/.+\/exec$/.test(execUrl);
  return cfg;
}
