"use client";

import { useAppStore } from "@/store/use-store";
import { useTranslations } from "next-intl";
import {
  Folder,
  Clock,
  FileText,
  Download,
  Monitor,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import { isFileSystemAccessSupported, openDirectory } from "@/lib/file-system";

export default function Sidebar() {
  const t = useTranslations("sidebar");
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const setFiles = useAppStore((s) => s.setFiles);
  const setFolderHandle = useAppStore((s) => s.setFolderHandle);
  const setShowPayment = useAppStore((s) => s.setShowPayment);
  const user = useAppStore((s) => s.user);
  const quota = useAppStore((s) => s.quota);

  const openCustomFolder = async () => {
    if (!isFileSystemAccessSupported()) {
      alert(t("apiUnsupported"));
      return;
    }
    try {
      const result = await openDirectory();
      if (result) {
        setFiles(result.files);
        setFolderHandle(result.handle, result.handle.name);
      }
    } catch {
      alert(t("openFailed"));
    }
  };

  if (collapsed) {
    return <div className="flex w-12 shrink-0 flex-col items-center border-r border-border bg-panel py-3"><button className="toolbar-button" onClick={toggleSidebar} aria-label={t("expand")}><ChevronRight size={16} /></button></div>;
  }

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-panel overflow-y-auto">
      <div className="flex items-center justify-between px-3 py-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
          {t("quickAccess")}
        </span>
        <button className="toolbar-button !p-1" onClick={toggleSidebar} aria-label={t("collapse")}>
          <ChevronLeft size={15} />
        </button>
      </div>

      <div className="px-2 space-y-0.5">
        <button
          className="toolbar-button w-full !justify-start !px-2.5"
          onClick={() => setShowPayment(true)}
        >
          <Zap size={15} className="text-primary" />
          {t("buyToken")}
        </button>
      </div>

      <div className="mt-3 px-3 pb-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
          {t("location")}
        </span>
      </div>

      <div className="px-2 space-y-0.5">
        <button
          className="toolbar-button w-full !justify-start !px-2.5"
          onClick={openCustomFolder}
          title={t("openFolderTitle")}
        >
          <FolderOpen size={15} />
          {t("openFolder")}
        </button>
        <button
          className="toolbar-button w-full !justify-start !px-2.5 opacity-50"
          disabled
          title={t("recentTitle")}
        >
          <Clock size={15} />
          {t("recent")}
        </button>
        <button
          className="toolbar-button w-full !justify-start !px-2.5 opacity-50"
          disabled
          title={t("documentsTitle")}
        >
          <FileText size={15} />
          {t("documents")}
        </button>
        <button
          className="toolbar-button w-full !justify-start !px-2.5 opacity-50"
          disabled
          title={t("downloadsTitle")}
        >
          <Download size={15} />
          {t("downloads")}
        </button>
        <button
          className="toolbar-button w-full !justify-start !px-2.5 opacity-50"
          disabled
          title={t("desktopTitle")}
        >
          <Monitor size={15} />
          {t("desktop")}
        </button>
      </div>

      <div className="mt-auto px-3 py-3">
        <div className="card p-3">
          <div className="flex items-center gap-2">
            <Folder size={14} className="text-primary" />
            <span className="text-[12px] font-medium">{t("storage")}</span>
          </div>
          <p className="mt-1 text-[11px] text-text-muted leading-snug">
            {t("storageDesc")}
          </p>
          {quota.remaining < 3 && !user && (
            <button
              className="btn btn-primary btn-lg mt-2 w-full"
              onClick={() => setShowPayment(true)}
            >
              {t("upgrade")}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}