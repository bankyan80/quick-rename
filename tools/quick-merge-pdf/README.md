# Quick Merge PDF

Gabungkan beberapa file PDF menjadi satu dokumen. / Combine multiple PDF files into one document — directly in the browser.

Standalone app in the **Quick Tools** suite. All processing happens client-side: no upload, no queue, no server.

## Features

- Multi-file PDF merge (drag & drop, or picker)
- Custom output filename
- Per-file error handling (corrupt / non-PDF files are rejected)
- 4-step UI: Select → Options → Preview → Download
- Dark/light theme, responsive, Indonesian UI

## Tech

- Vite 6 + React 18 + TypeScript (strict)
- [pdf-lib](https://www.npmjs.com/package/pdf-lib) — merge engine
- [pdfjs-dist](https://www.npmjs.com/package/pdfjs-dist) — preview rendering
- Hand-written `design.css` (Windows 11-style Fluent design), accent `#6366f1`
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
- Set **Root Directory** to `tools/quick-merge-pdf`
- Build command: `npm run build`, output directory: `dist`
- `vercel.json` rewrites all routes to `/index.html` (SPA fallback)

## Structure

- `src/app/` — page components (Workflow + per-app options/preview)
- `src/engine.ts` — merge logic
- `src/config/meta.ts` + `texts.ts` — app identity, strings, default options
- `src/shared/` — copied from `tools/_shared` (Workflow, components, pdfkit, toolkit)
- `tests/engine.test.ts` — merge unit tests
- `public/tutorial/*.webp` — tutorial screenshots

## Notes

- Merge uses `pdf-lib` and preserves the text content of embedded pages.
- Files are merged in the order shown in the list; drag to reorder.
- UI text is Indonesian by design.