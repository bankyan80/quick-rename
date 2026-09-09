import { renderPageToCanvas, defaultPdfScale, openPdf } from "./shared/pdfkit";
import { canvasToBlob, pad, sanitizeFileBase } from "./shared/toolkit";
import type { ConvertError, Engine } from "./Workflow";

type Quality = "low" | "medium" | "high";

const QUALITY_MAP: Record<Quality, { scale: number; jpeg: number }> = {
  low: { scale: 1.2, jpeg: 0.75 },
  medium: { scale: 1.8, jpeg: 0.85 },
  high: { scale: 2.5, jpeg: 0.95 },
};

/** Pure page-selection helper, unit-testable. */
export function resolveSelectedPages(selectedPages: unknown, total: number): number[] {
  if (Array.isArray(selectedPages) && selectedPages.length > 0) {
    return selectedPages
      .map((p) => Number(p))
      .filter((p) => Number.isInteger(p) && p >= 1 && p <= total)
      .sort((a, b) => a - b);
  }
  return Array.from({ length: total }, (_, i) => i + 1);
}

export const enrich = undefined;

export const engine: Engine = async (job, onProgress) => {
  const { data, options, file } = job;
  const quality = (String(options.quality ?? "high") === "low" || String(options.quality ?? "high") === "medium" ? String(options.quality ?? "high") : "high") as Quality;
  const scaleOverride = Number(options.scale);
  const qCfg = QUALITY_MAP[quality] ?? QUALITY_MAP.high;
  const scale = scaleOverride > 0 ? scaleOverride : qCfg.scale;
  const jpegQuality = qCfg.jpeg;

  const doc = await openPdf(data);
  const total = doc.numPages;

  // Determine which pages to export
  const selectedPages = options.selectedPages;
  const pages = resolveSelectedPages(selectedPages, total);

  if (pages.length === 0) {
    await doc.destroy();
    throw { code: "no-pages", title: "Tidak ada halaman yang dipilih.", body: "Pilih minimal satu halaman untuk dikonversi." } as ConvertError;
  }

  const base = sanitizeFileBase(file.name.replace(/\.pdf$/i, ""));
  const outputs: { name: string; blob: Blob; kind: string }[] = [];

  let done = 0;
  onProgress({ current: 0, total: pages.length, message: `Mengonversi halaman 1 dari ${pages.length}...` });

  for (const pageNo of pages) {
    const renderedScale = defaultPdfScale(595.28, 595.28 * scale);
    const canvas = await renderPageToCanvas(data, pageNo, renderedScale);
    const blob = await canvasToBlob(canvas, "image/jpeg", jpegQuality);
    done += 1;
    const num = pad(done, String(pages.length).length);
    outputs.push({ name: `${base}-${num}.jpg`, blob, kind: "image/jpeg" });
    await job.pace(done, pages.length);
    onProgress({ current: done, total: pages.length, message: `Mengonversi halaman ${done} dari ${pages.length}...` });
  }

  await doc.destroy();
  return outputs;
};