import type { DemoEntry } from "../shared/components";
import type { Options } from "../Workflow";

export function OptionsPanel({
  options,
  setOptions,
}: {
  options: Options;
  setOptions: (o: Options) => void;
  files: DemoEntry[];
}) {
  const includePages = Boolean(options.includePages ?? true);

  return (
    <div className="stack">
      <div className="row" style={{ gap: 14 }}>
        <label className="check-label" style={{ alignItems: "center" }}>
          <span className="switch">
            <input
              type="checkbox"
              checked={includePages}
              onChange={(e) => setOptions({ ...options, includePages: e.target.checked })}
            />
            <span />
          </span>
          Sertakan penanda halaman
        </label>
      </div>

      <div className="alert alert-info" style={{ fontSize: 13 }}>
        <div>
          Kualitas hasil sangat bergantung pada PDF sumber. Hasil terbaik untuk dokumen teks. Untuk PDF scan
          tanpa lapisan teks, konversi OCR diperlukan dan belum tersedia secara otomatis.
        </div>
      </div>
    </div>
  );
}