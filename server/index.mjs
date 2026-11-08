/* Tabah sender demo server — zero dependencies.
 * Serves the built SPA from dist/ and a session-bound, rate-limited /api that
 * signs and forwards booking events to the Apps Script /exec endpoint.
 * Secrets (TABAH_EXEC_URL, TABAH_INGEST_SECRET) never reach the browser. */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";
import { readConfig, ROOT } from "./lib/config.mjs";
import { createBookingApi } from "./lib/booking.mjs";

const SESSION_COOKIE = "tabah_sid";
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq < 1) continue;
    out[part.slice(0, eq).trim()] = part.slice(eq + 1).trim();
  }
  return out;
}

function createRateLimiter(perMinute) {
  const hits = new Map(); // ip -> {count, windowStart}
  return (ip, now) => {
    const rec = hits.get(ip);
    if (!rec || now - rec.windowStart >= 60000) {
      hits.set(ip, { count: 1, windowStart: now });
      return true;
    }
    rec.count += 1;
    return rec.count <= perMinute;
  };
}

function isSecure(req) {
  return (
    req.socket.encrypted === true ||
    String(req.headers["x-forwarded-proto"] || "").split(",")[0].trim() === "https"
  );
}

function sendJson(res, status, body, extraHeaders) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...extraHeaders,
  });
  res.end(payload);
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > limit) {
        reject(Object.assign(new Error("BODY_TOO_LARGE"), { code: "BODY_TOO_LARGE" }));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

export function createApp(deps = {}) {
  const cfg = deps.cfg || readConfig();
  const now = deps.now || (() => Date.now());
  const delaysMs = deps.delaysMs; // test injection for the retry schedule
  const timeoutMs = deps.timeoutMs;
  const api = createBookingApi({
    cfg,
    now,
    delaysMs,
    timeoutMs,
    deps: deps.clientDeps,
  });
  const limiter = createRateLimiter(cfg.rateLimitPerMin);
  const sessions = new Map(); // sid -> {sid, booking, lastSeen}

  const getSession = (sid) => {
    const t = now();
    for (const [k, s] of sessions) if (t - s.lastSeen > cfg.sessionTtlMs) sessions.delete(k);
    let s = sid && sessions.get(sid);
    if (!s) {
      s = { sid: crypto.randomUUID(), booking: null, lastSeen: t };
      sessions.set(s.sid, s);
    }
    s.lastSeen = t;
    return s;
  };

  const sessionCookie = (sid, req) => {
    const attrs = [`${SESSION_COOKIE}=${sid}`, "Path=/", "HttpOnly", "SameSite=Lax", `Max-Age=${cfg.sessionTtlMs / 1000}`];
    if (isSecure(req)) attrs.push("Secure");
    return attrs.join("; ");
  };

  function originAllowed(req) {
    const origin = req.headers.origin;
    if (!origin) return true; // non-browser client (curl/tests); rate limit still applies
    if (cfg.allowedOrigins.length) return cfg.allowedOrigins.includes(origin);
    const host = req.headers.host;
    return !!host && (origin === `https://${host}` || origin === `http://${host}`);
  }

  function serveStatic(req, res, urlPath) {
    const rel = urlPath === "/" ? "/index.html" : decodeURIComponent(urlPath);
    const target = path.normalize(path.join(cfg.distDir, rel));
    if (!target.startsWith(path.normalize(cfg.distDir + path.sep)) && target !== path.normalize(cfg.distDir)) {
      return sendJson(res, 404, { error: { code: "NOT_FOUND" } });
    }
    fs.stat(target, (err, st) => {
      const file = !err && st.isFile() ? target : path.join(cfg.distDir, "index.html");
      fs.readFile(file, (err2, data) => {
        if (err2)
          return sendJson(res, 503, {
            error: { code: "DIST_MISSING", hint: "Run: npm run build, or use the Vite dev server." },
          });
        const ext = path.extname(file).toLowerCase();
        res.writeHead(200, {
          "Content-Type": MIME[ext] || "application/octet-stream",
          "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=3600",
        });
        res.end(data);
      });
    });
  }

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, "http://internal");
    const ip =
      (String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
        req.socket.remoteAddress ||
        "unknown");
    try {
      if (req.method === "OPTIONS" && url.pathname.startsWith("/api/")) {
        if (!originAllowed(req)) return sendJson(res, 403, { error: { code: "ORIGIN_FORBIDDEN" } });
        const origin = req.headers.origin;
        return sendJson(res, 204, {}, {
          ...(origin ? { "Access-Control-Allow-Origin": origin, Vary: "Origin" } : {}),
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Credentials": "true",
        });
      }

      if (!url.pathname.startsWith("/api/")) {
        if (req.method !== "GET" && req.method !== "HEAD")
          return sendJson(res, 405, { error: { code: "METHOD_NOT_ALLOWED" } });
        return serveStatic(req, res, url.pathname);
      }

      if (!limiter(ip, now()))
        return sendJson(res, 429, { error: { code: "RATE_LIMITED" } });
      if (!originAllowed(req)) return sendJson(res, 403, { error: { code: "ORIGIN_FORBIDDEN" } });

      if (req.method === "GET" && url.pathname === "/api/health") {
        return sendJson(res, 200, {
          ok: true,
          service: "tabah-sender-demo",
          version: "1.0.0",
          configured: cfg.configured,
          liveGoogleUrl: cfg.liveGoogleUrl,
          // Intentionally no secret or URL material here.
        });
      }

      const route = `${req.method} ${url.pathname}`;
      const handler = {
        "POST /api/booking/start": api.start,
        "POST /api/booking/complete": api.complete,
        "POST /api/booking/retry": api.retry,
        "POST /api/booking/reset": api.reset,
        "GET /api/booking/status": api.status,
      }[route];
      if (!handler) return sendJson(res, 404, { error: { code: "NOT_FOUND" } });

      let input = {};
      if (req.method === "POST") {
        const ct = String(req.headers["content-type"] || "");
        if (!ct.includes("application/json"))
          return sendJson(res, 415, { error: { code: "UNSUPPORTED_MEDIA_TYPE" } });
        const raw = await readBody(req, cfg.bodyLimit);
        try {
          input = raw ? JSON.parse(raw) : {};
        } catch {
          return sendJson(res, 400, { error: { code: "INVALID_JSON" } });
        }
        if (!input || typeof input !== "object" || Array.isArray(input))
          return sendJson(res, 400, { error: { code: "INVALID_JSON" } });
      }

      const cookies = parseCookies(req.headers.cookie);
      const session = getSession(cookies[SESSION_COOKIE]);
      const out = await handler(input, session);
      const headers = { "Set-Cookie": sessionCookie(session.sid, req) };
      const origin = req.headers.origin;
      if (origin) {
        headers["Access-Control-Allow-Origin"] = origin;
        headers["Access-Control-Allow-Credentials"] = "true";
        headers.Vary = "Origin";
      }
      return sendJson(res, out.http, out.body, headers);
    } catch (err) {
      const code = err && err.code ? err.code : "INTERNAL_ERROR";
      console.error("sender-api:" + code);
      return sendJson(res, err && err.code === "BODY_TOO_LARGE" ? 413 : 500, {
        error: { code },
      });
    }
  });
  return { server, cfg };
}

export function startServer(deps = {}) {
  const { server, cfg } = createApp(deps);
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(cfg.port, () => resolve({ server, cfg, port: server.address().port }));
  });
}

async function main() {
  const { server, cfg, port } = await startServer();
  console.log(`[sender] listening on http://127.0.0.1:${port}`);
  console.log(`[sender] configured=${cfg.configured} liveGoogleUrl=${cfg.liveGoogleUrl} dist=${fs.existsSync(cfg.distDir)}`);
  if (cfg.configured && !cfg.liveGoogleUrl)
    console.log("[sender] WARNING: TABAH_EXEC_URL is not a script.google.com /exec URL (ok for local mock rehearsal only)");
  const stop = () => server.close(() => process.exit(0));
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main();
}
