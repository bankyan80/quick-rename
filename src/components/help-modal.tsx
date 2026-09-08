"use client";

import { useAppStore } from "@/store/use-store";
import { useTranslations } from "next-intl";
import { X, HelpCircle, FolderOpen, Braces, Hash, Zap, CreditCard, Monitor } from "lucide-react";

export default function HelpModal() {
  const t = useTranslations("helpModal");
  const setShowHelp = useAppStore((s) => s.setShowHelp);

  const sections = [
    {
      icon: FolderOpen,
      title: t("openTitle"),
      body: t("openBody"),
    },
    {
      icon: Monitor,
      title: t("selectTitle"),
      body: t("selectBody"),
    },
    {
      icon: Braces,
      title: t("patternTitle"),
      body: t("patternBody", {
        name: "{name}",
        n: "{n}",
        nn: "{nn}",
        nnn: "{nnn}",
        date: "{date}",
        time: "{time}",
        ext: "{ext}",
      }),
    },
    {
      icon: Hash,
      title: t("numberingTitle"),
      body: t("numberingBody"),
    },
    {
      icon: HelpCircle,
      title: t("findReplaceTitle"),
      body: t("findReplaceBody"),
    },
    {
      icon: Zap,
      title: t("quotaTitle"),
      body: t("quotaBody"),
    },
    {
      icon: CreditCard,
      title: t("paymentTitle"),
      body: t("paymentBody"),
    },
    {
      icon: Monitor,
      title: t("browserTitle"),
      body: t("browserBody"),
    },
  ];

  return (
    <div className="modal-overlay" onClick={() => setShowHelp(false)}>
      <div
        className="modal w-full max-w-2xl p-5"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={t("title")}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-semibold flex items-center gap-2">
            <HelpCircle size={16} className="text-primary" />
            {t("title")}
          </h2>
          <button
            className="toolbar-button !p-1"
            onClick={() => setShowHelp(false)}
            aria-label={t("closeAria")}
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[65vh] overflow-y-auto">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.title} className="rounded border border-border bg-card p-3.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon size={14} className="text-primary" />
                  <span className="text-[13px] font-medium">{section.title}</span>
                </div>
                <p className="text-[12px] text-text-secondary leading-relaxed">
                  {section.body}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-4 rounded border border-border bg-card p-3">
          <p className="text-[12px] font-medium mb-1.5">{t("shortcutsTitle")}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[12px] text-text-secondary">
            <span><kbd className="rounded border border-border bg-background px-1.5 py-0.5">Ctrl</kbd> + <kbd className="rounded border border-border bg-background px-1.5 py-0.5">A</kbd> {t("shortcutSelectAll")}</span>
            <span><kbd className="rounded border border-border bg-background px-1.5 py-0.5">Ctrl</kbd> + <kbd className="rounded border border-border bg-background px-1.5 py-0.5">F</kbd> {t("shortcutFind")}</span>
            <span><kbd className="rounded border border-border bg-background px-1.5 py-0.5">Ctrl</kbd> + <kbd className="rounded border border-border bg-background px-1.5 py-0.5">Z</kbd> {t("shortcutUndo")}</span>
            <span><kbd className="rounded border border-border bg-background px-1.5 py-0.5">Esc</kbd> {t("shortcutClose")}</span>
            <span><kbd className="rounded border border-border bg-background px-1.5 py-0.5">Enter</kbd> {t("shortcutRun")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}