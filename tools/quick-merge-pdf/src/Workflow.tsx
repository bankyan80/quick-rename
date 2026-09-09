import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, FileText, Files, FolderOpen, RefreshCw, Sparkles, CheckCircle2, Loader2, UploadCloud } from "lucide-react";
import { ErrorAlert, FileRow, PrivacyNote, Stepper } from "./shared/components";
import type { DemoEntry } from "./shared/components";
import { formatBytes, isDemoMode, uid } from "./shared/toolkit";
import { pdfInfo } from "./shared/pdfkit";

/* ---------------- public types ---------------- */

export type Options = Record<string, unknown>;
export type Progress = { current: number; total: number; message?: string };
export type OutputFile = { name: string; blob: Blob; kind: string };
export type ConvertError = { code?: string; title: string; body?: string };

export type EngineJob = {
  file: File;
  files: File[];
  entries: DemoEntry[];
  options: Options;
  data: Uint8Array;
  pace: (current: number, total: number) => Promise<void>;
};

export type Engine = (job: EngineJob, onProgress: (p: Progress) => void) => Promise<OutputFile[]>;

export type AppConfig = {
  meta: import("./config/meta").Meta;
  texts: import("./config/texts").Texts;
  single: boolean;
  accept: string;
  maxMb: number;
  steps: string[];
  defaultOptions: Options;
  renderOptions: (ctx: { options: Options; setOptions: (o: Options) => void; files: DemoEntry[] }) => React.ReactNode;
  renderPreview: (ctx: { options: Options; setOptions: (o: Options) => void; files: DemoEntry[]; setFiles: (f: DemoEntry[]) => void }) => React.ReactNode;
  engine: Engine;
  enrich?: (entry: DemoEntry, data: Uint8Array, idx: number, total: number, onProgress: (p: Progress) => void) => Promise<DemoEntry>;
};

type Phase = "select" | "ready" | "working" | "done";

const STEP_LABELS = (t: import("./config/texts").Texts) => [t.step1, t.step2, t.step3, t.step4, t.step5];

function paceFactory(demo: boolean) {
  if (!demo) return async () => {};
  return async (current: number, total: number) => {
    if (current > 0 && current < total) {
      await new Promise((r) => setTimeout(r, 1150));
    }
  };
}

async function waitFor<T>(predicate: () => T | null, timeoutMs: number): Promise<T | null> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const v = predicate();
    if (v) return v;
    await new Promise((r) => setTimeout(r, 120));
  }
  return null;
}

/* ---------------- files validation utility ---------------- */

export function validateFiles(files: File[], accept: string, maxMb: number): { rejections: Array<{ file: File; reason: string }>; valid: File[] } {
  const acceptExts = accept.split(",").map((a) => a.trim().replace(/^\./, "").toLowerCase()).filter((x) => x && !x.includes("/"));
  const rejections: Array<{ file: File; reason: string }> = [];
  const valid: File[] = [];
  for (const f of files) {
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    const okType = acceptExts.includes(ext) || f.type === "application/pdf";
    if (!okType) {
      rejections.push({ file: f, reason: "Format file tidak didukung. Gunakan berkas PDF." });
      continue;
    }
    if (f.size > maxMb * 1024 * 1024) {
      rejections.push({ file: f, reason: `Ukuran file terlalu besar (maksimal ${maxMb} MB).` });
      continue;
    }
    if (f.size === 0) {
      rejections.push({ file: f, reason: "File tidak dapat dibaca (ukuran 0 byte)." });
      continue;
    }
    valid.push(f);
  }
  return { rejections, valid };
}

/* ---------------- workflow ---------------- */

export function Workflow({ config, onOpenTutorial }: { config: AppConfig; onOpenTutorial?: () => void }) {
  const t = config.texts;
  const demo = isDemoMode();

  const [phase, setPhase] = useState<Phase>("select");
  const [entries, setEntries] = useState<DemoEntry[]>([]);
  const [options, setOptions] = useState<Options>(config.defaultOptions);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [outputs, setOutputs] = useState<OutputFile[] | null>(null);
  const [error, setError] = useState<ConvertError | null>(null);
  const [invalid, setInvalid] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [focusPanel, setFocusPanel] = useState<string | null>(null);

  const runningRef = useRef(false);
  const demoEntries = useRef<DemoEntry[]>([]);

  const steps = useMemo(() => STEP_LABELS(t), [t]);

  const addFiles = useCallback(
    async (files: File[], _source?: "pick" | "demo") => {
      if (busy) return;
      const { rejections, valid } = validateFiles(files, config.accept, config.maxMb);
      if (rejections.length) setInvalid(rejections[0].reason);
      if (!valid.length) return;

      const base = config.single ? [] : entries;
      setEntries([]);
      const list: DemoEntry[] = [
        ...base,
        ...valid.map((f, i) => ({
          id: `${uid()}-${i}`,
          file: f,
          name: f.name,
          size: f.size,
          status: "ok" as const,
        })),
      ];
      setEntries(list);

      const step = (msg: string) => setProgress({ current: 0, total: 0, message: msg });
      const enrichAll = async (listToEnrich: DemoEntry[]) => {
        const out: DemoEntry[] = [];
        for (let i = 0; i < listToEnrich.length; i++) {
          const e0 = listToEnrich[i];
          try {
            const data = new Uint8Array(await e0.file.arrayBuffer());
            if (config.enrich) {
              step(`Membaca ${e0.name}...`);
              out.push(await config.enrich(e0, data, i, listToEnrich.length, ({ current, total, message }) => setProgress({ current, total, message })));
            } else {
              step(`Membaca ${e0.name}...`);
              const info = await pdfInfo(data);
              out.push({ ...e0, pages: info.pageCount });
            }
          } catch {
            out.push({ ...e0, status: "error" });
          }
        }
        return out;
      };

      step("Membaca berkas PDF...");
      const enriched = await enrichAll(list);
      setEntries(enriched);
      setProgress(null);
      setPhase("ready");
    },
    [busy, config, entries],
  );

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id);
      if (!next.length) setPhase("select");
      return next;
    });
  }, []);

  const moveEntry = useCallback((from: number, to: number) => {
    setEntries((prev) => {
      if (from < 0 || from >= prev.length || to < 0 || to >= prev.length || from === to) return prev;
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    if (busy) return;
    runningRef.current = false;
    setEntries([]);
    setOutputs(null);
    setError(null);
    setInvalid(null);
    setProgress(null);
    setOptions(config.defaultOptions);
    setPhase("select");
    setFocusPanel(null);
  }, [busy, config.defaultOptions]);

  const run = useCallback(async () => {
    if (busy || !entries.length) return;
    if (config.single && entries.length > 1) return;
    setError(null);
    setOutputs(null);
    setPhase("working");
    setBusy(true);
    runningRef.current = true;
    const pace = paceFactory(demo);

    try {
      const first = entries[0];
      const data = new Uint8Array(await first.file.arrayBuffer());
      const outputs = await config.engine(
        { file: first.file, files: entries.map((e) => e.file), entries, options, data, pace },
        (p) => setProgress(p),
      );
      if (!runningRef.current) return;
      if (!outputs.length) throw { code: "empty", title: "Proses konversi gagal.", body: "Tidak ada file yang berhasil dihasilkan." } as ConvertError;
      for (const o of outputs) if (!o.blob) throw { code: "empty", title: "Terjadi masalah saat membuat file hasil." } as ConvertError;
      setOutputs(outputs);
      setPhase("done");
    } catch (err) {
      if (!runningRef.current) return;
      const e = err as ConvertError;
      setError(e && e.title ? e : { title: "Proses konversi gagal.", body: "Berkas mungkin rusak atau tidak valid." });
      setPhase("ready");
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }, [busy, config, demo, entries, options]);

  /* ---------------- demo + screen capture support ---------------- */

  useEffect(() => {
    if (!demo) return;
    const demoPhase = new URLSearchParams(window.location.search).get("phase") ?? "select";
    const demoFocus = new URLSearchParams(window.location.search).get("focus");

    const loadDemo = async () => {
      const { generateSamplePdf } = await import("./shared/pdfkit");
      const blob = await generateSamplePdf();
      const file = new File([blob], "dokumen-contoh.pdf", { type: "application/pdf" });

      // Run through the real add+enrich path (populates UI state).
      await addFiles([file], "demo");
      let list = await waitFor<DemoEntry[]>(() => (demoEntries.current.length ? demoEntries.current : null), 6000);
      if (!list) {
        list = [{ id: uid(), file, name: file.name, size: file.size, status: "ok", pages: 3 }];
        setEntries(list);
      }
      const entries0 = list;

      const targetPhase = demoPhase === "processing" || demoPhase === "done" ? "ready" : demoPhase;
      if (targetPhase === "upload") setPhase("ready");
      if (demoFocus) setFocusPanel(demoFocus);

      if (demoPhase === "processing" || demoPhase === "done") {
        await new Promise((r) => setTimeout(r, 900));
        setPhase("working");
        setBusy(true);
        const runDemo = async () => {
          try {
            const first = entries0[0];
            const data = new Uint8Array(await first.file.arrayBuffer());
            const outs = await config.engine(
              {
                file: first.file,
                files: entries0.map((e) => e.file),
                entries: entries0,
                options,
                data,
                pace: async () => {
                  await new Promise((r) => setTimeout(r, 1300));
                },
              },
              (p) => setProgress(p),
            );
            if (demoPhase === "done") {
              setOutputs(outs);
              setPhase("done");
              setProgress(null);
            }
          } catch {
            setError({ title: "Proses konversi gagal." });
            setPhase("ready");
          } finally {
            setBusy(false);
          }
        };
        void runDemo();
      }
    };
    loadDemo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const demoStep = useCallback((target: string) => {
    if (target === "upload" || target === "preview" || target === "options") {
      setPhase("ready");
      setFocusPanel(target === "options" ? "options" : target === "preview" ? "preview" : null);
    } else if (target === "processing") {
      setPhase("working");
      setBusy(true);
    } else if (target === "done") {
      setPhase("done");
      setOutputs((prev) => prev ?? DEMO_OUTPUTS());
      setProgress(null);
      setBusy(false);
    } else {
      reset();
      setPhase("select");
    }
  }, [reset]);

  const democontrolRef = useRef<(target: string) => void>(demoStep);
  democontrolRef.current = demoStep;

  useEffect(() => {
    demoEntries.current = entries;
  }, [entries]);

  useEffect(() => {
    if (!demo) return;
    const w = window as unknown as Record<string, unknown>;
    w.__qt = {
      phase: () => phase,
      set: (t: string) => democontrolRef.current(t),
      files: () => entries.length,
      canStart: () => entries.length > 0 && !busy,
      schema: Object.keys(config.defaultOptions),
    };
  }, [demo, phase, entries, busy, config.defaultOptions]);

  /* ---------------- render ---------------- */

  const stepIndex = phase === "select" ? 0 : phase === "ready" ? 1 : phase === "working" ? 3 : 4;

  const primaryLabel = t.primary;
  const filesLabel = entries.length === 1 ? "1 file" : `${entries.length} file`;

  return (
    <div className={`app ${demo ? "is-demo" : ""}`}>
      <div className="container main">
        {/* hero shown only on first selection */}
        {phase === "select" && (
          <div className="hero">
            <span className="hero-kicker">
              <Sparkles size={14} /> Quick Tools · {t.privacyShort}
            </span>
            <h1>{t.heading}</h1>
            <p className="hero-sub">{t.tagline}</p>
            <div className="hero-actions">
              <button className="btn btn-primary btn-lg" onClick={() => document.getElementById("dz-input")?.click()}>
                <FolderOpen size={19} /> {t.ctaStart}
              </button>
              <button className="btn btn-outline btn-lg" onClick={() => onOpenTutorial?.()}>
                <Sparkles size={18} /> Tutorial
              </button>
            </div>
          </div>
        )}

        <div className="mt-2">
          <DropZoneContainer active={phase === "select"} addFiles={addFiles} invalid={invalid} texts={t} config={config} />
        </div>

        {phase !== "select" && (
          <>
            <Stepper steps={steps} current={stepIndex} />

            {phase === "ready" && (
              <div className="stack">
<Wi
  show={focusPanel === "options"}
  card={<FilesCard config={config} entries={entries} onRemove={removeEntry} onMove={moveEntry} onAdd={() => addFilesFromPicker(addFiles)} />}
/>

                <div className="layout-2col">
                  <div className={`card card-pad ${focusPanel === "options" ? "tour-highlight" : ""}`} id="options-card">
                    <h3 className="section-title mb-2">{t.optionsTitle}</h3>
                    {config.renderOptions({ options, setOptions, files: entries })}
                    <div className="toolbar-zone">
                      <button className="btn btn-primary btn-lg" onClick={run} disabled={busy || !entries.length}>
                        <Download size={18} /> {primaryLabel}
                      </button>
                      <button className="btn btn-ghost" onClick={reset} disabled={busy}>
                        <RefreshCw size={16} /> {t.againShort}
                      </button>
                    </div>
                    <div className="mt-1 muted" style={{ fontSize: 13 }}>
                      {filesLabel} · {formatBytes(entries.reduce((a, e) => a + e.size, 0))}
                    </div>
                  </div>

                  <div className={`card card-pad ${focusPanel === "preview" ? "tour-highlight" : ""}`} id="preview-card">
                    <h3 className="section-title mb-2">{t.previewTitle}</h3>
                    {config.renderPreview({ options, setOptions, files: entries, setFiles: setEntries as never })}
                  </div>
                </div>

                {error && (
                  <div className="mt-3">
                    <ErrorAlert
                      title={error.title}
                      body={error.body}
                      retry={error.code !== "scan" ? run : undefined}
                    />
                  </div>
                )}

                <PrivacyNote />
              </div>
            )}

            {phase === "working" && (
              <div className="card proc-card">
                <div className="proc-spinner">
                  <Loader2 />
                </div>
                <div className="proc-title">{t.workingTitle}</div>
                <div className="proc-msg">
                  {progress?.message
                    ? progress.message
                    : progress && progress.total > 0
                      ? t.workingTpl.replace("{i}", String(progress.current)).replace("{n}", String(progress.total))
                      : t.workingPrep}
                </div>
                <div className="progress-track">
                  {progress && progress.total > 0 && progress.current > 0 ? (
                    <div className="progress-fill" style={{ width: `${Math.min(100, Math.round((progress.current / progress.total) * 100))}%` }} />
                  ) : (
                    <div className="progress-fill indet" />
                  )}
                </div>
                <div className="proc-meta">
                  {t.privacyShort} — file tidak diunggah ke server.
                </div>
              </div>
            )}

            {phase === "done" && outputs && (
              <ResultCard
                config={config}
                outputs={outputs}
                onReset={reset}
                entries={entries}
              />
            )}
          </>
        )}

        {phase === "select" && <PrivacyNote />}
      </div>
    </div>
  );
}

function addFilesFromPicker(addFiles: (files: File[], source?: "pick" | "demo") => Promise<void>) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".pdf,application/pdf";
  input.multiple = true;
  input.onchange = () => {
    const files = Array.from(input.files ?? []);
    if (files.length) void addFiles(files, "pick");
  };
  input.click();
}

const DEMO_OUTPUTS = (): OutputFile[] => [
  { name: "dokumen-contoh-01.jpg", kind: "image/jpeg", blob: new Blob(["demo"], { type: "image/jpeg" }) },
  { name: "dokumen-contoh-02.jpg", kind: "image/jpeg", blob: new Blob(["demo"], { type: "image/jpeg" }) },
];

function DropZoneContainer({
  active,
  addFiles,
  invalid,
  texts,
  config,
}: {
  active: boolean;
  addFiles: (f: File[], source?: "pick" | "demo") => Promise<void>;
  invalid: string | null;
  texts: import("./config/texts").Texts;
  config: AppConfig;
}) {
  const [drag, setDrag] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!active) return;
    if (invalid) {
      setFlash(invalid);
      const t = setTimeout(() => setFlash(null), 2400);
      return () => clearTimeout(t);
    }
  }, [invalid, active]);

  const handle = (files: File[]) => {
    const hasPdf = files.some((f) => /\.pdf$/i.test(f.name) || f.type === "application/pdf");
    if (!hasPdf) {
      setFlash("Format file tidak didukung. Gunakan berkas PDF.");
      return;
    }
    void addFiles(files, "pick");
  };

  const cls = ["dropzone"];
  if (drag) cls.push("dragover");
  if (flash) cls.push("dz-invalid");

  return (
    <div
      className={cls.join(" ")}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }} 
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files.length) handle(Array.from(e.dataTransfer.files)); }}
      onClick={() => (active ? inputRef.current?.click() : undefined)}
      role="button"
      aria-hidden={!active}
      tabIndex={active ? 0 : -1}
      style={{ opacity: active ? 1 : 0.35, transition: "opacity .2s" }}
    >
      <input
        ref={inputRef}
        id="dz-input"
        type="file"
        accept=".pdf,application/pdf"
        multiple={!config.single}
        hidden
        onChange={(e) => {
          const fs = Array.from(e.target.files ?? []);
          if (fs.length) handle(fs);
          e.currentTarget.value = "";
        }}
      />
      <div className="dz-icon">
        <UploadCloud />
      </div>
      <div className="dz-title">{drag ? "Release to add files" : texts.dropTitle}</div>
      <div className="dz-sub">{flash ?? (drag ? "Lepaskan untuk menambahkan" : texts.dropSub)}</div>
      <div className="dz-actions">
        <button
          className="btn btn-primary"
          onClick={(e) => {
            e.stopPropagation();
            if (active) inputRef.current?.click();
          }}
          tabIndex={active ? 0 : -1}
        >
          <Files size={17} /> {texts.pick}
        </button>
      </div>
    </div>
  );
}

function Wi({ show, card }: { show: boolean; card: React.ReactElement }) {
  return <div className={show ? "tour-highlight" : ""}>{card}</div>;
}

function FilesCard({
  config,
  entries,
  onRemove,
  onMove,
  onAdd,
}: {
  config: AppConfig;
  entries: DemoEntry[];
  onRemove: (id: string) => void;
  onMove: (from: number, to: number) => void;
  onAdd: () => void;
}) {
  return (
    <div className="card card-pad">
      <h3 className="section-title mb-2">{config.texts.filesTitle}</h3>
      <div className="filelist">
        {entries.map((e, i) => (
          <FileRow
            key={e.id}
            entry={e}
            index={i}
            total={entries.length}
            reorderable={!config.single}
            draggable={!config.single}
            onRemove={onRemove}
            onMove={onMove}
          />
        ))}
        {!config.single && (
          <button className="btn btn-outline" onClick={onAdd}>
            <Files size={16} /> {config.texts.addMore}
          </button>
        )}
      </div>
    </div>
  );
}

function ResultCard({
  config,
  outputs,
  onReset,
  entries,
}: {
  config: AppConfig;
  outputs: OutputFile[];
  onReset: () => void;
  entries: DemoEntry[];
}) {
  const [zipping, setZipping] = useState(false);
  const t = config.texts;

  const downloadAll = async () => {
    setZipping(true);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      for (const o of outputs) zip.file(o.name, o.blob);
      const blob = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = t.zipName;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    } finally {
      setZipping(false);
    }
  };

  const downloadOne = (o: OutputFile) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(o.blob);
    a.download = o.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  };

  return (
    <div className="card result-card">
      <div className="result-check">
        <CheckCircle2 />
      </div>
      <div className="result-title">{t.doneTitle}</div>
      <div className="result-sub">{t.doneSub}</div>

      <div className="outlist">
        {outputs.map((o, i) => (
          <div className="outrow" key={`${o.name}-${i}`}>
            <span className="out-ico">
              <FileText size={17} />
            </span>
            <div style={{ minWidth: 0 }}>
              <div className="out-name">{o.name}</div>
              <div className="out-size">
                {formatBytes(o.blob.size)} · {t.outputKind}
              </div>
            </div>
            <button className="btn btn-soft btn-sm" onClick={() => downloadOne(o)}>
              <Download size={15} /> Download
            </button>
          </div>
        ))}
      </div>

      {outputs.length > 1 && (
        <div className="result-actions">
          <button className="btn btn-primary" onClick={downloadAll} disabled={zipping}>
            <Download size={17} /> {zipping ? "Membuat ZIP..." : `${t.downloadAll} (.zip)`}
          </button>
        </div>
      )}

      <div className="result-actions">
        <button className="btn btn-outline" onClick={onReset}>
          <RefreshCw size={16} /> {t.again}
        </button>
        {entries.length > 0 && (
          <span className="muted" style={{ fontSize: 12.5, alignSelf: "center" }}>
            {entries[0].name}
          </span>
        )}
      </div>
    </div>
  );
}