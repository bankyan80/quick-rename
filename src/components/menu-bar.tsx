"use client";

import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/store/use-store";
import {
  FolderOpen,
  Files,
  Zap,
  Undo2,
  History,
  HelpCircle,
  Shield,
  LogIn,
  Settings2,
  Search,
  User,
} from "lucide-react";
import { signIn } from "next-auth/react";
import { isFileSystemAccessSupported, openDirectory } from "@/lib/file-system";

interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  action: () => void;
  disabled?: boolean;
  separator?: boolean;
}

export default function MenuBar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const setFiles = useAppStore((s) => s.setFiles);
  const setFolderHandle = useAppStore((s) => s.setFolderHandle);
  const clearFiles = useAppStore((s) => s.clearFiles);
  const setShowSettings = useAppStore((s) => s.setShowSettings);
  const setShowHistory = useAppStore((s) => s.setShowHistory);
  const setShowHelp = useAppStore((s) => s.setShowHelp);
  const setShowPayment = useAppStore((s) => s.setShowPayment);
  const setShowAdmin = useAppStore((s) => s.setShowAdmin);
  const setShowProfile = useAppStore((s) => s.setShowProfile);
  const setRule = useAppStore((s) => s.setRule);
  const toggleRenamePanel = useAppStore((s) => s.toggleRenamePanel);
  const lastOperation = useAppStore((s) => s.lastOperation);
  const setRenaming = useAppStore((s) => s.setRenaming);
  const setRenameProgress = useAppStore((s) => s.setRenameProgress);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);
  const files = useAppStore((s) => s.files);

  const handleOpenFolder = async () => {
    try {
      if (!isFileSystemAccessSupported()) {
        alert(
          "Peramban Anda tidak mendukung API File System Access. Gunakan opsi 'Pilih File' sebagai gantinya."
        );
        return;
      }

      const result = await openDirectory();
      if (result) {
        setFiles(result.files);
        setFolderHandle(result.handle, result.handle.name);
      }
    } catch {
      alert(
        "Tidak dapat membuka folder. Periksa izin akses atau coba lagi."
      );
    }
  };

  const handleSelectFiles = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.onchange = async () => {
      if (input.files) {
        try {
          const { createFilesFromInput } = await import("@/lib/file-system");
          const newFiles = createFilesFromInput(input.files);
          const existing = useAppStore.getState().files;
          const existingKeys = new Set(
            existing.map((f) => f.name + f.extension)
          );
          const merged = [...existing];
          for (const f of newFiles) {
            if (!existingKeys.has(f.name + f.extension)) {
              merged.push(f);
              existingKeys.add(f.name + f.extension);
            }
          }
          setFiles(merged);
        } catch (e) {
          console.error(e);
        }
      }
    };
    input.click();
  };

  const handleClearAll = () => {
    clearFiles();
  };

  const handleUndo = () => {
    const state = useAppStore.getState();
    const op = state.lastOperation;
    if (!op) return;
    const folderHandle = state.folderHandle;
    if (!folderHandle) return;

    const undoResults = op.results.filter((r) => r.success);

    (async () => {
      setRenaming(true);
      setRenameProgress({
        total: undoResults.length,
        processed: 0,
        successful: 0,
        failed: 0,
      });

      let success = 0;
      let failed = 0;
      let processed = 0;

      for (const result of undoResults) {
        try {
          const { renameFile } = await import("@/lib/file-system");
          const ok = await renameFile(
            folderHandle,
            result.newName,
            result.originalName
          );
          if (ok) success++;
          else failed++;
        } catch {
          failed++;
        }
        processed++;
        setRenameProgress({ total: undoResults.length, processed, successful: success, failed });
      }

      setRenameProgress({ total: undoResults.length, processed, successful: success, failed });
      setRenaming(false);

      const { refreshFileHandles } = useAppStore.getState();
      await refreshFileHandles();
    })();
  };

  const menuItems: Record<string, MenuItem[]> = {
    file: [
      {
        label: "Buka Folder",
        icon: <FolderOpen size={14} />,
        action: handleOpenFolder,
      },
      {
        label: "Pilih File",
        icon: <Files size={14} />,
        action: handleSelectFiles,
      },
      { label: "", icon: <></>, action: () => {}, separator: true },
      {
        label: "Bersihkan Semua",
        icon: <Files size={14} />,
        action: handleClearAll,
        disabled: files.length === 0,
      },
    ],
    rename: [
      {
        label: "Ubah Nama dengan Awalan",
        icon: <Zap size={14} />,
        action: () => {
          setRule({ mode: "prefix" });
          toggleRenamePanel();
        },
      },
      {
        label: "Ubah Nama dengan Akhiran",
        icon: <Zap size={14} />,
        action: () => {
          setRule({ mode: "suffix" });
          toggleRenamePanel();
        },
      },
      {
        label: "Temukan & Ganti",
        icon: <Search size={14} />,
        action: () => {
          setRule({ mode: "find-replace" });
          toggleRenamePanel();
        },
      },
      {
        label: "Penomoran",
        icon: <Zap size={14} />,
        action: () => {
          setRule({ mode: "numbering" });
          toggleRenamePanel();
        },
      },
      {
        label: "Konversi Huruf",
        icon: <Zap size={14} />,
        action: () => {
          setRule({ mode: "case" });
          toggleRenamePanel();
        },
      },
      {
        label: "Pola",
        icon: <Zap size={14} />,
        action: () => {
          setRule({ mode: "pattern" });
          toggleRenamePanel();
        },
      },
    ],
    tools: [
      {
        label: "Urungkan Penggantian Terakhir",
        icon: <Undo2 size={14} />,
        action: handleUndo,
        disabled: !lastOperation || files.length === 0,
      },
      {
        label: "Riwayat Penggantian",
        icon: <History size={14} />,
        action: () => setShowHistory(true),
      },
      {
        label: "Beli Token",
        icon: <Zap size={14} />,
        action: () => setShowPayment(true),
      },
      {
        label: "Pengaturan",
        icon: <Settings2 size={14} />,
        action: () => setShowSettings(true),
      },
      { label: "", icon: <></>, action: () => {}, separator: true },
      {
        label: "Panel Admin",
        icon: <Shield size={14} />,
        action: () => setShowAdmin(true),
      },
    ],
    view: [
      {
        label: "Tampilkan/Sembunyikan Panel",
        icon: <Settings2 size={14} />,
        action: toggleRenamePanel,
      },
      {
        label: "Cari File",
        icon: <Search size={14} />,
        action: () => setSearchQuery(""),
      },
    ],
    help: [
      {
        label: "Bantuan Quick Rename",
        icon: <HelpCircle size={14} />,
        action: () => setShowHelp(true),
      },
      {
        label: "Profil Akun",
        icon: <User size={14} />,
        action: () => setShowProfile(true),
      },
    ],
  };

  const menuLabels: Record<string, string> = {
    file: "File",
    rename: "Ubah Nama",
    tools: "Alat",
    view: "Tampilan",
    help: "Bantuan",
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuAction = (items: MenuItem[], item: MenuItem) => {
    if (item.separator || item.disabled) return;
    item.action();
    setOpenMenu(null);
  };

  return (
    <div
      ref={menuRef}
      className="relative flex h-9 shrink-0 items-center gap-0.5 border-b border-border bg-panel px-2"
    >
      {Object.keys(menuItems).map((key) => (
        <div key={key} className="relative">
          <button
            className={`toolbar-button !py-1.5 !px-3 text-[13px] ${
              openMenu === key ? "bg-card text-text-primary" : ""
            }`}
            onClick={() => setOpenMenu(openMenu === key ? null : key)}
          >
            {menuLabels[key]}
          </button>

          {openMenu === key && (
            <div className="menu left-0 top-full mt-1">
              {menuItems[key].map((item, index) =>
                item.separator ? (
                  <div key={index} className="menu-separator" />
                ) : (
                  <button
                    key={index}
                    className="menu-item"
                    disabled={item.disabled}
                    onClick={() => handleMenuAction(menuItems[key], item)}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      ))}

      <div className="flex-1" />
      {!useAppStore.getState().user && (
        <button
          className="toolbar-button !py-1.5 text-[13px]"
          onClick={() => signIn("google")}
        >
          <LogIn size={14} />
          Masuk dengan Google
        </button>
      )}
    </div>
  );
}