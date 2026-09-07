"use client";

import { useAppStore } from "@/store/use-store";
import { Zap, Shield, Lock, History, Wifi } from "lucide-react";

export default function BottomBar() {
  const selectedCount = useAppStore((s) => s.selectedCount);
  const totalCount = useAppStore((s) => s.files.length);
  const quota = useAppStore((s) => s.quota);
  const isRenaming = useAppStore((s) => s.isRenaming);
  const renameProgress = useAppStore((s) => s.renameProgress);
  const hasFolderPermission = useAppStore((s) => s.hasPermission);
  const user = useAppStore((s) => s.user);
  const setShowHistory = useAppStore((s) => s.setShowHistory);

  const handleSelectFiles = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.onchange = async () => {
      if (input.files) {
        const { createFilesFromInput } = await import("@/lib/file-system");
        const newFiles = createFilesFromInput(input.files);
        const state = useAppStore.getState();
        const existingKeys = new Set(state.files.map((f) => f.name + f.extension));
        const merged = [...state.files];
        for (const f of newFiles) {
          if (!existingKeys.has(f.name + f.extension)) {
            merged.push(f);
            existingKeys.add(f.name + f.extension);
          }
        }
        state.setFiles(merged);
      }
    };
    input.click();
  };

  const quotaLabel = user
    ? quota.remaining > 10
      ? `TOKEN · sisa ${quota.remaining} file`
      : `GOOGLE · sisa ${quota.remaining} file`
    : `GRATIS · sisa ${quota.remaining} file`;

  return (
    <div className="flex h-9 shrink-0 items-center gap-3 border-t border-border bg-panel px-3">
      {hasFolderPermission ? (
        <span className="flex items-center gap-1.5 text-[11px] text-text-muted">
          <Shield size={12} className="text-success" />
          Akses folder aktif
        </span>
      ) : (
        <button
          className="flex items-center gap-1.5 text-[11px] text-warning hover:text-warning cursor-pointer"
          onClick={handleSelectFiles}
          title="Akses folder tidak tersedia. File akan diubah namanya melalui ZIP."
        >
          <Wifi size={12} />
          Mode cadangan — pilih file
        </button>
      )}

      <div className="flex-1" />

      <span className="flex items-center gap-1.5 text-[11px] text-text-muted">
        <Zap size={12} className="text-primary" />
        {quotaLabel}
      </span>

      {isRenaming && (
        <span className="flex items-center gap-1.5 text-[11px] text-text-secondary">
          Mengubah nama {renameProgress.processed} / {renameProgress.total}
        </span>
      )}

      <span className="text-[11px] text-text-muted">
        {selectedCount} / {totalCount} dipilih
      </span>

      <button
        className="text-[11px] text-text-muted hover:text-text-primary transition-colors flex items-center gap-1.5"
        onClick={() => setShowHistory(true)}
        title="Lihat riwayat penggantian nama"
      >
        <History size={12} />
        Riwayat
      </button>

      <span className="flex items-center gap-1.5 text-[11px] text-text-muted" title="Privasi: file tetap di perangkat Anda">
        <Lock size={12} />
        File tetap di perangkat Anda
      </span>
    </div>
  );
}