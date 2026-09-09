# Quick PDF to PowerPoint

Ubah PDF menjadi presentasi PowerPoint. / Convert a PDF into a PowerPoint presentation — directly in the browser.

Standalone app in the **Quick Tools** suite. All processing happens client-side: no upload, no queue, no server.

## Features

- Each PDF page becomes one full-bleed slide image in the `.pptx`
- **16:9** slide size (1280 × 720)
- Sample PDF generator for quick testing
- 4-step UI: Select → Options → Preview → Download
- Dark/light theme, responsive, Indonesian UI

## Tech

- Vite 6 + React 18 + TypeScript (strict)
- [pdfjs-dist](https://www.npmjs.com/package/pdfjs-dist) — PDF rendering to canvas
- [pptxgenjs](https://www.npmjs.com/package/pptxgenjs) — `.pptx` generation
- [jszip](https://www.npmjs.com/package/jszip) — OOXML container used by pptx
- Hand-written `design.css` (Windows 11-style Fluent design), accent `#f59e0b`
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
- Set **Root Directory** to `tools/quick-pdf-to-powerpoint`
- Build command: `npm run build`, output directory: `dist`
- `vercel.json` rewrites all routes to `/index.html` (SPA fallback)

## Structure

- `src/app/` — page components (Workflow + per-app options/preview)
- `src/engine.ts` — render pages to images and assemble the deck
- `src/config/meta.ts` + `texts.ts` — app identity, strings, default options
- `src/shared/` — copied from `tools/_shared` (Workflow, components, pdfkit, toolkit)
- `tests/engine.test.ts` — aspect-ratio/deck-composition unit tests
- `public/tutorial/*.webp` — tutorial screenshots

## Notes

- **Limitation:** slides are image-based (one screenshot per page), so text is not editable inside PowerPoint. This preserves visual fidelity.
- Large PDFs produce large `.pptx` files; keep pages well under the `maxMb` upload cap.
- UI text is Indonesian by design.