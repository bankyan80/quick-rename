import { chromium } from "playwright-core";
import { createReadStream, existsSync } from "node:fs";
import { createServer as httpServer } from "node:http";
import { fileURLToPath } from "node:url";
import { mkdir } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const toolsDir = resolve(here, "..");
const slugs = [
  "quick-merge-pdf",
  "quick-pdf-to-jpg",
  "quick-resize-pdf",
  "quick-pdf-to-word",
  "quick-pdf-to-excel",
  "quick-pdf-to-powerpoint",
];
const VIEWPORT = { width: 1600, height: 900 };

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".webp": "image/webp",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
  ".json": "application/json",
};

function serveStatic(appDir) {
  const distDir = join(appDir, "dist");
  return new Promise((resolveReady) => {
    const server = httpServer((req, res) => {
      let urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
      if (urlPath.endsWith("/")) urlPath += "index.html";
      const filePath = join(distDir, urlPath);
      if (existsSync(filePath)) {
        res.writeHead(200, { "Content-Type": MIME[extname(filePath)] ?? "application/octet-stream" });
        createReadStream(filePath).pipe(res);
      } else {
        const fallback = join(distDir, "index.html");
        if (existsSync(fallback)) {
          res.writeHead(200, { "Content-Type": MIME[".html"] });
          createReadStream(fallback).pipe(res);
        } else {
          res.writeHead(404);
          res.end("not found");
        }
      }
    });
    server.listen(0, () => resolveReady(server));
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitPhase(page, target, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const p = await page.evaluate(() => window.__qt?.phase?.() ?? null);
    if (p === target) return true;
    await sleep(250);
  }
  return false;
}

const shots = [
  { file: "01-overview.webp", url: () => "", kind: "static", waitMs: 1600 },
  { file: "02-upload.webp", url: () => "?demo=1", kind: "static", waitMs: 2600 },
  { file: "03-preview.webp", url: (slug) => `?demo=1&focus=preview`, kind: "static", waitMs: 1800 },
  { file: "04-options.webp", url: (slug) => `?demo=1&focus=options`, kind: "static", waitMs: 1500 },
  {
    file: "05-processing.webp",
    url: (slug) => "?demo=1",
    kind: "processing",
    waitMs: 900,
  },
  { file: "06-download.webp", url: (slug) => `?demo=1&phase=done`, kind: "done" },
];

let browser;
const edgeExecutable = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const chromeExecutable = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
try {
  browser = await chromium.launch({
    headless: true,
    executablePath: edgeExecutable,
    args: ["--hide-scrollbars"],
  });
} catch {
  browser = await chromium.launch({
    headless: true,
    executablePath: chromeExecutable,
    args: ["--hide-scrollbars"],
  });
}

const width = VIEWPORT.width;
const height = VIEWPORT.height;

for (const slug of slugs) {
  const appDir = join(toolsDir, slug);
  const outDir = join(appDir, "public", "tutorial");
  await mkdir(outDir, { recursive: true });

  const server = await serveStatic(appDir);
  const base = `http://localhost:${server.address().port}`;
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    colorScheme: "light",
  });
  const page = await context.newPage();

  for (const shot of shots) {
    const url = base + (shot.url(slug) ? `/${shot.url(slug)}` : "/");
    const handled = (await page.goto(url, { waitUntil: "networkidle" })).status();
    if (handled > 400) {
      throw new Error(`${slug}: got HTTP ${handled} for ${url}`);
    }
    if (shot.kind === "static") {
      await page.waitForLoadState("networkidle");
      await sleep(shot.waitMs ?? 1200);
    } else if (shot.kind === "processing") {
      await page.evaluate(() => window.__qt?.set?.("processing"));
      await sleep(shot.waitMs);
    } else if (shot.kind === "done") {
      await waitPhase(page, "done", 45000);
      await sleep(700);
    }
    await page.screenshot({ path: join(outDir, shot.file) });
    console.log(`  ${slug} -> ${shot.file}`);
  }

  await context.close();
  await server.close();
}

await browser.close();
console.log("done");