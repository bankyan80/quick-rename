"use client";

import { useAppStore } from "@/store/use-store";
import { useTranslations } from "next-intl";
import { X, History, Undo2, ArrowRight } from "lucide-react";

export default function HistoryModal() {
  const t = useTranslations("historyModal");
  const setShowHistory = useAppStore((s) => s.setShowHistory);
  const history = useAppStore((s) => s.history);
  const refreshFileHandles = useAppStore((s) => s.refreshFileHandles);
  const folderHandle = useAppStore((s) => s.folderHandle);
  const [setRenaming] = [useAppStore((s) => s.setRenaming)];

  const undoOperation = (op: (typeof history)[0]) => {
    if (!folderHandle) return;
    const undoResults = op.results.filter((r) => r.success);

    (async () => {
      setRenaming(true);
      const { renameFile } = await import("@/lib/file-system");
      for (const result of undoResults) {
        await renameFile(folderHandle, result.newName, result.originalName);
      }
      setRenaming(false);
      await refreshFileHandles();
      alert(t("undoneAlert", { count: undoResults.length }));
    })();
  };

  const formatSummary = (op: (typeof history)[0]) => {
    const byMode: Record<string, string> = {
      prefix: t("modePrefix"),
      suffix: t("modeSuffix"),
      "find-replace": t("modeFindReplace"),
      numbering: t("modeNumbering"),
      case: t("modeCase"),
      remove: t("modeRemove"),
      pattern: t("modePattern", { pattern: op.rule.pattern ?? "" }),
    };
    return byMode[op.rule.mode] || t("modeDefault");
  };

  return (
    <div className="modal-overlay" onClick={() => setShowHistory(false)}>
      <div
        className="modal w-full max-w-lg p-5"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={t("title")}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-semibold flex items-center gap-2">
            <History size={16} className="text-primary" />
            {t("title")}
          </h2>
          <button
            className="toolbar-button !p-1"
            onClick={() => setShowHistory(false)}
            aria-label={t("closeAria")}
          >
            <X size={16} />
          </button>
        </div>

        {history.length === 0 ? (
          <p className="py-8 text-center text-text-muted text-[13px]">
            {t("empty")}
          </p>
        ) : (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {history.map((op) => (
              <div
                key={op.id}
                className="flex items-center justify-between rounded border border-border bg-card p-3"
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-medium">
                    {formatSummary(op)}
                  </p>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    {t("summary", {
                      successful: op.successfulCount,
                      failed: op.failedCount,
                      skipped: op.skippedCount,
                    })}
                    {" · "}
                    {op.timestamp.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {folderHandle && (
                    <button
                      className="toolbar-button text-[12px]"
                      onClick={() => undoOperation(op)}
                      title={t("undoTitle")}
                    >
                      <Undo2 size={13} />
                      {t("undo")}
                    </button>
                  )}
                  <button
                    className="toolbar-button text-[12px]"
                    onClick={() =>
                      alert(
                        op.results
                          .map(
                            (r) =>
                              `${r.originalName} ${r.success ? "→" : "✕→"} ${
                                r.newName
                              }${r.error ? ` (${r.error})` : ""}`
                          )
                          .join("\n")
                      )
                    }
                    title={t("detailsTitle")}
                  >
                    <ArrowRight size={13} />
                    {t("details")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}