import type { DemoEntry } from "../shared/components";
import type { Options } from "../Workflow";

const PRESETS = [
  { key: "a4", label: "A4", dim: "210 Ã— 297 mm" },
  { key: "a5", label: "A5", dim: "148 Ã— 210 mm" },
  { key: "letter", label: "Letter", dim: "215.9 Ã— 279.4 mm" },
  { key: "legal", label: "Legal", dim: "215.9 Ã— 355.6 mm" },
  { key: "custom", label: "Kustom", dim: "Masukkan ukuran sendiri" },
];

export function OptionsPanel({
  options,
  setOptions,
}: {
  options: Options;
  setOptions: (o: Options) => void;
  files: DemoEntry[];
}) {
  const preset = String(options.preset ?? "a4");
  const orientation = String(options.orientation ?? "portrait");
  const customW = Number(options.customWidth ?? 210);
  const customH = Number(options.customHeight ?? 297);

  return (
    <div className="stack">
      <div className="field">
        <label>Ukuran Halaman</label>
        <div className="preset-grid">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              className={`preset ${preset === p.key ? "sel" : ""}`}
              onClick={() => setOptions({ ...options, preset: p.key })}
            >
              <span className="preset-name">{p.label}</span>
              <span className="preset-dim">{p.dim}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label>Orientasi</label>
        <div className="seg">
          <button className={orientation === "portrait" ? "sel" : ""} onClick={() => setOptions({ ...options, orientation: "portrait" })}>
            Portrait
          </button>
          <button className={orientation === "landscape" ? "sel" : ""} onClick={() => setOptions({ ...options, orientation: "landscape" })}>
            Landscape
          </button>
        </div>
      </div>

      {preset === "custom" && (
        <div className="options-grid">
          <div className="field">
            <label htmlFor="custom-w">Lebar (mm)</label>
            <input
              id="custom-w"
              className="input"
              type="number"
              min="10"
              max="1000"
              value={customW}
              onChange={(e) => setOptions({ ...options, customWidth: Number(e.target.value) })}
            />
          </div>
          <div className="field">
            <label htmlFor="custom-h">Tinggi (mm)</label>
            <input
              id="custom-h"
              className="input"
              type="number"
              min="10"
              max="1000"
              value={customH}
              onChange={(e) => setOptions({ ...options, customHeight: Number(e.target.value) })}
            />
          </div>
        </div>
      )}
    </div>
  );
}