import { PDFDocument } from "pdf-lib";
import type { ConvertError, Engine } from "./Workflow";
import { sanitizeFileBase } from "./shared/toolkit";

const MM2PT = 72 / 25.4;

const PRESETS: Record<string, { name: string; width: number; height: number }> = {
  a4: { name: "A4", width: 210 * MM2PT, height: 297 * MM2PT },
  a5: { name: "A5", width: 148 * MM2PT, height: 210 * MM2PT },
  letter: { name: "Letter", width: 215.9 * MM2PT, height: 279.4 * MM2PT },
  legal: { name: "Legal", width: 215.9 * MM2PT, height: 355.6 * MM2PT },
};

export const enrich = undefined;

export const engine: Engine = async (job, onProgress) => {
  const { data, file, options } = job;
  const presetKey = String(options.preset ?? "a4");
  const orientation = String(options.orientation ?? "portrait");
  const customW = Number(options.customWidth);
  const customH = Number(options.customHeight);

  let targetW: number;
  let targetH: number;

  if (presetKey === "custom" && customW > 0 && customH > 0) {
    targetW = customW * MM2PT;
    targetH = customH * MM2PT;
  } else {
    const preset = PRESETS[presetKey];
    if (!preset) throw { code: "invalid-preset", title: "Ukuran preset tidak valid." } as ConvertError;
    targetW = preset.width;
    targetH = preset.height;
  }

  if (orientation === "landscape" && targetW < targetH) {
    [targetW, targetH] = [targetH, targetW];
  }

  let doc: PDFDocument;
  try {
    doc = await PDFDocument.load(data, { ignoreEncryption: true });
  } catch {
    throw { code: "invalid", title: "PDF rusak atau tidak valid.", body: `"${file.name}" tidak dapat dibaca.` } as ConvertError;
  }

  const pages = doc.getPages();
  const total = pages.length;

  for (let i = 0; i < total; i++) {
    const page = pages[i];
    page.setSize(targetW, targetH);
    await job.pace(i + 1, total);
    onProgress({ current: i + 1, total, message: `Mengubah ukuran halaman ${i + 1} dari ${total}...` });
  }

  const bytes = await doc.save();
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const base = sanitizeFileBase(file.name.replace(/\.pdf$/i, ""));
  return [{ name: `${base}-resized.pdf`, blob: new Blob([copy.buffer], { type: "application/pdf" }), kind: "pdf" }];
};