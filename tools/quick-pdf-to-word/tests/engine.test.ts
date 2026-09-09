import { describe, expect, it } from "vitest";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { buildDocx, engine, paragraphize } from "../src/engine";
import type { ExtractedPage } from "../src/shared/pdfkit";

function page(lines: string[], pageNo = 1): ExtractedPage {
  const hasText = lines.join("").length > 5;
  return { page: pageNo, lines, hasText, charCount: lines.join("").length };
}

describe("paragraphize", () => {
  it("emits page markers only when enabled", () => {
    const pages = [page(["Halo dunia"], 1), page(["Kedua"], 2)];
    const withMarkers = paragraphize(pages, true);
    expect(withMarkers.filter((p) => p.kind === "page")).toHaveLength(2);
    expect(withMarkers[0]).toMatchObject({ kind: "page", text: "Halaman 1" });

    const without = paragraphize(pages, false);
    expect(without.filter((p) => p.kind === "page")).toHaveLength(0);
  });

  it("marks text-less pages honestly", () => {
    const empty = paragraphize([page([], 5)], true);
    expect(empty.some((p) => p.text.includes("tidak ada teks terdeteksi"))).toBe(true);
  });

  it("keeps real lines as paragraphs and appends blank separators", () => {
    const out = paragraphize([page(["Satu", "Dua"])], false);
    expect(out.filter((p) => p.kind === "para")).toHaveLength(2);
    expect(out.some((p) => p.kind === "blank")).toBe(true);
  });
});

describe("buildDocx", () => {
  it("produces a valid .docx blob (zip signature)", async () => {
    const blob = await buildDocx(paragraphize([page(["Halo dunia"], 1)], true), "test");
    const header = new Uint8Array(await blob.arrayBuffer()).slice(0, 4);
    expect(String.fromCharCode(...header)).toBe("PK\u0003\u0004");
  });
});

describe("word engine integration", () => {
  it("converts a text-based PDF to docx", async () => {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const pg = doc.addPage([400, 500]);
    pg.drawText("Semua orang berhak atas pendidikan.", { x: 50, y: 400, size: 14, font });
    pg.drawText("Baris kedua dari dokumen ini.", { x: 50, y: 370, size: 14, font });
    const bytes = await doc.save();
    const copy = new Uint8Array(bytes.byteLength);
    copy.set(bytes);
    const blob = new Blob([copy.buffer], { type: "application/pdf" });
    const file = new File([blob], "hak.pdf", { type: "application/pdf" });

    const outs = await engine(
      {
        file,
        files: [file],
        entries: [{ id: "1", file, name: "hak.pdf", size: blob.size, status: "ok" as const, pages: 1 }],
        options: { includePages: true },
        data: new Uint8Array(await blob.arrayBuffer()),
        pace: async () => {},
      },
      () => {},
    );
    expect(outs[0].name).toBe("hak.docx");
    expect(outs[0].kind).toBe("docx");
    const outHeader = new Uint8Array(await outs[0].blob.arrayBuffer()).slice(0, 4);
    expect(String.fromCharCode(...outHeader)).toBe("PK\u0003\u0004");
  });

  it("throws scan error on a blank (text-less) PDF", async () => {
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