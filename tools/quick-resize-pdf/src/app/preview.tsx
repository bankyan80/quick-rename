import { ArrowDown, FileText } from "lucide-react";
import type { DemoEntry } from "../shared/components";
import type { Options } from "../Workflow";

const PRESET_DIMS: Record<string, [number, number]> = {
  a4: [210, 297],
  a5: [148, 210],
  letter: [215.9, 279.4],
  legal: [215.9, 355.6],
};

export function PreviewPanel({
  options,
}: {
  options: Options;
  setOptions: (o: Options) => void;
  files: DemoEntry[];
  setFiles: (f: DemoEntry[]) => void;
}) {
  const preset = String(options.preset ?? "a4");
  const orientation = String(options.orientation ?? "portrait");
  const customW = Number(options.customWidth ?? 210);
  const customH = Number(options.customHeight ?? 297);

  let newW: number;
  let newH: number;
  if (preset === "custom") {
    newW = customW;
    newH = customH;
  } else {
    const dims = PRESET_DIMS[preset] ?? [210, 297];
    newW = dims[0];
    newH = dims[1];
  }
  if (orientation === "landscape" && newW < newH) [newW, newH] = [newH, newW];

  return (
    <div className="stack" style={{ alignItems: "center", padding: "12px 0" }}>
      <div className="filerow" style={{ maxWidth: 240, width: "100%", justifyContent: "center" }}>
        <FileText size={17} />
        <span className="mono" style={{ fontSize: 13 }}>A4 asli (210 Ã— 297 mm)</span>
      </div>
      <ArrowDown size={20} style={{ color: "var(--accent)" }} />
      <div className="filerow" style={{ maxWidth: 240, width: "100%", justifyContent: "center", background: "var(--accent-soft)", borderColor: "var(--accent-line)" }}>
        <FileText size={17} style={{ color: "var(--accent)" }} />
        <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>
          {newW.toFixed(1)} Ã— {newH.toFixed(1)} mm
        </span>
      </div>
      <div className="muted" style={{ fontSize: 12 }}>
        Orientasi: {orientation === "landscape" ? "Landscape" : "Portrait"}
      </div>
    </div>
  );
}