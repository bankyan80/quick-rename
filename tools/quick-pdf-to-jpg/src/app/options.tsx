import type { DemoEntry } from "../shared/components";
import type { Options } from "../Workflow";

const QUALITIES = ["low", "medium", "high"] as const;

export function OptionsPanel({
  options,
  setOptions,
  files,
}: {
  options: Options;
  setOptions: (o: Options) => void;
  files: DemoEntry[];
}) {
  const quality = String(options.quality ?? "high");
  const scale = Number(options.scale ?? 2);
  const pages = files[0]?.pages ?? 0;

  return (
    <div className="stack">
      <div className="field">
        <label>Kualitas</label>
        <div className="seg">
          {QUALITIES.map((q) => (
            <button
              key={q}
              className={quality === q ? "sel" : ""}
              onClick={() => setOptions({ ...options, quality: q })}
            >
              {q === "low" ? "Rendah" : q === "medium" ? "Sedang" : "Tinggi"}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label htmlFor="scale">Skala</label>
        <div className="row">
          <input
            id="scale"
            type="range"
            min="1"
            max="4"
            step="0.1"
            value={scale}
            onChange={(e) => setOptions({ ...options, scale: Number(e.target.value) })}
            style={{ flex: 1 }}
          />
          <span className="mono" style={{ fontSize: 13, minWidth: 38, textAlign: "right" }}>
            {scale.toFixed(1)}x
          </span>
        </div>
      </div>

      <div className="tagline-block">
        Halaman: {pages} halaman
        <span className="mt-1 muted" style={{ fontSize: 12 }}>
          Klik thumbnail untuk memilih halaman tertentu. Tanpa pilihan = ekspor semua.
        </span>
      </div>
    </div>
  );
}