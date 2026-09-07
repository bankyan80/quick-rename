import { create } from "zustand";
import { FileEntry, RenameRule, SortMode, ConflictResolution, RenameOperation, QuotaInfo } from "@/types";

interface AppState {
  files: FileEntry[];
  selectedCount: number;
  rule: RenameRule;
  sortMode: SortMode;
  searchQuery: string;
  folderHandle: FileSystemDirectoryHandle | null;
  folderName: string;
  isSupportedBrowser: boolean;
  hasPermission: boolean;
  isRenaming: boolean;
  renameProgress: { total: number; processed: number; successful: number; failed: number };
  lastOperation: RenameOperation | null;
  history: RenameOperation[];
  conflictResolution: ConflictResolution;
  showSettings: boolean;
  showHistory: boolean;
  showHelp: boolean;
  showPayment: boolean;
  showAdmin: boolean;
  showProfile: boolean;
  theme: "dark" | "light" | "system";
  density: "comfortable" | "compact";
  confirmBeforeRename: boolean;
  preserveExtensions: boolean;
  sidebarCollapsed: boolean;
  renamePanelOpen: boolean;
  quota: QuotaInfo;
  user: { name: string; email: string; avatar: string } | null;

  setFiles: (files: FileEntry[]) => void;
  addFiles: (files: FileEntry[]) => void;
  clearFiles: () => void;
  toggleFileSelection: (id: string) => void;
  selectAllFiles: () => void;
  deselectAllFiles: () => void;
  selectFilesByRange: (startId: string, endId: string) => void;
  setRule: (rule: Partial<RenameRule>) => void;
  resetRule: () => void;
  setSortMode: (mode: SortMode) => void;
  setSearchQuery: (query: string) => void;
  setFolderHandle: (handle: FileSystemDirectoryHandle | null, name?: string) => void;
  setRenaming: (renaming: boolean) => void;
  setRenameProgress: (progress: { total: number; processed: number; successful: number; failed: number }) => void;
  addHistoryEntry: (entry: RenameOperation) => void;
  setConflictResolution: (resolution: ConflictResolution) => void;
  setTheme: (theme: "dark" | "light" | "system") => void;
  setDensity: (density: "comfortable" | "compact") => void;
  setConfirmBeforeRename: (confirm: boolean) => void;
  setPreserveExtensions: (preserve: boolean) => void;
  toggleSidebar: () => void;
  toggleRenamePanel: () => void;
  setQuota: (quota: QuotaInfo) => void;
  setUser: (user: { name: string; email: string; avatar: string } | null) => void;
  setShowSettings: (show: boolean) => void;
  setShowHistory: (show: boolean) => void;
  setShowHelp: (show: boolean) => void;
  setShowPayment: (show: boolean) => void;
  setShowAdmin: (show: boolean) => void;
  setShowProfile: (show: boolean) => void;
  refreshFileHandles: () => Promise<void>;
}

const defaultRule: RenameRule = {
  mode: "prefix",
  prefix: "",
  suffix: "",
  findText: "",
  replaceText: "",
  caseType: "uppercase",
  removeText: "",
  pattern: "{name}",
  startNumber: 1,
  increment: 1,
  padding: 3,
  caseSensitive: true,
};

export const useAppStore = create<AppState>((set, get) => ({
  files: [],
  selectedCount: 0,
  rule: { ...defaultRule },
  sortMode: "name-asc",
  searchQuery: "",
  folderHandle: null,
  folderName: "",
  isSupportedBrowser: false,
  hasPermission: false,
  isRenaming: false,
  renameProgress: { total: 0, processed: 0, successful: 0, failed: 0 },
  lastOperation: null,
  history: [],
  conflictResolution: "auto-resolve",
  showSettings: false,
  showHistory: false,
  showHelp: false,
  showPayment: false,
  showAdmin: false,
  showProfile: false,
  theme: "dark",
  density: "comfortable",
  confirmBeforeRename: true,
  preserveExtensions: true,
  sidebarCollapsed: false,
  renamePanelOpen: true,
  quota: { type: "free", total: 5, used: 0, remaining: 5 },
  user: null,

  setFiles: (files) =>
    set({
      files,
      selectedCount: files.filter((f) => f.selected).length,
    }),

  addFiles: (newFiles) =>
    set((state) => {
      const existingIds = new Set(state.files.map((f) => f.name + f.extension));
      const uniqueNewFiles = newFiles.filter(
        (f) => !existingIds.has(f.name + f.extension)
      );
      const files = [...state.files, ...uniqueNewFiles];
      return {
        files,
        selectedCount: files.filter((f) => f.selected).length,
      };
    }),

  clearFiles: () => set({ files: [], selectedCount: 0, folderHandle: null, folderName: "" }),

  toggleFileSelection: (id) =>
    set((state) => {
      let orderCounter = state.files.filter((f) => f.selected).length;
      const files = state.files.map((f) => {
        if (f.id === id) {
          const newSelected = !f.selected;
          return {
            ...f,
            selected: newSelected,
            selectionOrder: newSelected ? ++orderCounter : 0,
          };
        }
        return f;
      });
      return {
        files,
        selectedCount: files.filter((f) => f.selected).length,
      };
    }),

  selectAllFiles: () =>
    set((state) => {
      let orderCounter = 0;
      const files = state.files.map((f) => ({
        ...f,
        selected: true,
        selectionOrder: ++orderCounter,
      }));
      return { files, selectedCount: files.length };
    }),

  deselectAllFiles: () =>
    set((state) => {
      const files = state.files.map((f) => ({
        ...f,
        selected: false,
        selectionOrder: 0,
      }));
      return { files, selectedCount: 0 };
    }),

  selectFilesByRange: (startId, endId) =>
    set((state) => {
      const files = state.files;
      const startIdx = files.findIndex((f) => f.id === startId);
      const endIdx = files.findIndex((f) => f.id === endId);
      if (startIdx === -1 || endIdx === -1) return state;

      const min = Math.min(startIdx, endIdx);
      const max = Math.max(startIdx, endIdx);
      let orderCounter = files.filter((f) => f.selected && f.id !== startId).length;

      const newFiles = files.map((f, idx) => {
        if (idx >= min && idx <= max) {
          return {
            ...f,
            selected: true,
            selectionOrder: ++orderCounter,
          };
        }
        return f;
      });

      return {
        files: newFiles,
        selectedCount: newFiles.filter((f) => f.selected).length,
      };
    }),

  setRule: (rule) =>
    set((state) => ({
      rule: { ...state.rule, ...rule },
    })),

  resetRule: () => set({ rule: { ...defaultRule } }),

  setSortMode: (mode) => set({ sortMode: mode }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setFolderHandle: (handle, name) =>
    set({
      folderHandle: handle,
      folderName: name || "",
      hasPermission: !!handle,
    }),

  setRenaming: (renaming) => set({ isRenaming: renaming }),

  setRenameProgress: (progress) => set({ renameProgress: progress }),

  addHistoryEntry: (entry) =>
    set((state) => ({
      history: [entry, ...state.history].slice(0, 50),
      lastOperation: entry,
    })),

  setConflictResolution: (resolution) => set({ conflictResolution: resolution }),

  setTheme: (theme) => set({ theme }),

  setDensity: (density) => set({ density }),

  setConfirmBeforeRename: (confirm) => set({ confirmBeforeRename: confirm }),

  setPreserveExtensions: (preserve) => set({ preserveExtensions: preserve }),

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  toggleRenamePanel: () => set((state) => ({ renamePanelOpen: !state.renamePanelOpen })),

  setQuota: (quota) => set({ quota }),

  setUser: (user) => set({ user }),

  setShowSettings: (show) => set({ showSettings: show }),
  setShowHistory: (show) => set({ showHistory: show }),
  setShowHelp: (show) => set({ showHelp: show }),
  setShowPayment: (show) => set({ showPayment: show }),
  setShowAdmin: (show) => set({ showAdmin: show }),
  setShowProfile: (show) => set({ showProfile: show }),

  refreshFileHandles: async () => {
    const { files, folderHandle } = get();
    if (!folderHandle) return;

    const updatedFiles: FileEntry[] = [];
    for (const file of files) {
      try {
        if (file.handle) {
          const fh = await folderHandle.getFileHandle(file.name + file.extension);
          const f = await fh.getFile();
          updatedFiles.push({
            ...file,
            handle: fh,
            size: f.size,
            lastModified: new Date(f.lastModified),
          });
        } else {
          updatedFiles.push(file);
        }
      } catch {
        updatedFiles.push(file);
      }
    }

    set({ files: updatedFiles });
  },
}));
