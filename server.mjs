import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";

const root = new URL(".", import.meta.url).pathname;
const port = Number(process.env.PORT || 4173);
const host = "127.0.0.1";

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jsx": "text/babel; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

createServer((request, response) => {
  const url = new URL(request.url || "/", `http://localhost:${port}`);
  const safePath = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
  let filePath = join(root, safePath === "/" ? "index.html" : safePath);

  if (!filePath.startsWith(root) || !existsSync(filePath)) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  if (statSync(filePath).isDirectory()) filePath = join(filePath, "index.html");

  response.writeHead(200, {
    "Content-Type": types[extname(filePath)] || "application/octet-stream",
    "Cache-Control": "no-store",
  });
  createReadStream(filePath).pipe(response);
}).listen(port, host, () => {
  console.log(`IELTS trainer running at http://${host}:${port}`);
});
