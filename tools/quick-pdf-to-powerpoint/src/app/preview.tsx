import { useEffect, useState } from "react";
import type { DemoEntry } from "../shared/components";
import { pdfInfo, renderPageToDataUrl } from "../shared/pdfkit";
import type { Options } from "../Workflow";

export function PreviewPanel({
  files,
}: {
  options: Options;
  setOptions: (o: Options) => void;
  files: DemoEntry[];
  setFiles: (f: DemoEntry[]) => void;
}) {
  const [thumbs, setThumbs] = useState<Array<{ pageNo: number; src: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const file = files[0];
      if (!file) return;
      const data = new Uint8Array(await file.file.arrayBuffer());
      const info = await pdfInfo(data);
      const srcs: Array<{ pageNo: number; src: string }> = [];
      for (let p = 1; p <= info.pageCount; p++) {
        const src = await renderPageToDataUrl(data, p, 0.18);
        if (cancelled) return;
        srcs.push({ pageNo: p, src });
      }
      if (!cancelled) {
        setThumbs(srcs);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [files]);

  if (loading) return <div className="muted" style={{ padding: 20, textAlign: "center" }}>Memuat pratinjau slide...</div>;

  return (
    <div style={{ minHeight: 180 }}>
      <div className="muted mb-2" style={{ fontSize: 13 }}>
        {thumbs.length} halaman â†’ {thumbs.length} slide
      </div>
      <div className="thumbs">
        {thumbs.map((t) => (
          <div key={t.pageNo} className="thumb sel" aria-label={`Slide ${t.pageNo}`}>
            <img src={t.src} alt={`Slide ${t.pageNo}`} width={160} height={113} loading="lazy" />
            <span className="thumb-num">{t.pageNo}</span>
          </div>
        ))}
      </div>
    </div>
  );
}