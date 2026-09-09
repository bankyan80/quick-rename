import { ArrowDown, FileText } from "lucide-react";
import type { DemoEntry } from "../../shared/components";
import type { Options } from "../../Workflow";

export function PreviewPanel({ files }: { options: Options; setOptions: (o: Options) => void; files: DemoEntry[]; setFiles: (f: DemoEntry[]) => void }) {
  return (
    <div>
      <div className="filelist">
        {files.map((e, i) => (
          <div className="filerow" key={e.id} style={{ padding: "9px 12px" }}>
            <span className="file-ico" style={{ width: 30, height: 30, borderRadius: 8 }}>
              <FileText size={15} />
            </span>
            <span className="mono" style={{ fontSize: 13.5, fontWeight: 650, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
              {i + 1}. {e.name}
            </span>
            <span className="file-meta">({e.pages ?? "?"} hal)</span>
          </div>
        ))}
      </div>
      <div className="center" style={{ color: "var(--accent)", margin: "10px 0" }}>
        <ArrowDown size={18} />
      </div>
      <div className="filerow" style={{ background: "var(--accent-soft)", borderColor: "var(--accent-line)" }}>
        <span className="file-ico" style={{ background: "var(--accent)" }}>
          <FileText size={16} />
        </span>
        <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: "var(--accent)" }}>
          {String(options.filename ?? "merged-document")}.pdf
        </span>
      </div>
    </div>
  );
}