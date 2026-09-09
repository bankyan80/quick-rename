# Quick Resize PDF

Sesuaikan ukuran halaman PDF dengan kebutuhan Anda. / Adjust PDF page size — directly in the browser.

Standalone app in the **Quick Tools** suite. All processing happens client-side: no upload, no queue, no server.

## Features

- Resize all pages to a standard preset: A4, A3, or US Letter
- Orientation: portrait or landscape
- Custom size override (width × height in mm)
- 4-step UI: Select → Options → Preview → Download
- Dark/light theme, responsive, Indonesian UI

## Tech

- Vite 6 + React 18 + TypeScript (strict)
- [pdf-lib](https://www.npmjs.com/package/pdf-lib) — page-size engine
- [pdfjs-dist](https://www.npmjs.com/package/pdfjs-dist) — preview rendering
- Hand-written `design.css` (Windows 11-style Fluent design), accent `#10b981`
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
- Set **Root Directory** to `tools/quick-resize-pdf`
- Build command: `npm run build`, output directory: `dist`
- `vercel.json` rewrites all routes to `/index.html` (SPA fallback)

## Structure

- `src/app/` — page components (Workflow + per-app options/preview)
- `src/engine.ts` — resize logic (presets from `texts.ts`/`meta.ts`)
- `src/config/meta.ts` + `texts.ts` — app identity, strings, default options
- `src/shared/` — copied from `tools/_shared` (Workflow, components, pdfkit, toolkit)
- `tests/engine.test.ts` — preset resolution + resize unit tests
- `public/tutorial/*.webp` — tutorial screenshots

## Notes

- Resizing scales page boxes to the target size; content is scaled proportionally to fit.
- Custom size overrides the preset when both are provided.
- UI text is Indonesian by design.