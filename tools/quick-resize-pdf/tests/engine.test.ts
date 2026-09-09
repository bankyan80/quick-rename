import { describe, expect, it } from "vitest";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { engine } from "../src/engine";

const MM2PT = 72 / 25.4;

async function sampleA4(): Promise<Blob> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage([595.28, 841.89]);
  page.drawText("Resize me", { x: 60, y: 700, size: 18, font, color: rgb(0.1, 0.2, 0.9) });
  const bytes = await doc.save();
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return new Blob([copy.buffer], { type: "application/pdf" });
}

async function run(blob: Blob, options: Record<string, unknown>) {
  const file = new File([blob], "dokumen.pdf", { type: "application/pdf" });
  return engine(
    {
      file,
      files: [file],
      entries: [{ id: "1", file, name: "dokumen.pdf", size: blob.size, status: "ok" as const, pages: 1 }],
      options,
      data: new Uint8Array(await blob.arrayBuffer()),
      pace: async () => {},
    },
    () => {},
  );
}

describe("resize engine", () => {
  it("sets A4 portrait size", async () => {
    const outs = await run(await sampleA4(), { preset: "a4", orientation: "portrait" });
    const doc = await PDFDocument.load(await outs[0].blob.arrayBuffer());
    const [page] = doc.getPages();
    expect(page.getWidth()).toBeCloseTo(210 * MM2PT, 1);
    expect(page.getHeight()).toBeCloseTo(297 * MM2PT, 1);
  });

  it("swaps A4 to landscape when requested", async () => {
    const outs = await run(await sampleA4(), { preset: "a4", orientation: "landscape" });
    const doc = await PDFDocument.load(await outs[0].blob.arrayBuffer());
    const [page] = doc.getPages();
    expect(page.getWidth()).toBeGreaterThan(page.getHeight());
    expect(page.getWidth()).toBeCloseTo(297 * MM2PT, 1);
  });

  it("supports custom sizes in millimeters", async () => {
    const outs = await run(await sampleA4(), { preset: "custom", customWidth: 100, customHeight: 150, orientation: "portrait" });
    const doc = await PDFDocument.load(await outs[0].blob.arrayBuffer());
    const [page] = doc.getPages();
    expect(page.getWidth()).toBeCloseTo(100 * MM2PT, 1);
    expect(page.getHeight()).toBeCloseTo(150 * MM2PT, 1);
  });

  it("throws invalid-preset for unknown preset", async () => {
    await expect(run(await sampleA4(), { preset: "nope" })).rejects.toMatchObject({ code: "invalid-preset" });
  });

  it("names output with -resized suffix", async () => {
    const outs = await run(await sampleA4(), { preset: "a5", orientation: "portrait" });
    expect(outs[0].name).toBe("dokumen-resized.pdf");
  });
});