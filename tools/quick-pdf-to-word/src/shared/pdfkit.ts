import type { PDFDocumentProxy } from "pdfjs-dist";

/* Lazy-loading pdf.js wrapper shared by all Quick Tools apps.
   Rendering functions are browser-only; text extraction runs headless too. */

type PdfjsModule = typeof import("pdfjs-dist");

let pdfjsPromise: Promise<PdfjsModule> | null = null;
let configured = false;

export function loadPdfjs(): Promise<PdfjsModule> {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((mod) => {
      if (typeof window !== "undefined" && !configured) {
        configured = true;
        const workerCandidates = [
          new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString(),
          new URL("pdfjs-dist/build/pdf.worker.mjs", import.meta.url).toString(),
        ];
        mod.GlobalWorkerOptions.workerSrc = workerCandidates[0];
      }
      return mod;
    });
  }
  return pdfjsPromise;
}

export async function openPdf(data: Uint8Array): Promise<PDFDocumentProxy> {
  const pdfjs = await loadPdfjs();
  return pdfjs.getDocument({ data }).promise;
}

export async function pdfInfo(data: Uint8Array): Promise<{ pageCount: number }> {
  const doc = await openPdf(data);
  const pageCount = doc.numPages;
  await doc.destroy();
  return { pageCount };
}

export type ExtractedPage = { page: number; lines: string[]; hasText: boolean; charCount: number };

export async function extractPagesText(data: Uint8Array, onPage?: (page: number, total: number) => void): Promise<ExtractedPage[]> {
  const doc = await openPdf(data);
  const total = doc.numPages;
  const out: ExtractedPage[] = [];
  for (let p = 1; p <= total; p++) {
    onPage?.(p, total);
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    // Group text items into lines by y-position.
    type Line = { y: number; text: string };
    const lines: Line[] = [];
    for (const item of content.items as Array<{ str?: string; transform?: number[] }>) {
      if (!item.str) continue;
      const y = item.transform?.[5] ?? 0;
      const last = lines[lines.length - 1];
      if (last && Math.abs(last.y - y) < 2.5) {
        last.text += (last.text && item.str && !item.str.startsWith(" ") ? " " : "") + item.str;
      } else {
        lines.push({ y, text: item.str });
      }
    }
    const pageLines = lines.map((l) => l.text.trim()).filter(Boolean);
    const charCount = pageLines.join("").length;
    out.push({ page: p, lines: pageLines, hasText: charCount > 5, charCount });
  }
  await doc.destroy();
  return out;
}

/* ---------- rendering (browser only) ---------- */

export async function renderPageToCanvas(data: Uint8Array, pageNo: number, scale: number, onRender?: (canvas: HTMLCanvasElement) => void): Promise<HTMLCanvasElement> {
  const doc = await openPdf(data);
  try {
    const page = await doc.getPage(pageNo);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Canvas 2D unavailable");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;
    onRender?.(canvas);
    return canvas;
  } finally {
    await doc.destroy();
  }
}

export async function renderPageToDataUrl(data: Uint8Array, pageNo: number, scale: number): Promise<string> {
  const canvas = await renderPageToCanvas(data, pageNo, scale);
  return canvas.toDataURL("image/jpeg", 0.82);
}

export function defaultPdfScale(pageWidthPt: number, targetPx: number): number {
  return targetPx / Math.max(1, pageWidthPt);
}

/* ---------- demo / test: generate a real 3-page sample PDF (pdf-lib) ---------- */

export async function generateSamplePdf(): Promise<Blob> {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const sampleLines = [
    "LKPD Penilaian Semester II",
    "Nama Kelas Nilai",
    "Andi VI-A 90",
    "Budi VI-A 85",
    "Citra VI-B 88",
    "Dewi VI-B 92",
    "Eko VI-A 78",
    "",
    "Diagram menunjukkan penjualan kuartal III:",
    "Juli 12",
    "Agustus 15",
    "September 18",
  ];

  for (let p = 1; p <= 3; p++) {
    const page = doc.addPage([595.28, 841.89]); // A4 portrait
    page.drawRectangle({ x: 40, y: 770, width: 515, height: 14, color: rgb(0.39, 0.40, 0.95) });
    page.drawText(sampleLines[0], { x: 48, y: 748, size: 20, font: bold, color: rgb(0.13, 0.16, 0.28) });

    if (p === 1) {
      let y = 690;
      page.drawText("No  Nama  Kelas  Nilai", { x: 48, y, size: 12, font: bold });
      y -= 24;
      for (let r = 1; r <= 5; r++) {
        page.drawText(`${r}   ${["Andi", "Budi", "Citra", "Dewi", "Eko"][r - 1]}  VI-A  ${[90, 85, 88, 92, 78][r - 1]}`, { x: 48, y, size: 12, font });
        y -= 24;
      }
      page.drawText("Keterangan: nilai tertinggi diperoleh Dewi.", { x: 48, y: y - 26, size: 11, font });
    } else if (p === 2) {
      let y = 680;
      page.drawText("Paragraf pembuka dokumen laporan singkat. Teks ini", { x: 48, y, size: 13, font });
      y -= 22;
      page.drawText("diambil dari berkas PDF contoh untuk keperluan demo.", { x: 48, y, size: 13, font });
      y -= 40;
      page.drawText("1. Pendahuluan", { x: 48, y, size: 14, font: bold });
      y -= 24;
      page.drawText("2. Metode", { x: 48, y, size: 14, font: bold });
      y -= 24;
      page.drawText("3. Hasil dan Pembahasan", { x: 48, y, size: 14, font: bold });
    } else {
      let y = 680;
      for (const line of sampleLines.slice(5, 11)) {
        page.drawText(line, { x: 48, y, size: 12.5, font });
        y -= 24;
      }
    }
    page.drawText(`Halaman ${p} dari 3`, { x: 48, y: 40, size: 10, color: rgb(0.55, 0.58, 0.68) });
  }

  const bytes = await doc.save();
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return new Blob([copy.buffer], { type: "application/pdf" });
}