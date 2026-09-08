"use client";

import { useAppStore } from "@/store/use-store";
import { useLocale, useTranslations } from "next-intl";
import {
  X,
  Monitor,
  Info,
  ShieldCheck,
  FileText,
  Rows3,
  CheckSquare,
  Languages,
} from "lucide-react";

function switchLocale(next: string) {
  document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; samesite=lax`;
  window.location.reload();
}

export default function SettingsModal() {
  const t = useTranslations("settingsModal");
  const locale = useLocale();
  const setShowSettings = useAppStore((s) => s.setShowSettings);
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const density = useAppStore((s) => s.density);
  const setDensity = useAppStore((s) => s.setDensity);
  const conflictResolution = useAppStore((s) => s.conflictResolution);
  const setConflictResolution = useAppStore((s) => s.setConflictResolution);
  const confirmBeforeRename = useAppStore((s) => s.confirmBeforeRename);
  const setConfirmBeforeRename = useAppStore((s) => s.setConfirmBeforeRename);
  const preserveExtensions = useAppStore((s) => s.preserveExtensions);
  const setPreserveExtensions = useAppStore((s) => s.setPreserveExtensions);

  return (
    <div className="modal-overlay" onClick={() => setShowSettings(false)}>
      <div
        className="modal w-full max-w-md p-5"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={t("title")}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-semibold">{t("title")}</h2>
          <button
            className="toolbar-button !p-1"
            onClick={() => setShowSettings(false)}
            aria-label={t("closeAria")}
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Monitor size={14} className="text-primary" />
              <label className="label !mb-0">{t("appearance")}</label>
            </div>
            <div className="flex gap-2">
              {(
                [
                  ["dark", t("themeDark")],
                  ["light", t("themeLight")],
                  ["system", t("themeSystem")],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  className={`btn flex-1 ${theme === value ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setTheme(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Rows3 size={14} className="text-primary" />
              <label className="label !mb-0">{t("density")}</label>
            </div>
            <div className="flex gap-2">
              {(
                [
                  ["comfortable", t("densityComfortable")],
                  ["compact", t("densityCompact")],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  className={`btn flex-1 ${density === value ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setDensity(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Languages size={14} className="text-primary" />
              <label className="label !mb-0">{t("language")}</label>
            </div>
            <div className="flex gap-2">
              {(
                [
                  ["id", t("languageId")],
                  ["en", t("languageEn")],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  className={`btn flex-1 ${locale === value ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => switchLocale(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Info size={14} className="text-primary" />
              <label className="label !mb-0">{t("conflict")}</label>
            </div>
            <select
              className="select"
              value={conflictResolution}
              onChange={(e) =>
                setConflictResolution(e.target.value as typeof conflictResolution)
              }
            >
              <option value="auto-resolve">{t("conflictAuto")}</option>
              <option value="skip">{t("conflictSkip")}</option>
              <option value="cancel">{t("conflictCancel")}</option>
            </select>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText size={14} className="text-primary" />
              <label className="label !mb-0">{t("fileBehavior")}</label>
            </div>
            <label className="flex items-center gap-2 text-[12px] text-text-secondary cursor-pointer py-1">
              <input
                type="checkbox"
                checked={preserveExtensions}
                onChange={(e) => setPreserveExtensions(e.target.checked)}
                className="h-4 w-4"
              />
              {t("preserveExtensions")}
            </label>
            <p className="text-[12px] text-text-muted">
              {t.rich("preserveExtensionsHint", {
                ext: "{ext}",
                code: (chunks) => (
                  <code className="rounded bg-card px-1">{chunks}</code>
                ),
              })}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckSquare size={14} className="text-primary" />
              <label className="label !mb-0">{t("confirmation")}</label>
            </div>
            <label className="flex items-center gap-2 text-[12px] text-text-secondary cursor-pointer py-1">
              <input
                type="checkbox"
                checked={confirmBeforeRename}
                onChange={(e) => setConfirmBeforeRename(e.target.checked)}
                className="h-4 w-4"
              />
              {t("confirmPrompt")}
            </label>
          </div>

          <div className="rounded border border-success-soft bg-success-soft p-3">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={14} className="text-success" />
              <span className="text-[12px] font-medium text-success">
                {t("privacy")}
              </span>
            </div>
            <p className="text-[12px] text-text-secondary leading-snug">
              {t("privacyDesc")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}