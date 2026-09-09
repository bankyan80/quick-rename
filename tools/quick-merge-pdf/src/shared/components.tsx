import React, { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Cloud,
  File,
  FileText,
  Files,
  GripVertical,
  Home,
  Image as ImageIcon,
  Info,
  Loader2,
  LockKeyhole,
  Moon,
  Plus,
  Presentation,
  RefreshCw,
  Ruler,
  ShieldCheck,
  Sparkles,
  Sun,
  Table,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import type { Meta } from "../config/meta";
import type { ToolLink } from "../config/tools";
import { formatBytes } from "./toolkit";
import type { ThemeController } from "./theme";

/* ---------------- app icon map ---------------- */

const ICONS: Record<string, React.ComponentType<{ size?: number | string; className?: string }>> = {
  image: ImageIcon,
  word: FileText,
  excel: Table,
  ppt: Presentation,
  merge: Files,
  resize: Ruler,
  rename: RefreshCw,
};

export function AppIcon({ icon, size, className }: { icon: string; size?: number | string; className?: string }) {
  const C = ICONS[icon] ?? File;
  return <C size={size} className={className} />;
}

/* ---------------- brand ---------------- */

export function BrandTile({
  icon,
  size,
  className,
}: {
  icon: string;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <span className={`brand-tile ${size === "sm" ? "" : ""} ${className ?? ""}`}>
      <AppIcon icon={icon} size={size === "sm" ? 17 : 22} />
    </span>
  );
}

/* ---------------- quick tools menu ---------------- */

export function QuickToolsMenu({ current, tools }: { current: string; tools: ToolLink[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="qmenu" ref={ref}>
      <button
        className={`btn btn-outline btn-sm ${open ? "" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <AppIcon icon="rename" size={16} /> Quick Tools
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="qmenu-panel" role="menu">
          <div className="qmenu-head">Quick Tools</div>
          {tools.map((t) => {
            const isCurrent = t.slug === current;
            return (
              <a
                key={t.slug}
                href={isCurrent ? undefined : t.url}
                role="menuitem"
                aria-current={isCurrent ? "page" : undefined}
                onClick={isCurrent ? (e) => e.preventDefault() : undefined}
                className={`qmenu-item ${isCurrent ? "active" : ""}`}
                target={t.external ? "_blank" : undefined}
                rel={t.external ? "noreferrer" : undefined}
              >
                <span className="mi-ico">
                  <AppIcon icon={t.icon} size={16} />
                </span>
                {t.label}
                {isCurrent && <span className="mi-tag">Aktif</span>}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------------- header / footer ---------------- */

export function Header({
  meta,
  tools,
  theme,
  onHelp,
}: {
  meta: Meta;
  tools: ToolLink[];
  theme: ThemeController;
  onHelp: () => void;
}) {
  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <a className="brand" href="./" title={meta.name}>
          <BrandTile icon={meta.icon} />
          <span>
            <span className="brand-name">{meta.short}</span>
            <span className="brand-sub">Quick Tools — Desktop PDF Utilities</span>
          </span>
        </a>
        <div className="topbar-right">
          <QuickToolsMenu current={meta.slug} tools={tools} />
          <button className="iconbtn" onClick={onHelp} title="Tutorial" aria-label="Tutorial">
            <CircleHelp />
          </button>
          <button className="iconbtn" onClick={theme.toggle} title="Ganti tema" aria-label="Ganti tema">
            {theme.theme === "dark" ? <Sun /> : <Moon />}
          </button>
        </div>
      </div>
    </header>
  );
}

export function Footer({ meta, onHelp, onPrivacy, onTerms }: { meta: Meta; onHelp: () => void; onPrivacy: () => void; onTerms: () => void }) {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <BrandTile icon={meta.icon} size="sm" />
        <span className="muted" style={{ fontSize: 13 }}>{meta.name} · Quick Tools</span>
        <div className="footer-links">
          <button className="footer-link" onClick={onHelp}>Tutorial</button>
          <button className="footer-link" onClick={onPrivacy}>Privasi</button>
          <button className="footer-link" onClick={onTerms}>Ketentuan</button>
          <a className="footer-link" href="https://quick-rename.vercel.app" target="_blank" rel="noreferrer">
            <Home size={14} style={{ verticalAlign: -2, marginRight: 5 }} />
            Quick Rename
          </a>
        </div>
      </div>
    </footer>
  );
}

/* ---------------- stepper ---------------- */

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="stepper" role="list" aria-label="Langkah">
      {steps.map((label, i) => {
        const state = i === current ? "step-active" : i < current ? "done" : "";
        return (
          <div className={`step ${state}`} role="listitem" key={label}>
            <span className="step-n">{i < current ? <Check size={14} /> : i + 1}</span>
            <span className="step-label">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- drop zone ---------------- */

export function DropZone({
  onFiles,
  accept,
  multiple,
  title,
  sub,
  actionLabel,
  invalid,
}: {
  onFiles: (files: File[]) => void;
  accept: string;
  multiple?: boolean;
  title: string;
  sub: string;
  actionLabel: string;
  invalid?: string | null;
}) {
  const [drag, setDrag] = useState(false);
  const [flashInvalid, setFlashInvalid] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (invalid) {
      setFlashInvalid(invalid);
      const t = setTimeout(() => setFlashInvalid(null), 2200);
      return () => clearTimeout(t);
    }
  }, [invalid]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const files = Array.from(e.dataTransfer.files ?? []);
    if (files.length) onFiles(files);
  };

  const cls = ["dropzone"];
  if (drag) cls.push("dragover");
  if (flashInvalid) cls.push("dz-invalid");

  return (
    <div
      className={cls.join(" ")}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      aria-label={title}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) onFiles(files);
          e.currentTarget.value = "";
        }}
      />
      <div className="dz-icon">
        <UploadCloud />
      </div>
      <div className="dz-title">{drag ? "Release to add files" : title}</div>
      <div className="dz-sub">{flashInvalid ?? (drag ? "Lepaskan untuk menambahkan" : sub)}</div>
      <div className="dz-actions">
        <button
          className="btn btn-primary"
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
        >
          <Plus size={17} /> {actionLabel}
        </button>
      </div>
    </div>
  );
}

/* ---------------- file row ---------------- */

export type DemoEntry = {
  id: string;
  file: File;
  name: string;
  size: number;
  pages?: number;
  scanned?: boolean;
  status?: "ok" | "scan" | "error";
};

export function FileRow({
  entry,
  index,
  total,
  reorderable,
  draggable,
  onRemove,
  onMove,
}: {
  entry: DemoEntry;
  index: number;
  total: number;
  reorderable?: boolean;
  draggable?: boolean;
  onRemove?: (id: string) => void;
  onMove?: (from: number, to: number) => void;
}) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      className={`filerow ${dragOver ? "drop-target" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (!draggable || !onMove) return;
        const from = Number(e.dataTransfer.getData("text/plain"));
        if (!Number.isFinite(from)) return;
        onMove(from, index);
      }}
    >
      {reorderable && (
        <span
          className="drag-handle"
          draggable={draggable}
          title="Seret untuk mengurutkan"
          onDragStart={(e) => e.dataTransfer.setData("text/plain", String(index))}
        >
          <GripVertical />
        </span>
      )}
      <span className="file-ico">
        <FileText />
      </span>
      <div style={{ minWidth: 0 }}>
        <div className="file-name">{entry.name}</div>
        <div className="file-meta">
          <span>{formatBytes(entry.size)}</span>
          {entry.pages != null && (
            <>
              <span className="dot">·</span>
              <span>{entry.pages} halaman</span>
            </>
          )}
          {entry.scanned != null && (
            <span className={`file-badge ${entry.scanned ? "scan" : "ok"}`}>{entry.scanned ? "Scan/teks tidak terdeteksi" : "Teks tersedia"}</span>
          )}
        </div>
      </div>
      <div className="file-actions">
        {reorderable && index > 0 && (
          <button className="iconbtn" title="Naik" onClick={() => onMove?.(index, index - 1)} style={{ width: 32, height: 32 }}>
            <ChevronLeft style={{ transform: "rotate(90deg)" }} />
          </button>
        )}
        {reorderable && index < total - 1 && (
          <button className="iconbtn" title="Turun" onClick={() => onMove?.(index, index + 1)} style={{ width: 32, height: 32 }}>
            <ChevronRight style={{ transform: "rotate(90deg)" }} />
          </button>
        )}
        {onRemove && (
          <button className="iconbtn" title="Hapus dari daftar" onClick={() => onRemove(entry.id)} style={{ width: 32, height: 32 }}>
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------------- modal ---------------- */

export function Modal({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="iconbtn" onClick={onClose} aria-label="Tutup">
            <X />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

/* ---------------- tutorial ---------------- */

export function TutorialModal({
  steps,
  onClose,
}: {
  steps: Array<{ img?: string; title: string; body: string }>;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const step = steps[idx];
  return (
    <Modal
      title="Tutorial"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={() => setIdx(0)} disabled={idx === 0}>
            Awal
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0}>
            <ChevronLeft size={15} /> Kembali
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => setIdx((i) => Math.min(steps.length - 1, i + 1))} disabled={idx === steps.length - 1}>
            Lanjut <ChevronRight size={15} />
          </button>
        </>
      }
    >
      <div className="tut-step">
        <div className="tut-img">
          {step.img ? <img src={step.img} alt={`Langkah ${idx + 1}: ${step.title}`} width={1600} height={900} /> : <div style={{ height: 180 }} />}
        </div>
        <div className="tut-desc">
          <span className="tag">
            {idx + 1} / {steps.length}
          </span>
          <h3 className="mt-2">{step.title}</h3>
          <p>{step.body}</p>
        </div>
      </div>
      <div className="tut-dots">
        {steps.map((_, i) => (
          <button key={i} className={i === idx ? "on" : ""} onClick={() => setIdx(i)} aria-label={`Langkah ${i + 1}`} />
        ))}
      </div>
    </Modal>
  );
}

/* ---------------- legal modals ---------------- */

export function PrivacyModal({ onClose, local = true }: { onClose: () => void; local?: boolean }) {
  return (
    <Modal title="Kebijakan Privasi" onClose={onClose}>
      <div className="stack">
        <div className="alert alert-info">
          <ShieldCheck />
          <div>
            <div className="alert-title">{local ? "File diproses langsung di perangkat Anda." : "File Anda diproses sementara di server untuk menyelesaikan konversi dan akan dihapus setelah proses selesai."}</div>
            <div className="alert-body">
              {local
                ? "Dokumen tidak pernah diunggah, disimpan, atau dikirim ke server mana pun. Semua konversi berjalan di browser Anda."
                : "Dokumen hanya digunakan sesaat untuk konversi dan dihapus secara otomatis setelah selesai."}
            </div>
          </div>
        </div>
        <p className="muted" style={{ fontSize: 13.5 }}>
          Quick Tools tidak menjual, berbagi, atau menggunakan isi dokumen Anda untuk tujuan lain. Kami tidak pernah menyimpan berkas pengguna secara permanen.
        </p>
      </div>
    </Modal>
  );
}

export function TermsModal({ onClose, meta }: { onClose: () => void; meta: Meta }) {
  return (
    <Modal title="Ketentuan Layanan" onClose={onClose}>
      <div className="stack">
        <p>
          <strong>{meta.name}</strong> adalah alat konversi PDF desktop yang diproses di perangkat Anda. Dengan menggunakan alat ini, Anda menyetujui
          ketentuan berikut.
        </p>
        <ul style={{ margin: 0, paddingLeft: 20, color: "var(--text-2)", display: "grid", gap: 6 }}>
          <li>Hasil konversi bergantung pada kualitas berkas PDF sumber.</li>
          <li>Kami tidak menjamin format dokumen akan terawet sempurna.</li>
          <li>Dokumen scan mungkin tidak menghasilkan teks yang dapat diedit secara otomatis.</li>
          <li>Anda bertanggung jawab atas legalitas berkas yang diproses.</li>
          <li>Layanan disediakan "apa adanya" tanpa jaminan tertentu.</li>
        </ul>
      </div>
    </Modal>
  );
}

/* ---------------- misc atoms ---------------- */

export function ErrorAlert({ title, body, retry }: { title: string; body?: string; retry?: () => void }) {
  return (
    <div className="alert alert-error">
      <AlertTriangle />
      <div>
        <div className="alert-title">{title}</div>
        {body && <div className="alert-body">{body}</div>}
        {retry && (
          <button className="btn btn-outline btn-sm mt-2" onClick={retry}>
            <RefreshCw size={14} /> Coba Lagi
          </button>
        )}
      </div>
    </div>
  );
}

export function InfoNote({ icon = "info", title, children }: { icon?: "info" | "lock" | "cloud"; title: string; children?: React.ReactNode }) {
  const IconC = icon === "lock" ? LockKeyhole : icon === "cloud" ? Cloud : Info;
  return (
    <div className="alert alert-info">
      <IconC />
      <div>
        <div className="alert-title">{title}</div>
        {children && <div className="alert-body">{children}</div>}
      </div>
    </div>
  );
}

export function SectionTitle({ icon, children }: { icon?: string; children: React.ReactNode }) {
  return (
    <h3 className="section-title">
      {icon && <AppIcon icon={icon} />}
      {children}
    </h3>
  );
}

export function Spinner({ size = 30 }: { size?: number }) {
  return <Loader2 size={size} style={{ animation: "spin 1s linear infinite" }} />;
}

export function PrivacyNote() {
  return (
    <div className="privacy-note">
      <ShieldCheck />
      <span>
        <strong>File diproses langsung di perangkat Anda.</strong> Dokumen tidak diunggah ke server mana pun.
      </span>
    </div>
  );
}

export function LogoMark({ icon }: { icon: string }) {
  return (
    <span className="brand-tile">
      <AppIcon icon={icon} />
    </span>
  );
}

export { Sparkles, UploadCloud };