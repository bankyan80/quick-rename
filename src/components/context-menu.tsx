"use client";

import { useEffect, useRef } from "react";
import {
  Type,
  Braces,
  Replace,
  Hash,
  Eraser,
  CheckSquare,
  Square,
  Wand2,
} from "lucide-react";
import { useAppStore } from "@/store/use-store";
import type { RenameMode } from "@/types";

interface ContextMenuProps {
  x: number;
  y: number;
  fileId: string | null;
  onClose: () => void;
  onRenameRequest: (mode: RenameMode) => void;
}

export default function ContextMenu({
  x,
  y,
  onClose,
  onRenameRequest,
}: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const hasSelection = useAppStore((s) => s.selectedCount > 0);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  const menuStyle = {
    top: Math.min(y, window.innerHeight - 260),
    left: Math.min(x, window.innerWidth - 230),
  };

  const items = [
    { label: "Tambah Awalan", icon: Type, action: () => onRenameRequest("prefix"), disabled: !hasSelection },
    { label: "Tambah Akhiran", icon: Type, action: () => onRenameRequest("suffix"), disabled: !hasSelection },
    { label: "Ubah dengan Pola", icon: Braces, action: () => onRenameRequest("pattern"), disabled: !hasSelection },
    { label: "Temukan & Ganti", icon: Replace, action: () => onRenameRequest("find-replace"), disabled: !hasSelection },
    { label: "Penomoran", icon: Hash, action: () => onRenameRequest("numbering"), disabled: !hasSelection },
    { label: "Hapus Teks", icon: Eraser, action: () => onRenameRequest("remove"), disabled: !hasSelection },
  ];

  return (
    <div ref={ref} className="menu" style={menuStyle} role="menu">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.label}
            className="menu-item"
            role="menuitem"
            disabled={item.disabled}
            onClick={() => {
              if (!item.disabled) item.action();
              onClose();
            }}
          >
            <Icon size={14} />
            {item.label}
          </button>
        );
      })}
      <div className="menu-separator" />
      <button
        className="menu-item"
        role="menuitem"
        onClick={() => {
          const s = useAppStore.getState();
          if (s.selectedCount > 0) s.deselectAllFiles();
          else s.selectAllFiles();
          onClose();
        }}
      >
        {hasSelection ? <Square size={14} /> : <CheckSquare size={14} />}
        {hasSelection ? "Batalkan Semua Pilihan" : "Pilih Semua"}
      </button>
      <button
        className="menu-item"
        role="menuitem"
        onClick={() => {
          onRenameRequest("pattern");
          onClose();
        }}
      >
        <Wand2 size={14} />
        Ubah dengan Pola
      </button>
    </div>
  );
}