import { PDFDocument } from "pdf-lib";
import type { ConvertError, Engine } from "../Workflow";
import { sanitizeFileBase } from "../shared/toolkit";

export const enrich = undefined;

export const engine: Engine = async (job, onProgress) => {
  const merged = await PDFDocument.create();
  merged.setTitle("Merged Document");
  merged.setCreator("Quick Merge PDF");

  let current = 0;
  const total = Math.max(1, job.entries.reduce((a, e) => a + (e.pages ?? 1), 0));

  onProgress({ current: 0, total, message: "Menyalin halaman...", });

  for (let i = 0; i < job.files.length; i++) {
    const file = job.files[i];
    let source: PDFDocument;
    try {
      source = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
    } catch {
      throw { code: "invalid", title: "PDF rusak atau tidak valid.", body: `"${file.name}" tidak dapat dibaca.` } as ConvertError;
    }
    const indices = source.getPageIndices();
    const copied = await merged.copyPages(source, indices);
    for (const page of copied) {
      merged.addPage(page);
      current += 1;
      await job.pace(current, total);
      onProgress({
        current: Math.min(current, total),
        total,
        message: `Menyalin halaman ${Math.min(current, total)} dari ${total}...`,
      });
    }
  }

  const bytes = await merged.save();
  const base = sanitizeFileBase(String(job.options.filename ?? "merged-document"));
  return [{ name: `${base || "merged-document"}.pdf`, blob: new Blob([bytes], { type: "application/pdf" }), kind: "pdf" }];
};