"use client";

import { CheckCircle2, XCircle, AlertTriangle, X, History } from "lucide-react";
import { useAppStore } from "@/store/use-store";
import { useTranslations } from "next-intl";

interface ResultDetail {
  originalName: string;
  newName: string;
  success: boolean;
  skipped?: boolean;
  error?: string;
}

interface Props {
  successful: number;
  failed: number;
  skipped: number;
  details: ResultDetail[];
  onClose: () => void;
}

export default function RenameResultModal({
  successful,
  failed,
  skipped,
  details,
  onClose,
}: Props) {
  const t = useTranslations("renameResult");
  const setShowHistory = useAppStore((s) => s.setShowHistory);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal w-full max-w-lg p-5"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={t("title")}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-semibold">{t("title")}</h2>
          <button
            className="toolbar-button !p-1"
            onClick={onClose}
            aria-label={t("closeAria")}
          >
            <X size={16} />
          </button>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-2">
          <div className="rounded border border-success-soft bg-success-soft p-3 text-center">
            <CheckCircle2 size={18} className="mx-auto mb-1 text-success" />
            <div className="text-[20px] font-semibold text-success">
              {successful}
            </div>
            <div className="text-[11px] text-text-secondary">{t("success")}</div>
          </div>
          <div className="rounded border border-danger-soft bg-danger-soft p-3 text-center">
            <XCircle size={18} className="mx-auto mb-1 text-danger" />
            <div className="text-[20px] font-semibold text-danger">{failed}</div>
            <div className="text-[11px] text-text-secondary">{t("failed")}</div>
          </div>
          <div className="rounded border border-warning-soft bg-warning-soft p-3 text-center">
            <AlertTriangle size={18} className="mx-auto mb-1 text-warning" />
            <div className="text-[20px] font-semibold text-warning">{skipped}</div>
            <div className="text-[11px] text-text-secondary">{t("skipped")}</div>
          </div>
        </div>

        {details.length > 0 && (
          <div className="max-h-64 overflow-y-auto rounded border border-border">
            <table className="w-full text-[12px]">
              <thead className="sticky top-0 bg-card">
                <tr className="text-left text-text-muted">
                  <th className="px-2.5 py-1.5 font-medium">{t("original")}</th>
                  <th className="px-2.5 py-1.5 font-medium">{t("new")}</th>
                  <th className="px-2.5 py-1.5 font-medium">{t("status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {details.map((d, i) => (
                  <tr key={i}>
                    <td className="max-w-[120px] truncate px-2.5 py-1.5 text-text-secondary">
                      {d.originalName}
                    </td>
                    <td className="max-w-[120px] truncate px-2.5 py-1.5">
                      {d.newName}
                    </td>
                    <td className="px-2.5 py-1.5">
                      {d.success ? (
                        <span className="text-success">{t("success")}</span>
                      ) : d.skipped ? (
                        <span className="text-warning">{t("skipped")}</span>
                      ) : (
                        <span className="text-danger" title={d.error}>
                          {t("failed")}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <button
            className="btn btn-secondary btn-lg flex-1"
            onClick={() => {
              onClose();
              setShowHistory(true);
            }}
          >
            <History size={15} />
            {t("viewHistory")}
          </button>
          <button
            className="btn btn-primary btn-lg flex-1"
            onClick={onClose}
          >
            {t("done")}
          </button>
        </div>
      </div>
    </div>
  );
}
