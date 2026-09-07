"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/use-store";

export function useKeyboardShortcuts() {
  const selectAll = useAppStore((s) => s.selectAllFiles);
  const deselectAll = useAppStore((s) => s.deselectAllFiles);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);
  const setRenaming = useAppStore((s) => s.setRenaming);
  const setRenameProgress = useAppStore((s) => s.setRenameProgress);
  const refreshFileHandles = useAppStore((s) => s.refreshFileHandles);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const inInput =
        tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
        if (!inInput) {
          e.preventDefault();
          const selected = useAppStore.getState().files.filter((f) => f.selected);
          if (selected.length === useAppStore.getState().files.length && selected.length > 0) {
            deselectAll();
          } else {
            selectAll();
          }
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        const input = document.querySelector(
          'input[aria-label="Search files"]'
        ) as HTMLInputElement;
        input?.focus();
        input?.select();
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        const op = useAppStore.getState().lastOperation;
        const handle = useAppStore.getState().folderHandle;
        if (!op || !handle) return;
        if (inInput) return;

        e.preventDefault();
        const undoResults = op.results.filter((r) => r.success);

        (async () => {
          setRenaming(true);
          setRenameProgress({
            total: undoResults.length,
            processed: 0,
            successful: 0,
            failed: 0,
          });
          const { renameFile } = await import("@/lib/file-system");
          let done = 0;
          for (const result of undoResults) {
            await renameFile(handle, result.newName, result.originalName);
            done++;
            setRenameProgress({
              total: undoResults.length,
              processed: done,
              successful: done,
              failed: 0,
            });
          }
          setRenaming(false);
          await refreshFileHandles();
        })();
      }

      if (e.key === "Escape") {
        const state = useAppStore.getState();
        state.setShowSettings(false);
        state.setShowHistory(false);
        state.setShowHelp(false);
        state.setShowPayment(false);
        state.setShowProfile(false);
        state.setShowAdmin(false);
        state.setSearchQuery("");
      }

      if (e.key === "F2" && !inInput) {
        e.preventDefault();
        const state = useAppStore.getState();
        if (state.renamePanelOpen === false) {
          state.toggleRenamePanel();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectAll, deselectAll, setSearchQuery, setRenaming, setRenameProgress, refreshFileHandles]);
}

export default useKeyboardShortcuts;