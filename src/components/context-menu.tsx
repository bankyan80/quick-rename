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
import { useTranslations } from "next-intl";
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
  const t = useTranslations("contextMenu");
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
    { label: t("addPrefix"), icon: Type, action: () => onRenameRequest("prefix"), disabled: !hasSelection },
    { label: t("addSuffix"), icon: Type, action: () => onRenameRequest("suffix"), disabled: !hasSelection },
    { label: t("applyPattern"), icon: Braces, action: () => onRenameRequest("pattern"), disabled: !hasSelection },
    { label: t("findReplace"), icon: Replace, action: () => onRenameRequest("find-replace"), disabled: !hasSelection },
    { label: t("numbering"), icon: Hash, action: () => onRenameRequest("numbering"), disabled: !hasSelection },
    { label: t("removeText"), icon: Eraser, action: () => onRenameRequest("remove"), disabled: !hasSelection },
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
        {hasSelection ? t("deselectAll") : t("selectAll")}
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
        {t("applyPattern")}
      </button>
    </div>
  );
}