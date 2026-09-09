import { AlignmentType, Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import { extractPagesText } from "./shared/pdfkit";
import type { ExtractedPage } from "./shared/pdfkit";
import { sanitizeFileBase } from "./shared/toolkit";
import type { ConvertError, Engine } from "./Workflow";

export type ParsedLine = { kind: "heading" | "para" | "blank" | "page"; text: string; page?: number };

/**
 * Pure parser: extracted page lines -> structured document model.
 * Unit-testable without pdf.js / browser.
 */
export function paragraphize(pages: ExtractedPage[], includePageMarkers: boolean): ParsedLine[] {
  const out: ParsedLine[] = [];
  for (const page of pages) {
    if (includePageMarkers) out.push({ kind: "page", text: `Halaman ${page.page}`, page: page.page });
    const { lines, charCount } = page;
    if (charCount === 0) {
      out.push({ kind: "para", text: "(tidak ada teks terdeteksi di halaman ini)" });
      continue;
    }
    for (const raw of lines) {
      const clean = raw.trim();
      out.push(clean ? { kind: "para", text: clean } : { kind: "blank", text: "" });
    }
    out.push({ kind: "blank", text: "" });
  }
  return out;
}

function toDocxParagraphs(parsed: ParsedLine[]): Paragraph[] {
  const children: Paragraph[] = [];
  for (const item of parsed) {
    if (item.kind === "page") {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
          children: [new TextRun({ text: item.text, color: "3B82F6", size: 22, bold: true })],
        }),
      );
    } else if (item.kind === "blank") {
      children.push(new Paragraph({ children: [], spacing: { after: 60 } }));
    } else {
      children.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { after: 120, line: 276 },
          children: [new TextRun({ text: item.text, size: 22 })],
        }),
      );
    }
  }
  return children;
}

export function buildDocx(parsed: ParsedLine[], title: string): Promise<Blob> {
  const doc = new Document({
    creator: "Quick PDF to Word",
    title,
    sections: [{ properties: {}, children: toDocxParagraphs(parsed) }],
  });
  return Packer.toBlob(doc);
}

export const enrich = undefined;

export const engine: Engine = async (job, onProgress) => {
  const { data, file, options } = job;
  const includePageMarkers = Boolean(options.includePages ?? true);

  let textPages: ExtractedPage[];
  try {
    onProgress({ current: 0, total: 1, message: "Membaca teks PDF..." });
    textPages = await extractPagesText(data, (p, total) => onProgress({ current: p, total, message: `Membaca halaman ${p} dari ${total}...` }));
  } catch {
    throw { code: "invalid", title: "PDF rusak atau tidak valid.", body: `"${file.name}" tidak dapat dibaca.` } as ConvertError;
  }

  const totalText = textPages.reduce((a, p) => a + p.charCount, 0);

  /** Honest scan detection: no embedded text layer means OCR would be required. */
  if (totalText < 20) {
    throw {
      code: "scan",
      title: "Dokumen terdeteksi sebagai scan. OCR diperlukan untuk menghasilkan teks yang dapat diedit.",
      body: "Alat ini belum menyediakan OCR. Gunakan dokumen PDF berbasis teks agar konversi berhasil, atau lakukan OCR terlebih dahulu.",
    } as ConvertError;
  }

  onProgress({ current: 1, total: 1, message: "Merangkai dokumen Word..." });
  const parsed = paragraphize(textPages, includePageMarkers);

  try {
    const blob = await buildDocx(parsed, file.name);
    const base = sanitizeFileBase(file.name.replace(/\.pdf$/i, ""));
    return [{ name: `${base}.docx`, blob, kind: "docx" }];
  } catch {
    throw { code: "output", title: "Terjadi masalah saat membuat file hasil.", body: "Coba konversi ulang menggunakan file lain." } as ConvertError;
  }
};