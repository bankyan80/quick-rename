# Quick PDF to Excel

Ambil data tabel dari PDF ke file Excel. / Extract table data from a PDF into an Excel spreadsheet — directly in the browser.

Standalone app in the **Quick Tools** suite. All processing happens client-side: no upload, no queue, no server.

## Features

- Extracts text lines and cells from each PDF page into rows
- Sheet mode: one sheet with all pages, or one sheet per page (`sheetMode`)
- Writes a real `.xlsx` via the SheetJS build
- Sample PDF generator for quick testing
- 4-step UI: Select → Options → Preview → Download
- Dark/light theme, responsive, Indonesian UI

## Tech

- Vite 6 + React 18 + TypeScript (strict)
- [pdfjs-dist](https://www.npmjs.com/package/pdfjs-dist) — text extraction
- [xlsx](https://www.npmjs.com/package/xlsx) (SheetJS) — `.xlsx` generation
- [jszip](https://www.npmjs.com/package/jszip) — ZipX container used by xlsx
- Hand-written `design.css` (Windows 11-style Fluent design), accent `#22c55e`
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
- Set **Root Directory** to `tools/quick-pdf-to-excel`
- Build command: `npm run build`, output directory: `dist`
- `vercel.json` rewrites all routes to `/index.html` (SPA fallback)

## Structure

- `src/app/` — page components (Workflow + per-app options/preview)
- `src/engine.ts` — cell/row extraction + workbook building (`pagesToRows`, `lineToCells`)
- `src/config/meta.ts` + `texts.ts` — app identity, strings, default options
- `src/shared/` — copied from `tools/_shared` (Workflow, components, pdfkit, toolkit)
- `tests/engine.test.ts` — extraction + xlsx read-back tests
- `public/tutorial/*.webp` — tutorial screenshots

## Notes

- **Limitation:** extraction is heuristic text-based (columns are approximated from x-coordinate spacing), not true table/OCR parsing. Layouts with merged cells or complex spanning may lose structure. Scanned pages are rejected with a `scan` error.
- One sheet per page is the most faithful mode for multi-column documents.
- UI text is Indonesian by design.