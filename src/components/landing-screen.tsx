"use client";

import { useState } from "react";
import { useAppStore } from "@/store/use-store";
import { useSession, signIn } from "next-auth/react";
import {
  FolderOpen,
  Files,
  Zap,
  Shield,
  ChevronRight,
  Sparkles,
  UploadCloud,
} from "lucide-react";

export default function LandingScreen() {
  const setFiles = useAppStore((s) => s.setFiles);
  const setFolderHandle = useAppStore((s) => s.setFolderHandle);
  const quota = useAppStore((s) => s.quota);
  const [isDragOver, setIsDragOver] = useState(false);
  const { data: session } = useSession();

  const handleOpenFolder = async () => {
    if (typeof window === "undefined") return;
    if (!("showDirectoryPicker" in window)) {
      alert(
        "Peramban Anda tidak mendukung API File System Access. Gunakan 'Pilih File' sebagai gantinya."
      );
      return;
    }

    try {
      const handle = await window.showDirectoryPicker({ mode: "readwrite" });
      const files = await readDir(handle);
      setFiles(files);
      setFolderHandle(handle, handle.name);
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        alert("Tidak dapat membuka folder. Periksa izin akses Anda.");
      }
    }
  };

  const readDir = async (dirHandle: FileSystemDirectoryHandle) => {
    const { readDirectory } = await import("@/lib/file-system");
    return readDirectory(dirHandle);
  };

  const handleSelectFiles = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.onchange = async () => {
      if (input.files) {
        const { createFilesFromInput } = await import("@/lib/file-system");
        const newFiles = createFilesFromInput(input.files);
        setFiles(newFiles);
      }
    };
    input.click();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    try {
      const { handleDragDrop } = await import("@/lib/file-system");
      const dropped = await handleDragDrop(e);
      if (dropped && dropped.length > 0) {
        setFiles(dropped);
      }
    } catch {
      alert("Tidak dapat membaca file yang diturunkan.");
    }
  };

  return (
    <div
      className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-background px-6"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.08),transparent_60%)]" />

      <div className="absolute right-6 top-6 z-20">
        {session?.user ? (
          <span className="flex items-center gap-2 rounded-full border border-border bg-panel px-3.5 py-1.5 text-[12px] text-text-secondary">
            <span className="h-5 w-5 rounded-full bg-primary text-white text-[10px] font-semibold flex items-center justify-center">
              {session.user.name?.charAt(0).toUpperCase() || "U"}
            </span>
            {session.user.name}
          </span>
        ) : (
          <button
            className="flex items-center gap-2 rounded-full border border-primary/40 bg-primary-soft px-4 py-2 text-[13px] font-medium text-primary transition-colors hover:bg-primary/20"
            onClick={() => signIn("google")}
          >
            <Sparkles size={14} />
            Masuk dengan Google
          </button>
        )}
      </div>

      <div
        className={`pointer-events-none absolute inset-4 rounded-2xl border-2 border-dashed transition-colors ${
          isDragOver ? "border-primary bg-primary-soft/30" : "border-transparent"
        }`}
      />

      <div className="relative z-10 flex w-full max-w-xl flex-col items-center text-center slide-up">
        {isDragOver && (
          <div className="mb-4 flex items-center gap-2 rounded-full bg-primary-soft px-4 py-1.5 text-[13px] font-medium text-primary">
            <UploadCloud size={16} />
            Lepaskan file untuk memuatnya
          </div>
        )}
        <div className="mb-5 flex h-16 w-16 items-center justify-center">
          <svg width="64" height="64" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="8" y="3" width="24" height="36" rx="5" fill="#e8eaed" stroke="#c8ccd4" />
            <path d="M12 22h16" stroke="#9aa3af" strokeWidth="2" strokeLinecap="round" />
            <path d="M14 14h12" stroke="#9aa3af" strokeWidth="2" strokeLinecap="round" />
            <path d="M34 16l6 6-6 6" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M38 22H12" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold tracking-tight">
          Ubah nama ratusan file{" "}
          <span className="bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
            dalam hitungan detik
          </span>
        </h1>

        <p className="mt-3 max-w-md text-[14px] leading-relaxed text-text-secondary">
          Utilitas desktop profesional untuk penggantian nama file massal —
          bekerja langsung di peramban Anda.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
          <button
            className="btn btn-primary btn-lg !h-12 min-w-[200px] text-[15px]"
            onClick={handleOpenFolder}
          >
            <FolderOpen size={17} />
            Buka Folder
          </button>
          <button
            className="btn btn-secondary btn-lg !h-12 min-w-[200px] text-[15px]"
            onClick={handleSelectFiles}
          >
            <Files size={17} />
            Pilih File
          </button>
        </div>

        <div className="mt-6 flex items-center gap-2 rounded-full border border-border bg-panel px-4 py-1.5 text-[12px] text-text-secondary">
          <Shield size={14} className="text-success" />
          File Anda tetap berada di perangkat Anda. Tanpa unggahan.
        </div>

        <div className="mt-6 grid w-full grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="card p-4 text-left">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={14} className="text-primary" />
              <span className="text-[12px] font-semibold">Gratis</span>
            </div>
            <p className="text-[12px] text-text-muted leading-snug">
              Ubah nama hingga {quota.total || 5} file tanpa perlu mendaftar.
            </p>
          </div>
          <div className="card p-4 text-left">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-primary" />
              <span className="text-[12px] font-semibold">Google</span>
            </div>
            <p className="text-[12px] text-text-muted leading-snug">
              10 file dengan akun Google gratis.
            </p>
          </div>
          <div className="card p-4 text-left">
            <div className="flex items-center gap-2 mb-1">
              <ChevronRight size={14} className="text-primary" />
              <span className="text-[12px] font-semibold">Token</span>
            </div>
            <p className="text-[12px] text-text-muted leading-snug">
              100 file per token — bayar hanya untuk yang Anda ubah namanya.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}