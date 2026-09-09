import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import type { DemoEntry } from "../shared/components";
import { renderPageToDataUrl, pdfInfo } from "../shared/pdfkit";
import type { Options } from "../Workflow";

export function PreviewPanel({
  options,
  setOptions,
  files,
}: {
  options: Options;
  setOptions: (o: Options) => void;
  files: DemoEntry[];
  setFiles: (f: DemoEntry[]) => void;
}) {
  const [thumbs, setThumbs] = useState<Array<{ pageNo: number; src: string }>>([]);
  const [loading, setLoading] = useState(true);
  const selected = options.selectedPages as string | number[];
  const allSelected = selected === "all" || (Array.isArray(selected) && selected.length === 0);

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
    return () => { cancelled = true; };
  }, [files]);

  const toggle = (pageNo: number) => {
    const current = options.selectedPages;
    if (current === "all" || !Array.isArray(current)) {
      const file = files[0];
      const total = file?.pages ?? 0;
      const allPages = Array.from({ length: total }, (_, i) => i + 1);
      const remaining = allPages.filter((p) => p !== pageNo);
      setOptions({ ...options, selectedPages: remaining });
    } else {
      const has = current.includes(pageNo);
      const next = has ? current.filter((p) => p !== pageNo) : [...current, pageNo].sort((a, b) => a - b);
      setOptions({ ...options, selectedPages: next.length ? next : "all" });
    }
  };

  if (loading) {
    return <div className="muted" style={{ padding: 20, textAlign: "center" }}>Memuat pratinjau...</div>;
  }

  return (
    <div>
      <div className="muted mb-2" style={{ fontSize: 13 }}>
        {allSelected
          ? `Semua halaman (${thumbs.length}) akan diekspor.`
          : `${selected.length} dari ${thumbs.length} halaman dipilih.`}
      </div>
      <div className="thumbs">
        {thumbs.map((t) => {
          const isSelected = allSelected || (Array.isArray(selected) && selected.includes(t.pageNo));
          return (
            <div
              key={t.pageNo}
              className={`thumb ${isSelected ? "sel" : ""}`}
              onClick={() => toggle(t.pageNo)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggle(t.pageNo)}
              aria-label={`Halaman ${t.pageNo}`}
              aria-pressed={isSelected}
            >
              <img src={t.src} alt={`Halaman ${t.pageNo}`} width={160} height={113} loading="lazy" />
              <span className="thumb-num">{t.pageNo}</span>
              {isSelected && (
                <span className="thumb-check">
                  <Check />
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}