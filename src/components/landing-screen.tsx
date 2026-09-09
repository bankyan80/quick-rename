"use client";

import { useState } from "react";
import { useAppStore } from "@/store/use-store";
import { useTranslations } from "next-intl";
import { useSession, signIn } from "next-auth/react";
import Image from "next/image";
import {
  FolderOpen,
  Files,
  Zap,
  Shield,
  ChevronRight,
  Sparkles,
  UploadCloud,
  ExternalLink,
  Combine,
  FileImage,
  Scaling,
  FileText,
  Table2,
  Presentation,
  type LucideIcon,
} from "lucide-react";

const quickTools: Array<{
  name: string;
  tagline: string;
  url: string;
  accent: string;
  icon: LucideIcon;
}> = [
  {
    name: "Merge PDF",
    tagline: "Gabungkan beberapa file PDF menjadi satu dokumen.",
    url: "https://quick-merge-pdf.vercel.app",
    accent: "#6366f1",
    icon: Combine,
  },
  {
    name: "PDF to JPG",
    tagline: "Ubah halaman PDF menjadi gambar JPG.",
    url: "https://quick-pdf-to-jpg.vercel.app",
    accent: "#f97316",
    icon: FileImage,
  },
  {
    name: "Resize PDF",
    tagline: "Sesuaikan ukuran halaman PDF dengan kebutuhan Anda.",
    url: "https://quick-resize-pdf.vercel.app",
    accent: "#14b8a6",
    icon: Scaling,
  },
  {
    name: "PDF to Word",
    tagline: "Ubah PDF menjadi dokumen Word yang dapat diedit.",
    url: "https://quick-pdf-to-word.vercel.app",
    accent: "#3b82f6",
    icon: FileText,
  },
  {
    name: "PDF to Excel",
    tagline: "Ambil data tabel dari PDF ke file Excel.",
    url: "https://quick-pdf-to-excel.vercel.app",
    accent: "#22c55e",
    icon: Table2,
  },
  {
    name: "PDF to PowerPoint",
    tagline: "Ubah PDF menjadi presentasi PowerPoint.",
    url: "https://quick-pdf-to-powerpoint.vercel.app",
    accent: "#f43f5e",
    icon: Presentation,
  },
];

const tutorialSteps: Array<{
  img: string;
  titleKey: string;
  bodyKey: string;
}> = [
  { img: "/tutorial/01-overview.webp", titleKey: "step1Title", bodyKey: "step1Body" },
  { img: "/tutorial/02-load.webp", titleKey: "step2Title", bodyKey: "step2Body" },
  { img: "/tutorial/03-preview.webp", titleKey: "step3Title", bodyKey: "step3Body" },
  { img: "/tutorial/04-done.webp", titleKey: "step4Title", bodyKey: "step4Body" },
];

export default function LandingScreen() {
  const t = useTranslations("landing");
  const tt = useTranslations("tutorial");
  const to = useTranslations("otherTools");
  const setFiles = useAppStore((s) => s.setFiles);
  const setFolderHandle = useAppStore((s) => s.setFolderHandle);
  const quota = useAppStore((s) => s.quota);
  const [isDragOver, setIsDragOver] = useState(false);
  const { data: session } = useSession();

  const handleOpenFolder = async () => {
    if (typeof window === "undefined") return;
    if (!("showDirectoryPicker" in window)) {
      alert(t("apiUnsupported"));
      return;
    }

    try {
      const handle = await window.showDirectoryPicker({ mode: "readwrite" });
      const files = await readDir(handle);
      setFiles(files);
      setFolderHandle(handle, handle.name);
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        alert(t("folderOpenFailed"));
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
      alert(t("dropFailed"));
    }
  };

  return (
    <div
      className="relative flex flex-1 flex-col overflow-y-auto bg-background text-text-primary"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.08),transparent_60%)]" />

      <div
        className={`pointer-events-none absolute inset-4 z-0 rounded-2xl border-2 border-dashed transition-colors ${
          isDragOver ? "border-primary bg-primary-soft/30" : "border-transparent"
        }`}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-10">
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
              {t("signIn")}
            </button>
          )}
        </div>

        <div className="flex w-full flex-1 flex-col items-center justify-center pt-12 text-center slide-up lg:pt-0">
          {isDragOver && (
            <div className="mb-4 flex items-center gap-2 rounded-full bg-primary-soft px-4 py-1.5 text-[13px] font-medium text-primary">
              <UploadCloud size={16} />
              {t("dropHint")}
            </div>
          )}
          <div className="mb-5 flex h-20 w-20 items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logoquickrename.png"
              alt="Quick Rename"
              width={80}
              height={80}
              className="object-contain"
              draggable={false}
            />
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("heroPrefix")}{" "}
            <span className="bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
              {t("heroHighlight")}
            </span>
          </h1>

          <p className="mt-3 max-w-md text-[14px] leading-relaxed text-text-secondary">
            {t("subtitle")}
          </p>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <button
              className="btn btn-primary btn-lg !h-12 min-w-[200px] text-[15px]"
              onClick={handleOpenFolder}
            >
              <FolderOpen size={17} />
              {t("openFolder")}
            </button>
            <button
              className="btn btn-secondary btn-lg !h-12 min-w-[200px] text-[15px]"
              onClick={handleSelectFiles}
            >
              <Files size={17} />
              {t("selectFiles")}
            </button>
          </div>

          <div className="mt-6 flex items-center gap-2 rounded-full border border-border bg-panel px-4 py-1.5 text-[12px] text-text-secondary">
            <Shield size={14} className="text-success" />
            {t("privacyNotice")}
          </div>

          <div className="mt-8 grid w-full grid-cols-1 gap-2.5 sm:grid-cols-3">
            <div className="card p-4 text-left">
              <div className="mb-1 flex items-center gap-2">
                <Zap size={14} className="text-primary" />
                <span className="text-[12px] font-semibold">{t("planFree")}</span>
              </div>
              <p className="text-[12px] text-text-muted leading-snug">
                {t("planFreeDesc", { count: quota.total || 5 })}
              </p>
            </div>
            <div className="card p-4 text-left">
              <div className="mb-1 flex items-center gap-2">
                <Sparkles size={14} className="text-primary" />
                <span className="text-[12px] font-semibold">{t("planGoogle")}</span>
              </div>
              <p className="text-[12px] text-text-muted leading-snug">
                {t("planGoogleDesc")}
              </p>
            </div>
            <div className="card p-4 text-left">
              <div className="mb-1 flex items-center gap-2">
                <ChevronRight size={14} className="text-primary" />
                <span className="text-[12px] font-semibold">{t("planToken")}</span>
              </div>
              <p className="text-[12px] text-text-muted leading-snug">
                {t("planTokenDesc")}
              </p>
            </div>
          </div>
        </div>

        <section className="mt-16 w-full">
          <div className="mb-5">
            <h2 className="text-xl font-bold tracking-tight">{tt("label")}</h2>
            <p className="mt-1 text-[13px] text-text-secondary">{tt("intro")}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {tutorialSteps.map((step, i) => (
              <figure key={step.img} className="card overflow-hidden">
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-card border-b border-border">
                  <Image
                    src={step.img}
                    alt={`${tt("stepTag")} ${i + 1}: ${tt(step.titleKey)}`}
                    width={1600}
                    height={900}
                    className="h-full w-full object-cover object-top"
                    priority={i === 0}
                    unoptimized
                  />
                </div>
                <figcaption className="p-4">
                  <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-[11px] font-medium text-primary">
                    {tt("stepTag")} {i + 1}
                  </span>
                  <h3 className="mt-2 text-[14px] font-semibold">{tt(step.titleKey)}</h3>
                  <p className="mt-1 text-[12px] leading-relaxed text-text-muted">
                    {tt(step.bodyKey)}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="mt-16 w-full">
          <div className="mb-5">
            <h2 className="text-xl font-bold tracking-tight">{to("label")}</h2>
            <p className="mt-1 text-[13px] text-text-secondary">{to("intro")}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {quickTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <a
                  key={tool.url}
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card group flex items-start gap-3 p-4 transition-colors hover:border-primary/40"
                >
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white"
                    style={{ backgroundColor: tool.accent }}
                  >
                    <Icon size={20} />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 text-[13px] font-semibold">
                      {tool.name}
                      <ExternalLink
                        size={12}
                        className="shrink-0 text-text-muted transition-colors group-hover:text-primary"
                      />
                    </span>
                    <span className="mt-0.5 block text-[12px] leading-snug text-text-muted">
                      {tool.tagline}
                    </span>
                  </span>
                </a>
              );
            })}
          </div>
        </section>

        <footer className="mt-16 border-t border-border pt-6 text-center text-[12px] text-text-muted">
          © {new Date().getFullYear()} Quick Rename · {tt("label")}
        </footer>
      </div>
    </div>
  );
}