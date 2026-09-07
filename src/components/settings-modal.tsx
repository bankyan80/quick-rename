"use client";

import { useAppStore } from "@/store/use-store";
import {
  X,
  Monitor,
  Info,
  ShieldCheck,
  FileText,
  Rows3,
  CheckSquare,
} from "lucide-react";

export default function SettingsModal() {
  const setShowSettings = useAppStore((s) => s.setShowSettings);
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const density = useAppStore((s) => s.density);
  const setDensity = useAppStore((s) => s.setDensity);
  const conflictResolution = useAppStore((s) => s.conflictResolution);
  const setConflictResolution = useAppStore((s) => s.setConflictResolution);
  const confirmBeforeRename = useAppStore((s) => s.confirmBeforeRename);
  const setConfirmBeforeRename = useAppStore((s) => s.setConfirmBeforeRename);
  const preserveExtensions = useAppStore((s) => s.preserveExtensions);
  const setPreserveExtensions = useAppStore((s) => s.setPreserveExtensions);

  return (
    <div className="modal-overlay" onClick={() => setShowSettings(false)}>
      <div
        className="modal w-full max-w-md p-5"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Pengaturan"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-semibold">Pengaturan</h2>
          <button
            className="toolbar-button !p-1"
            onClick={() => setShowSettings(false)}
            aria-label="Tutup pengaturan"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Monitor size={14} className="text-primary" />
              <label className="label !mb-0">Tampilan</label>
            </div>
            <div className="flex gap-2">
              {(
                [
                  ["dark", "Gelap"],
                  ["light", "Terang"],
                  ["system", "Sistem"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  className={`btn flex-1 ${theme === value ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setTheme(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Rows3 size={14} className="text-primary" />
              <label className="label !mb-0">Kerapatan Daftar File</label>
            </div>
            <div className="flex gap-2">
              {(
                [
                  ["comfortable", "Nyaman"],
                  ["compact", "Padat"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  className={`btn flex-1 ${density === value ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setDensity(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Info size={14} className="text-primary" />
              <label className="label !mb-0">Penanganan Konflik</label>
            </div>
            <select
              className="select"
              value={conflictResolution}
              onChange={(e) =>
                setConflictResolution(e.target.value as typeof conflictResolution)
              }
            >
              <option value="auto-resolve">Selesaikan otomatis (mis. file (1).png)</option>
              <option value="skip">Lewati konflik</option>
              <option value="cancel">Batalkan seluruh operasi saat konflik</option>
            </select>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText size={14} className="text-primary" />
              <label className="label !mb-0">Perilaku File</label>
            </div>
            <label className="flex items-center gap-2 text-[12px] text-text-secondary cursor-pointer py-1">
              <input
                type="checkbox"
                checked={preserveExtensions}
                onChange={(e) => setPreserveExtensions(e.target.checked)}
                className="h-4 w-4"
              />
              Pertahankan ekstensi file secara otomatis
            </label>
            <p className="text-[12px] text-text-muted">
              Ekstensi selalu dipertahankan secara default. Untuk mengubah
              ekstensi, gunakan mode Pola dengan variabel{" "}
              <code className="rounded bg-card px-1">{`{ext}`}</code> atau
              nonaktifkan opsi ini.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckSquare size={14} className="text-primary" />
              <label className="label !mb-0">Konfirmasi</label>
            </div>
            <label className="flex items-center gap-2 text-[12px] text-text-secondary cursor-pointer py-1">
              <input
                type="checkbox"
                checked={confirmBeforeRename}
                onChange={(e) => setConfirmBeforeRename(e.target.checked)}
                className="h-4 w-4"
              />
              Minta konfirmasi sebelum mengubah nama
            </label>
          </div>

          <div className="rounded border border-success-soft bg-success-soft p-3">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={14} className="text-success" />
              <span className="text-[12px] font-medium text-success">
                Privasi
              </span>
            </div>
            <p className="text-[12px] text-text-secondary leading-snug">
              File Anda diproses secara lokal di peramban. Quick Rename tidak
              pernah mengunggah atau menyimpan isi file Anda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}