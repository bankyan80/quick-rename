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
  const mode = String(options.sheetMode ?? "one");

  return (
    <div className="stack">
      <div className="field">
        <label>Penempatan Data</label>
        <div className="seg">
          <button className={mode === "one" ? "sel" : ""} onClick={() => setOptions({ ...options, sheetMode: "one" })}>
            Satu lembar
          </button>
          <button className={mode === "per-page" ? "sel" : ""} onClick={() => setOptions({ ...options, sheetMode: "per-page" })}>
            Per halaman
          </button>
        </div>
      </div>

      <div className="alert alert-info" style={{ fontSize: 13 }}>
        <div>
          Tabel kompleks dengan sel bergabung, garis menurun, atau gambar mungkin tetap memerlukan
          perbaikan manual di Excel.
        </div>
      </div>
    </div>
  );
}