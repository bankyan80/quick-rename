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
  return (
    <div className="stack">
      <div className="field">
        <label htmlFor="merged-name">Nama file hasil</label>
        <input
          id="merged-name"
          className="input"
          value={String(options.filename ?? "merged-document")}
          onChange={(e) => setOptions({ ...options, filename: e.target.value })}
          spellCheck={false}
        />
        <span className="label-hint">Contoh: 01-Surat.pdf + 02-Lampiran.pdf â†’ hasil akhir menyesuaikan urutan.</span>
      </div>
      <div className="tagline-block">
        Catatan
        <span>
          Urutan file menentukan urutan halaman pada dokumen gabungan. Seret pegangan panah untuk
          menata ulang di daftar file.
        </span>
      </div>
    </div>
  );
}