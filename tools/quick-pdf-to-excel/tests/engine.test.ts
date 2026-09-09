import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { engine, lineToCells, pagesToRows } from "../src/engine";
import type { ExtractedPage } from "../src/shared/pdfkit";

describe("lineToCells", () => {
  it("splits on tabs", () => {
    expect(lineToCells("Nama\tKelas\tNilai")).toEqual(["Nama", "Kelas", "Nilai"]);
  });

  it("splits on double spaces", () => {
    expect(lineToCells("Andi  VI-A  90")).toEqual(["Andi", "VI-A", "90"]);
  });

  it("keeps a single token as one cell", () => {
    expect(lineToCells("laporan singkat")).toEqual(["laporan singkat"]);
  });
});

describe("pagesToRows", () => {
  it("flattens lines into row cells with page numbers", () => {
    const p: ExtractedPage = { page: 2, lines: ["Judul  Halaman", "Andi  90  Lulus"], hasText: true, charCount: 40 };
    const rows = pagesToRows([p]);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({ page: 2, cells: ["Judul", "Halaman"] });
    expect(rows[1].cells).toEqual(["Andi", "90", "Lulus"]);
  });

  it("skips empty lines", () => {
    const p: ExtractedPage = { page: 1, lines: ["", "x  y"], hasText: true, charCount: 8 };
    expect(pagesToRows([p])).toHaveLength(1);
  });
});

describe("excel engine integration", () => {
  it("builds an xlsx and reads the cells back", async () => {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const pg = doc.addPage([400, 500]);
    pg.drawText("No  Nama  Kelas  Nilai", { x: 50, y: 420, size: 13, font });
    pg.drawText("1  Andi  VI-A  90", { x: 50, y: 396, size: 13, font });
    pg.drawText("2  Budi  VI-B  85", { x: 50, y: 372, size: 13, font });
    const bytes = await doc.save();
    const copy = new Uint8Array(bytes.byteLength);
    copy.set(bytes);
    const blob = new Blob([copy.buffer], { type: "application/pdf" });
    const file = new File([blob], "rapor.pdf", { type: "application/pdf" });

    const outs = await engine(
      {
        file,
        files: [file],
        entries: [{ id: "1", file, name: "rapor.pdf", size: blob.size, status: "ok" as const, pages: 1 }],
        options: { sheetMode: "one" },
        data: new Uint8Array(await blob.arrayBuffer()),
        pace: async () => {},
      },
      () => {},
    );
    expect(outs[0].name).toBe("rapor.xlsx");

    const wb = XLSX.read(await outs[0].blob.arrayBuffer());
    const ws = wb.Sheets[wb.SheetNames[0]];
    const aoa = XLSX.utils.sheet_to_json(ws, { header: 1 }) as string[][];
    expect(aoa.some((row) => row.join(" ").includes("Andi"))).toBe(true);
    expect(aoa.some((row) => row.join(" ").includes("Budi"))).toBe(true);
  });

  it("throws scan error on a blank PDF", async () => {
    const doc = await PDFDocument.create();
    doc.addPage([300, 400]);
    const bytes = await doc.save();
    const copy = new Uint8Array(bytes.byteLength);
    copy.set(bytes);
    const blob = new Blob([copy.buffer], { type: "application/pdf" });
    const file = new File([blob], "blank.pdf", { type: "application/pdf" });
    await expect(
      engine(
        {
          file,
          files: [file],
          entries: [{ id: "1", file, name: "blank.pdf", size: blob.size, status: "ok" as const, pages: 1 }],
          options: {},
          data: new Uint8Array(await blob.arrayBuffer()),
          pace: async () => {},
        },
        () => {},
      ),
    ).rejects.toMatchObject({ code: "scan" });
  });
});