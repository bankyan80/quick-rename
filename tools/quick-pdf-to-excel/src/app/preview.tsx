import { useEffect, useState } from "react";
import { Table as TableIcon } from "lucide-react";
import type { DemoEntry } from "../shared/components";
import { extractPagesText } from "../shared/pdfkit";
import type { ExtractedPage } from "../shared/pdfkit";
import { pagesToRows } from "../engine";
import type { Options } from "../Workflow";

export function PreviewPanel({
  files,
}: {
  options: Options;
  setOptions: (o: Options) => void;
  files: DemoEntry[];
  setFiles: (f: DemoEntry[]) => void;
}) {
  const [textPages, setTextPages] = useState<ExtractedPage[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const file = files[0];
      if (!file) return;
      const data = new Uint8Array(await file.file.arrayBuffer());
      const extracted = await extractPagesText(data);
      if (!cancelled) {
        setTextPages(extracted);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [files]);

  if (loading) return <div className="muted" style={{ padding: 20, textAlign: "center" }}>Menganalisis tabel...</div>;

  const rows = pagesToRows(textPages ?? []);
  const totalChars = (textPages ?? []).reduce((a, p) => a + p.charCount, 0);

  if (!(textPages ?? []).length || totalChars < 20) {
    return (
      <div className="alert alert-warn" style={{ fontSize: 13 }}>
        <div>
          Tidak ada teks yang terdeteksi pada dokumen scan. OCR diperlukan untuk mengambil data tabel.
        </div>
      </div>
    );
  }

  const firstRows = rows.slice(0, 8);
  const colCount = Math.max(1, ...firstRows.map((r) => r.cells.length));

  return (
    <div className="stack">
      <div className="muted" style={{ fontSize: 13 }}>
        <TableIcon size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
        {rows.length} baris terdeteksi dari {textPages?.length} halaman
      </div>
      <div className="table-prev-wrap">
        <table className="table-prev">
          <thead>
            <tr>
              <th>#</th>
              {Array.from({ length: colCount }, (_, i) => (
                <th key={i}>Kolom {i + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {firstRows.map((r, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                {Array.from({ length: colCount }, (_, c) => (
                  <td key={c}>{r.cells[c] ?? ""}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > 8 && <div className="muted" style={{ fontSize: 12 }}>â€¦ {rows.length - 8} baris lainnya akan diambil dalam file Excel.</div>}
    </div>
  );
}