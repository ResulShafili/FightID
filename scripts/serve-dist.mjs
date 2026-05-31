import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const root = join(process.cwd(), "dist");
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "127.0.0.1";

const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${host}:${port}`);
  const rawPath = decodeURIComponent(url.pathname);
  const resolved = normalize(join(root, rawPath));
  const file = resolved.startsWith(root) && existsSync(resolved) && statSync(resolved).isFile()
    ? resolved
    : join(root, "index.html");

  res.setHeader("Content-Type", types[extname(file)] || "application/octet-stream");
  createReadStream(file).pipe(res);
}).listen(port, host, () => {
  console.log(`FightBase preview running at http://${host}:${port}`);
});
