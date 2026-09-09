# Quick PDF to JPG

Ubah halaman PDF menjadi gambar JPG dengan cepat. / Convert PDF pages to JPG images — directly in the browser.

Standalone app in the **Quick Tools** suite. All processing happens client-side: no upload, no queue, no server.

## Features

- Renders each PDF page to a high-quality JPG
- Options: quality (10–100) and scale (1–4)
- Page selection — convert all pages or a specific list
- ZIP download of all converted images
- 4-step UI: Select → Options → Preview → Download
- Dark/light theme, responsive, Indonesian UI

## Tech

- Vite 6 + React 18 + TypeScript (strict)
- [pdfjs-dist](https://www.npmjs.com/package/pdfjs-dist) — PDF rendering to canvas
- [jszip](https://www.npmjs.com/package/jszip) — ZIP packaging
- Hand-written `design.css` (Windows 11-style Fluent design), accent `#0ea5e9`
- Unit tests via Vitest (Node env, jsdom)

## Getting started

```bash
npm install
npm run dev        # start dev server
npm test           # vitest run
npm run lint       # eslint
npm run build      # tsc --noEmit && vite build
npm run preview    # serve the built app
```

No environment variables are required. A sample `.env.example` is included for convention.

## Deploy to Vercel

- Create a new project pointing at the repo `bankyan80/quick-rename`
- Set **Root Directory** to `tools/quick-pdf-to-jpg`
- Build command: `npm run build`, output directory: `dist`
- `vercel.json` rewrites all routes to `/index.html` (SPA fallback)

## Structure

- `src/app/` — page components (Workflow + per-app options/preview)
- `src/engine.ts` — render + JPEG encode logic (exposes pure helper `resolveSelectedPages`)
- `src/config/meta.ts` + `texts.ts` — app identity, strings, default options
- `src/shared/` — copied from `tools/_shared` (Workflow, components, pdfkit, toolkit)
- `tests/engine.test.ts` — selection + validation unit tests
- `public/tutorial/*.webp` — tutorial screenshots

## Notes

- Scale 1 = 72 DPI, scale 2 = 144 DPI, etc. Higher scale = sharper but larger files.
- Page-level failures are skipped and reported; the rest still convert.
- UI text is Indonesian by design.