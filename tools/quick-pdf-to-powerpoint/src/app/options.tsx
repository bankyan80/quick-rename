import { Presentation } from "lucide-react";
import type { DemoEntry } from "../shared/components";
import type { Options } from "../Workflow";

export function OptionsPanel({
  options,
}: {
  options: Options;
  setOptions: (o: Options) => void;
  files: DemoEntry[];
}) {
  const mode = String(options.mode ?? "image");

  return (
    <div className="stack">
      <div className="field">
        <label>Mode Slide</label>
        <div className="radio-card sel" aria-selected="true">
          <span className="rc-ico">
            <Presentation size={18} />
          </span>
          <div>
            <div className="rc-title">Slide berbasis gambar</div>
            <div className="rc-desc">Satu halaman PDF = satu slide, tampilan asli dipertahankan. Teks tidak dapat diedit di PowerPoint.</div>
          </div>
        </div>
      </div>

      {mode === "editable" && (
        <div className="alert alert-warn" style={{ fontSize: 13 }}>
          <div>Mode konten yang dapat diedit penuh belum tersedia dan akan tiba pada rilis berikutnya.</div>
        </div>
      )}

      <div className="alert alert-info" style={{ fontSize: 13 }}>
        <div>
          Hasil ini adalah slide gambar (image-based). Untuk catatan atau teks yang dapat disunting,
          gunakan output Word terlebih dahulu.
        </div>
      </div>
    </div>
  );
}