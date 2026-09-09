import { renderPageToCanvas, pdfInfo } from "./shared/pdfkit";
import { sanitizeFileBase, toBlob } from "./shared/toolkit";
import type { ConvertError, Engine } from "./Workflow";

/** Pure helper, unit-testable: pick a pptxgen string layout name from page dims. */
export function aspectClass(wPoints: number, hPoints: number): "portrait" | "landscape" | "square" {
  const r = wPoints / hPoints;
  if (r > 1.05) return "landscape";
  if (r < 0.95) return "portrait";
  return "square";
}

export const enrich = undefined;

export const engine: Engine = async (job, onProgress) => {
  const { data, file } = job;

  const info = await pdfInfo(data);
  const total = info.pageCount;
  const base = sanitizeFileBase(file.name.replace(/\.pdf$/i, ""));

  /** Image-based slides: render each page once and embed as picture. */
  const slides: Array<{ dataUrl: string; wPt: number; hPt: number }> = [];
  for (let p = 1; p <= total; p++) {
    onProgress({ current: p, total, message: `Membuat slide ${p} dari ${total}...` });
    const canvas = await renderPageToCanvas(data, p, 1.6);
    const dataUrl = canvas.toDataURL("image/png");
    slides.push({ dataUrl, wPt: canvas.width / 1.6, hPt: canvas.height / 1.6 });
    await job.pace(p, total);
  }

  onProgress({ current: total, total, message: "Merangkai presentasi..." });

  try {
    const pptx = (await import("pptxgenjs")).default;
    const pres = new pptx();
    const layout = aspectClass(slides[0]?.wPt ?? 595, slides[0]?.hPt ?? 842);
    if (layout === "portrait") {
      pres.defineLayout({ name: "PORTRAIT", width: 8.27, height: 11.69 });
      pres.layout = "PORTRAIT";
    } else if (layout === "square") {
      pres.defineLayout({ name: "SQUARE", width: 8.5, height: 8.5 });
      pres.layout = "SQUARE";
    }

    for (let i = 0; i < slides.length; i++) {
      const s = slides[i];
      pres.addSlide().addImage({
        data: s.dataUrl,
        x: 0,
        y: 0,
        w: "100%",
        h: "100%",
        sizing: { type: "contain", w: "100%", h: "100%" },
      });
    }

    const blob = await toBlob(await pres.write({ outputType: "blob" }), "application/vnd.openxmlformats-officedocument.presentationml.presentation");
    return [{ name: `${base}.pptx`, blob, kind: "pptx" }];
  } catch {
    throw { code: "output", title: "Terjadi masalah saat membuat file hasil.", body: "Coba konversi ulang menggunakan file lain." } as ConvertError;
  }
};