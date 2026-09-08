"use client";

import { useMemo, useState, useRef } from "react";
import { useAppStore } from "@/store/use-store";
import { useTranslations, useLocale } from "next-intl";
import {
  Search,
  FolderOpen,
  ArrowUpDown,
  CheckSquare,
  Square,
  FileText,
  Image as ImageIcon,
  Table2,
  Archive,
  Package,
  Music,
  Video,
  Code2,
  File,
  X,
  Folder as FolderIcon,
} from "lucide-react";
import {
  isFileSystemAccessSupported,
  openDirectory,
  formatFileSize,
  formatDate,
  getFileCategory,
} from "@/lib/file-system";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { FileEntry, RenameMode } from "@/types";
import ContextMenu from "@/components/context-menu";

export default function MainPanel() {
  const t = useTranslations("mainPanel");
  const locale = useLocale();
  const files = useAppStore((s) => s.files);
  const setFiles = useAppStore((s) => s.setFiles);
  const searchQuery = useAppStore((s) => s.searchQuery);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);
  const sortMode = useAppStore((s) => s.sortMode);
  const setSortMode = useAppStore((s) => s.setSortMode);
  const density = useAppStore((s) => s.density);
  const toggleFileSelection = useAppStore((s) => s.toggleFileSelection);
  const selectAllFiles = useAppStore((s) => s.selectAllFiles);
  const deselectAllFiles = useAppStore((s) => s.deselectAllFiles);
  const selectFilesByRange = useAppStore((s) => s.selectFilesByRange);
  const setFolderHandle = useAppStore((s) => s.setFolderHandle);
  const folderName = useAppStore((s) => s.folderName);

  const [filter, setFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [lastClickedId, setLastClickedId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    fileId: string | null;
  } | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  const handleOpenFolder = async () => {
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

  const sortedFiles = useMemo(() => {
    const sorted = [...files];
    switch (sortMode) {
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "size":
        sorted.sort((a, b) => a.size - b.size);
        break;
      case "modified":
        sorted.sort(
          (a, b) => a.lastModified.getTime() - b.lastModified.getTime()
        );
        break;
      case "extension":
        sorted.sort((a, b) => a.extension.localeCompare(b.extension));
        break;
      case "selection":
        sorted.sort((a, b) => a.selectionOrder - b.selectionOrder);
        break;
    }
    return sorted;
  }, [files, sortMode]);

  const filteredFiles = useMemo(() => {
    let result = sortedFiles;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          (f.name + f.extension).toLowerCase().includes(q) ||
          f.type.toLowerCase().includes(q)
      );
    }
    if (filter !== "all") {
      if (filter === "pdf") {
        result = result.filter((f) => f.extension.toLowerCase() === ".pdf");
      } else {
        result = result.filter(
          (f) => getFileCategory(f.extension) === filter
        );
      }
    }
    return result;
  }, [sortedFiles, searchQuery, filter]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: filteredFiles.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => (density === "compact" ? 32 : 44),
    overscan: 20,
  });

  const handleRowClick = (e: React.MouseEvent, file: FileEntry) => {
    if (e.shiftKey && lastClickedId) {
      selectFilesByRange(lastClickedId, file.id);
    } else {
      toggleFileSelection(file.id);
    }
    setLastClickedId(file.id);
  };

  const selectedCount = files.filter((f) => f.selected).length;

  const handleRenameRequest = (mode: RenameMode) => {
    const s = useAppStore.getState();
    s.setRule({ mode });
    if (!s.renamePanelOpen) s.toggleRenamePanel();
  };

  const handleContextMenu = (e: React.MouseEvent, file: FileEntry) => {
    e.preventDefault();
    if (!file.selected) {
      toggleFileSelection(file.id);
    }
    setContextMenu({ x: e.clientX, y: e.clientY, fileId: file.id });
    setShowSortMenu(false);
  };

  const sortOptions = [
    { key: "name-asc", label: t("sortNameAsc") },
    { key: "name-desc", label: t("sortNameDesc") },
    { key: "size", label: t("sortSize") },
    { key: "modified", label: t("sortModified") },
    { key: "extension", label: t("sortExtension") },
    { key: "selection", label: t("sortSelection") },
  ];

  const FILTERS = [
    { key: "all", label: t("filterAll"), icon: FileText },
    { key: "pdf", label: t("filterPdf"), icon: FileText },
    { key: "image", label: t("filterImage"), icon: ImageIcon },
    { key: "document", label: t("filterDocument"), icon: FileText },
    { key: "spreadsheet", label: t("filterSpreadsheet"), icon: Table2 },
    { key: "archive", label: t("filterArchive"), icon: Archive },
    { key: "video", label: t("filterVideo"), icon: Video },
    { key: "audio", label: t("filterAudio"), icon: Music },
    { key: "code", label: t("filterCode"), icon: Code2 },
    { key: "other", label: t("filterOther"), icon: Package },
  ];

  const getFileIcon = (file: FileEntry) => {
    const category = getFileCategory(file.extension);
    switch (category) {
      case "image":
        return <ImageIcon size={16} className="text-info" />;
      case "document":
        return <FileText size={16} className="text-primary" />;
      case "spreadsheet":
        return <Table2 size={16} className="text-success" />;
      case "archive":
        return <Archive size={16} className="text-warning" />;
      case "video":
        return <Video size={16} className="text-danger" />;
      case "audio":
        return <Music size={16} className="text-info" />;
      case "code":
        return <Code2 size={16} className="text-primary" />;
      default:
        return <File size={16} className="text-text-muted" />;
    }
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-background">
      <div className="flex items-center gap-2 border-b border-border bg-panel px-3 py-2 shrink-0">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <FolderIcon size={15} className="shrink-0 text-text-muted" />
          <span className="truncate text-[13px] font-medium">
            {folderName || t("folderFallback")}
          </span>
        </div>

        <div className="relative flex items-center">
          <Search
            size={14}
            className="pointer-events-none absolute left-2.5 text-text-muted"
          />
          <input
            className="input !h-8 w-48 pl-8 text-[12px]"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            data-search-input
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setSearchQuery("");
            }}
            aria-label={t("searchPlaceholder")}
          />
          {searchQuery && (
            <button
              className="absolute right-2 text-text-muted hover:text-text-primary"
              onClick={() => setSearchQuery("")}
              aria-label={t("clearSearchAria")}
            >
              <X size={13} />
            </button>
          )}
        </div>

        <button
          className="toolbar-button ml-1"
          onClick={() => setShowSortMenu(!showSortMenu)}
          aria-label={t("sortAria")}
        >
          <ArrowUpDown size={14} />
          <span className="text-[12px]">
            {sortOptions.find((o) => o.key === sortMode)?.label || t("sortDefault")}
          </span>
        </button>

        {showSortMenu && (
          <div className="menu right-0 top-full mt-1">
            {sortOptions.map((opt) => (
              <button
                key={opt.key}
                className={`menu-item ${sortMode === opt.key ? "bg-primary-soft" : ""}`}
                onClick={() => {
                  setSortMode(opt.key as typeof sortMode);
                  setShowSortMenu(false);
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        <button
          className="toolbar-button ml-1"
          onClick={selectedCount > 0 ? deselectAllFiles : selectAllFiles}
          aria-label={t("selectToggleAria")}
        >
          {selectedCount > 0 ? (
            <Square size={14} />
          ) : (
            <CheckSquare size={14} />
          )}
          <span className="text-[12px]">
            {selectedCount > 0
              ? t("selectedCount", { count: selectedCount })
              : t("selectAll")}
          </span>
        </button>
      </div>

      <div className="flex items-center gap-1 border-b border-border bg-background px-3 py-1.5 shrink-0 overflow-x-auto">
        {FILTERS.map((f) => {
          const Icon = f.icon;
          const count =
            f.key === "all"
              ? files.length
              : f.key === "pdf"
              ? files.filter((x) => x.extension.toLowerCase() === ".pdf").length
              : files.filter((x) => getFileCategory(x.extension) === f.key)
                  .length;
          return (
            <button
              key={f.key}
              className={`toolbar-button !px-2.5 !py-1 text-[12px] ${
                activeFilter === f.key ? "bg-primary-soft text-primary" : ""
              }`}
              onClick={() => {
                setFilter(f.key);
                setActiveFilter(f.key);
              }}
            >
              <Icon size={13} />
              {f.label}
              <span className="text-[10px] text-text-muted">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 px-3 py-1.5 text-[11px] text-text-muted border-b border-border shrink-0">
        <span className="w-16 text-left font-medium">{t("headerFile")}</span>
        <span className="w-10 text-right font-medium">{t("headerSize")}</span>
        <span className="flex-1 text-right font-medium">{t("headerModified")}</span>
      </div>

      <div ref={parentRef} className="flex-1 overflow-auto">
        {filteredFiles.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <FolderOpen size={40} className="mb-3 text-text-muted" />
            <p className="text-[14px] font-medium text-text-primary">
              {files.length === 0
                ? t("emptyNone")
                : t("emptyNoMatch")}
            </p>
            {files.length === 0 ? (
              <button
                className="btn btn-primary mt-3"
                onClick={handleOpenFolder}
              >
                <FolderOpen size={15} />
                {t("openFolder")}
              </button>
            ) : (
              <button
                className="btn btn-secondary mt-3"
                onClick={() => {
                  setSearchQuery("");
                  setFilter("all");
                  setActiveFilter("all");
                }}
              >
                {t("clearFilter")}
              </button>
            )}
          </div>
        ) : (
          <div
            className="relative"
            style={{ height: virtualizer.getTotalSize() }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const file = filteredFiles[virtualRow.index];
              if (!file) return null;
              return (
                <div
                  key={file.id}
                  className={`absolute left-0 top-0 flex w-full items-center gap-2 px-3 border-b border-border/50 cursor-pointer select-none ${
                    file.selected ? "bg-primary-soft/60" : ""
                  } hover:bg-card-hover`}
                  style={{
                    height: virtualRow.size,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  onClick={(e) => handleRowClick(e, file)}
                  onContextMenu={(e) => handleContextMenu(e, file)}
                  role="row"
                  aria-selected={file.selected}
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                      file.selected
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-background"
                    }`}
                  >
                    {file.selected && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path
                          d="M2 5l2 2 4-4"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  <span className="flex w-6 shrink-0 items-center justify-center">
                    {getFileIcon(file)}
                  </span>
                  <span className="w-16 shrink-0 text-left text-[10px] uppercase text-text-muted">
                    {file.extension || t("folderFallback")}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[13px]">
                    {file.name}
                    <span className="text-text-muted">{file.extension}</span>
                  </span>
                  <span className="w-10 shrink-0 text-right text-[12px] text-text-secondary">
                    {formatFileSize(file.size)}
                  </span>
                  <span className="flex w-20 shrink-0 justify-end text-[12px] text-text-muted">
                    {formatDate(file.lastModified, locale)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          fileId={contextMenu.fileId}
          onClose={() => setContextMenu(null)}
          onRenameRequest={handleRenameRequest}
        />
      )}
    </div>
  );
}