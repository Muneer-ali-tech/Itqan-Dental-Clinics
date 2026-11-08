/* Runs the Vite dev server and the sender API server together for local work.
 *   npm run dev:all   →  Vite on :5173 (proxies /api) + sender on :8788
 * No external dependencies. */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const { startServer } = await import(pathToFileURL(path.join(root, "server", "index.mjs")).href);
const { server, cfg, port } = await startServer();
console.log(`[sender] API on http://127.0.0.1:${port} (configured=${cfg.configured})`);

// Spawn Vite's JS entry directly — spawning npm.cmd on modern Node/Windows throws EINVAL.
const viteBin = path.join(root, "node_modules", "vite", "bin", "vite.js");
const vite = spawn(process.execPath, [viteBin], { cwd: root, stdio: ["ignore", "pipe", "pipe"] });
const pipe = (stream, tag) =>
  stream.on("data", (d) => d.toString().split(/\r?\n/).filter(Boolean).forEach((l) => console.log(`[vite] ${l}`)));
pipe(vite.stdout);
pipe(vite.stderr);
vite.on("exit", (code) => {
  console.log(`[vite] exited with ${code}`);
  server.close(() => process.exit(code ?? 0));
});
const stop = () => {
  vite.kill();
  server.close(() => process.exit(0));
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
