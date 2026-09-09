import { extractPagesText } from "./shared/pdfkit";
import type { ExtractedPage } from "./shared/pdfkit";
import { sanitizeFileBase } from "./shared/toolkit";
import type { ConvertError, Engine } from "./Workflow";

export type TableRow = { page: number; cells: string[] };

/**
 * Pure parser: line -> cells.
 * Splits on tabs, then on runs of 2+ spaces (common in exported PDF tables).
 */
export function lineToCells(line: string): string[] {
  if (line.includes("\t")) {
    return line.split("\t").map((c) => c.trim());
  }
  const cells = line.split(/\s{2,}/).map((c) => c.trim()).filter(Boolean);
  return cells.length ? cells : [line.trim()];
}

/** Pure parser: extracted pages -> flattened table rows (unit-testable). */
export function pagesToRows(pages: ExtractedPage[]): TableRow[] {
  const rows: TableRow[] = [];
  for (const page of pages) {
    for (const raw of page.lines) {
      const cells = lineToCells(raw);
      if (cells.length === 1 && cells[0].length === 0) continue;
      rows.push({ page: page.page, cells });
    }
  }
  return rows;
}

export const enrich = undefined;

export const engine: Engine = async (job, onProgress) => {
  const { data, file } = job;
  const sheetMode = String(job.options.sheetMode ?? "one");

  let textPages: ExtractedPage[];
  try {
    onProgress({ current: 0, total: 1, message: "Membaca teks PDF..." });
    textPages = await extractPagesText(data, (p, total) => onProgress({ current: p, total, message: `Membaca halaman ${p} dari ${total}...` }));
  } catch {
    throw { code: "invalid", title: "PDF rusak atau tidak valid.", body: `"${file.name}" tidak dapat dibaca.` } as ConvertError;
  }

  const totalChars = textPages.reduce((a, p) => a + p.charCount, 0);
  if (totalChars < 20) {
    throw {
      code: "scan",
      title: "Dokumen terdeteksi sebagai scan. OCR diperlukan untuk mengambil data tabel.",
      body: "Pengambilan tabel saat ini bekerja pada PDF berbasis teks. Lakukan OCR terlebih dahulu untuk dokumen scan.",
    } as ConvertError;
  }

  onProgress({ current: 1, total: 1, message: "Menyusun spreadsheet..." });

  try {
    const XLSX = await import("xlsx");
    const wb = XLSX.utils.book_new();

    if (sheetMode === "per-page") {
      for (const page of textPages) {
        const rows = pagesToRows([page]).map((r) => r.cells);
        if (!rows.length) continue;
        const ws = XLSX.utils.aoa_to_sheet(rows);
        const sheetName = `Halaman ${page.page}`;
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      }
      if (wb.SheetNames.length === 0) {
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["(tidak ada data)"]]), "Data");
      }
    } else {
      const rows = pagesToRows(textPages).map((r) => r.cells);
      const worksheet = XLSX.utils.aoa_to_sheet(rows.length ? rows : [["(tidak ada data)"]]);
      XLSX.utils.book_append_sheet(wb, worksheet, "Data");
    }

    const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const base = sanitizeFileBase(file.name.replace(/\.pdf$/i, ""));
    const blob = new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    return [{ name: `${base}.xlsx`, blob, kind: "xlsx" }];
  } catch {
    throw { code: "output", title: "Terjadi masalah saat membuat file hasil.", body: "Coba konversi ulang menggunakan file lain." } as ConvertError;
  }
};