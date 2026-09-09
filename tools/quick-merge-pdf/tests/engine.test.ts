import { describe, expect, it } from "vitest";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { engine } from "../src/engine";

async function samplePdf(pages: number, label: string): Promise<Blob> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let p = 1; p <= pages; p++) {
    const page = doc.addPage([300, 400]);
    page.drawText(`${label} page ${p}`, { x: 40, y: 300, size: 16, font, color: rgb(0.1, 0.2, 0.9) });
  }
  const bytes = await doc.save();
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return new Blob([copy.buffer], { type: "application/pdf" });
}

async function makeJob(blob: Blob, name: string, options: Record<string, unknown>, pages: number) {
  const file = new File([blob], name, { type: "application/pdf" });
  return {
    file,
    files: [file],
    entries: [{ id: "1", file, name, size: blob.size, status: "ok" as const, pages }],
    options,
    data: new Uint8Array(await blob.arrayBuffer()),
    pace: async () => {},
  };
}

describe("merge engine", () => {
  it("merges two PDFs into one with combined page count", async () => {
    const a = await samplePdf(1, "A");
    const b = await samplePdf(2, "B");
    const job = {
      ...(await makeJob(a, "a.pdf", {}, 1)),
      files: [new File([a], "a.pdf", { type: "application/pdf" }), new File([b], "b.pdf", { type: "application/pdf" })],
    };
    const { data } = job;
    const outs = await engine({ ...job, file: job.files[0] }, () => {});
    expect(outs).toHaveLength(1);
    expect(outs[0].name).toBe("merged-document.pdf");
    expect(outs[0].kind).toBe("pdf");
    const loaded = await PDFDocument.load(await outs[0].blob.arrayBuffer());
    expect(loaded.getPageCount()).toBe(3);
    expect(data.byteLength).toBeGreaterThan(0);
  });

  it("uses the custom filename option and sanitizes it", async () => {
    const a = await samplePdf(1, "A");
    const job = await makeJob(a, "a.pdf", { filename: "Hasil: Gabung" }, 1);
    const outs = await engine(job, () => {});
    expect(outs[0].name).toBe("Hasil- Gabung.pdf");
  });

  it("falls back when the filename option is empty", async () => {
    const a = await samplePdf(1, "A");
    const job = await makeJob(a, "a.pdf", { filename: "" }, 1);
    const outs = await engine(job, () => {});
    expect(outs[0].name).toBe("merged-document.pdf");
  });

  it("rejects a corrupt PDF with code invalid", async () => {
    const corrupt = new Blob(["not a pdf at all"], { type: "application/pdf" });
    const job = await makeJob(corrupt, "broken.pdf", {}, 1);
    await expect(engine(job, () => {})).rejects.toMatchObject({ code: "invalid" });
  });
});