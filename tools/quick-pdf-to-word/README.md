# Quick PDF to Word

Ubah PDF menjadi dokumen Word yang dapat diedit. / Convert PDF to an editable Word document — directly in the browser.

Standalone app in the **Quick Tools** suite. All processing happens client-side: no upload, no queue, no server.

## Features

- Extracts text from each PDF page and builds a `.docx`
- Option to include page break after each page (`includePages`)
- Sample PDF generator for quick testing
- 4-step UI: Select → Options → Preview → Download
- Dark/light theme, responsive, Indonesian UI

## Tech

- Vite 6 + React 18 + TypeScript (strict)
- [pdfjs-dist](https://www.npmjs.com/package/pdfjs-dist) — text extraction
- [docx](https://www.npmjs.com/package/docx) — `.docx` generation
- Hand-written `design.css` (Windows 11-style Fluent design), accent `#3b82f6`
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
- Set **Root Directory** to `tools/quick-pdf-to-word`
- Build command: `npm run build`, output directory: `dist`
- `vercel.json` rewrites all routes to `/index.html` (SPA fallback)

## Structure

- `src/app/` — page components (Workflow + per-app options/preview)
- `src/engine.ts` — text extraction + `.docx` building
- `src/config/meta.ts` + `texts.ts` — app identity, strings, default options
- `src/shared/` — copied from `tools/_shared` (Workflow, components, pdfkit, toolkit)
- `tests/engine.test.ts` — paragraphize + docx build/blank-detection tests
- `public/tutorial/*.webp` — tutorial screenshots

## Notes

- **Limitation:** this is a text-extraction converter, not OCR. Scanned/image-only PDFs yield little text and are rejected with a `scan` error (`ConvertError { code: "scan" }`). Embedded fonts/decorative boxes are not preserved.
- Layout is linearized text (paragraphs), not a pixel-perfect replica of the PDF.
- UI text is Indonesian by design.