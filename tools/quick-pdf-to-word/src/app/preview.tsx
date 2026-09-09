import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import type { DemoEntry } from "../shared/components";
import { extractPagesText } from "../shared/pdfkit";
import type { ExtractedPage } from "../shared/pdfkit";
import type { Options } from "../Workflow";

export function PreviewPanel({
  files,
}: {
  options: Options;
  setOptions: (o: Options) => void;
  files: DemoEntry[];
  setFiles: (f: DemoEntry[]) => void;
}) {
  const [pages, setPages] = useState<ExtractedPage[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const file = files[0];
      if (!file) return;
      const data = new Uint8Array(await file.file.arrayBuffer());
      const extracted = await extractPagesText(data);
      if (!cancelled) {
        setPages(extracted);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [files]);

  if (loading) return <div className="muted" style={{ padding: 20, textAlign: "center" }}>Mengekstrak teks...</div>;

  const totalChars = (pages ?? []).reduce((a, p) => a + p.charCount, 0);

  if ((pages ?? []).length === 0 || totalChars < 20) {
    return (
      <div className="alert alert-warn" style={{ fontSize: 13 }}>
        <div>
          Dokumen terdeteksi sebagai scan. OCR diperlukan untuk menghasilkan teks yang dapat diedit. Gunakan
          PDF berbasis teks agar konversi berhasil.
        </div>
      </div>
    );
  }

  return (
    <div className="stack">
      <div className="muted" style={{ fontSize: 13 }}>
        {pages?.length} halaman Â· {totalChars.toLocaleString("id-ID")} karakter terdeteksi
      </div>
      {pages?.slice(0, 3).map((p) => (
        <div key={p.page}>
          <div className="row" style={{ gap: 6 }}>
            <FileText size={14} style={{ color: "var(--accent)" }} />
            <span style={{ fontSize: 13, fontWeight: 650 }}>Halaman {p.page}</span>
          </div>
          <div className="card" style={{ padding: "12px 14px", fontSize: 13, lineHeight: 1.7, color: "var(--text-2)" }}>
            {p.lines.slice(0, 6).map((l, i) => (
              <div key={i} className="mono">{l || "\u00A0"}</div>
            ))}
            {p.lines.length > 6 && <div className="muted mt-1" style={{ fontSize: 12 }}>â€¦ {p.lines.length - 6} baris lainnya</div>}
          </div>
        </div>
      ))}
    </div>
  );
}