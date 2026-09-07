"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAppStore } from "@/store/use-store";
import {
  Zap,
  Wand2,
  Replace,
  Hash,
  Type,
  Eraser,
  Braces,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Check,
  TriangleAlert,
  X,
  ShieldCheck,
  Download,
} from "lucide-react";
import {
  generatePreview,
  detectDuplicates,
  autoResolveConflicts,
} from "@/lib/rename-engine";
import { signIn } from "next-auth/react";
import { downloadRenamedZip } from "@/lib/file-system";
import { getAnonymousId } from "@/lib/anonymous-session";
import RenameResultModal from "@/components/rename-result-modal";
import type { PreviewEntry, RenameResult } from "@/types";

interface ResultState {
  successful: number;
  failed: number;
  skipped: number;
  details: RenameResult[];
}

export default function RenamePanel() {
  const files = useAppStore((s) => s.files);
  const rule = useAppStore((s) => s.rule);
  const setRule = useAppStore((s) => s.setRule);
  const sortMode = useAppStore((s) => s.sortMode);
  const selectedCount = useAppStore((s) => s.selectedCount);
  const folderHandle = useAppStore((s) => s.folderHandle);
  const isRenaming = useAppStore((s) => s.isRenaming);
  const setRenaming = useAppStore((s) => s.setRenaming);
  const setRenameProgress = useAppStore((s) => s.setRenameProgress);
  const quota = useAppStore((s) => s.quota);
  const userState = useAppStore((s) => s.user);
  const setShowPayment = useAppStore((s) => s.setShowPayment);
  const setQuota = useAppStore((s) => s.setQuota);
  const addHistoryEntry = useAppStore((s) => s.addHistoryEntry);
  const conflictResolution = useAppStore((s) => s.conflictResolution);
  const setConflictResolution = useAppStore((s) => s.setConflictResolution);
  const confirmBeforeRename = useAppStore((s) => s.confirmBeforeRename);
  const preserveExtensions = useAppStore((s) => s.preserveExtensions);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<ResultState | null>(null);
  const cancelRequestedRef = useRef(false);
  const hasResult = result !== null;

  useEffect(() => {
    if (hasResult) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.target !== document.body) return;
      const button = document.getElementById("rename-run-button");
      if (button && !button.hasAttribute("disabled")) button.click();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [hasResult]);

  const preview: PreviewEntry[] = useMemo(() => {
    if (selectedCount === 0) return [];
    const raw = generatePreview(files, rule, sortMode, preserveExtensions);
    const detected = detectDuplicates(raw);
    return conflictResolution === "auto-resolve"
      ? autoResolveConflicts(detected)
      : detected;
  }, [files, rule, sortMode, selectedCount, conflictResolution, preserveExtensions]);

  const issues = useMemo(() => {
    const invalidCount = preview.filter((p) => p.status === "invalid").length;
    const duplicateCount = preview.filter((p) => p.status === "duplicate").length;
    const readyCount = preview.filter((p) => p.status === "ready").length;
    return { invalidCount, duplicateCount, readyCount };
  }, [preview]);

  const { invalidCount, duplicateCount, readyCount } = issues;
  const totalSelected = preview.length;

  const canRename =
    totalSelected > 0 &&
    readyCount > 0 &&
    invalidCount === 0 &&
    (conflictResolution === "auto-resolve" || duplicateCount === 0) &&
    !isRenaming;

  const hasFolderPermission = !!folderHandle;

  const refetchQuota = async () => {
    const anonymousId = getAnonymousId();
    const res = await fetch(
      `/api/quota${anonymousId ? `?anonymousId=${encodeURIComponent(anonymousId)}` : ""}`
    );
    const data = await res.json();
    if (data.error) return;
    if (data.isAuthenticated) {
      setQuota({
        type: "google",
        total: data.googleTotal + data.tokenBalance,
        used: data.googleUsed,
        remaining: data.totalRemaining,
      });
    } else {
      setQuota({
        type: "free",
        total: data.freeTotal,
        used: data.freeUsed,
        remaining: data.totalRemaining,
      });
    }
  };

  const consumeQuota = async (
    successful: number,
    operationId: string,
    summary: string
  ) => {
    const res = await fetch("/api/rename/consume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        successfulCount: successful,
        operationId,
        summary,
        anonymousId: getAnonymousId(),
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.error || "Gagal memperbarui kuota");
    }
    await refetchQuota();
  };

  const finishRename = async (
    readyEntries: PreviewEntry[],
    operationId: string
  ) => {
    const summary = `${rule.mode} - ${readyEntries.length} file`;
    const results: RenameResult[] = [];
    let successful = 0;
    const failed = 0;
    const skipped = 0;

    if (readyEntries.length > 0) {
      try {
        await consumeQuota(readyEntries.length, operationId, summary);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Gagal memperbarui kuota. Saldo Anda tetap tidak berubah."
        );
        setRenaming(false);
        return;
      }
      successful = readyEntries.length;
      results.push(
        ...readyEntries.map((p) => ({
          originalName: p.original,
          newName: p.newName,
          success: true,
        }))
      );
    }

    addHistoryEntry({
      id: operationId,
      files: files.filter((f) => f.selected),
      rule,
      results,
      timestamp: new Date(),
      successfulCount: successful,
      failedCount: failed,
      skippedCount: skipped,
    });

    setResult({ successful, failed, skipped, details: results });
  };

  const runZipFallback = async () => {
    const ready = preview.filter((p) => p.status === "ready");
    if (ready.length === 0) return;

    setErrorMessage(null);
    setRenaming(true);
    const operationId = crypto.randomUUID();

    setRenameProgress({
      total: ready.length,
      processed: 0,
      successful: 0,
      failed: 0,
    });

    let archived = 0;
    try {
      archived = await downloadRenamedZip(
        ready.map((p) => ({ file: p.file, newName: p.newName }))
      );
    } catch (error) {
      setErrorMessage(
        "Gagal membuat arsip ZIP. Coba lagi atau gunakan direktori yang mendukung penggantian nama langsung."
      );
      console.error("ZIP fallback failed:", error);
      setRenaming(false);
      return;
    }

    setRenameProgress({
      total: ready.length,
      processed: ready.length,
      successful: archived,
      failed: 0,
    });

    await finishRename(ready.slice(0, archived), operationId);
    setRenaming(false);
  };

  const runDirectRename = async () => {
    if (!hasFolderPermission) return;
    if (confirmBeforeRename && !window.confirm(`Ubah nama ${readyCount} file terpilih?`)) {
      return;
    }

    setErrorMessage(null);
    setRenaming(true);
    cancelRequestedRef.current = false;

    const operationId = crypto.randomUUID();
    const { renameFile } = await import("@/lib/file-system");

    const results: RenameResult[] = [];
    let successful = 0;
    let failed = 0;
    let skipped = 0;

    setRenameProgress({
      total: preview.length,
      processed: 0,
      successful: 0,
      failed: 0,
    });

    for (let i = 0; i < preview.length; i++) {
      const p = preview[i];

      const skipBecauseConflict =
        conflictResolution !== "auto-resolve" &&
        (p.status === "duplicate" || p.status === "invalid");

      if (p.status !== "ready" && !skipBecauseConflict) {
        skipped++;
        results.push({
          originalName: p.original,
          newName: p.newName,
          success: false,
          error: "Tidak dapat diubah",
        });
        setRenameProgress({
          total: preview.length,
          processed: i + 1,
          successful,
          failed,
        });
        continue;
      }

      if (skipBecauseConflict) {
        skipped++;
        results.push({
          originalName: p.original,
          newName: p.newName,
          success: false,
          error:
            p.status === "duplicate"
              ? "Nama target duplikat"
              : "Nama file tidak valid",
        });
        setRenameProgress({
          total: preview.length,
          processed: i + 1,
          successful,
          failed,
        });
        continue;
      }

      if (!p.file.handle) {
        skipped++;
        results.push({
          originalName: p.original,
          newName: p.newName,
          success: false,
          error: "Referensi file tidak tersedia",
        });
        setRenameProgress({
          total: preview.length,
          processed: i + 1,
          successful,
          failed,
        });
        continue;
      }

      const success = await renameFile(folderHandle, p.original, p.newName);

      if (success) {
        successful++;
        results.push({
          originalName: p.original,
          newName: p.newName,
          success: true,
        });
      } else {
        failed++;
        results.push({
          originalName: p.original,
          newName: p.newName,
          success: false,
          error: "Penggantian nama gagal. Pastikan file tidak terbuka atau terkunci.",
        });
      }

      setRenameProgress({
        total: preview.length,
        processed: i + 1,
        successful,
        failed,
      });

      if (cancelRequestedRef.current) break;
    }

    cancelRequestedRef.current = false;

    if (successful > 0) {
      try {
        await consumeQuota(
          successful,
          operationId,
          `${rule.mode} - ${successful} file`
        );
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Gagal memperbarui kuota. Saldo Anda tetap tidak berubah."
        );
      }
    }

    addHistoryEntry({
      id: operationId,
      files: files.filter((f) => f.selected),
      rule,
      results,
      timestamp: new Date(),
      successfulCount: successful,
      failedCount: failed,
      skippedCount: skipped,
    });

    setRenaming(false);

    setRenameProgress({
      total: preview.length,
      processed: preview.length,
      successful,
      failed,
    });

    const { refreshFileHandles } = useAppStore.getState();
    await refreshFileHandles();

    setResult({ successful, failed, skipped, details: results });
  };

  const handleSave = () => {
    if (hasResult) return;

    if (totalSelected === 0) return;

    if (invalidCount > 0) {
      setErrorMessage(
        `${invalidCount} file memiliki nama yang tidak valid. Perbaiki sebelum melanjutkan.`
      );
      return;
    }

    if (duplicateCount > 0 && conflictResolution !== "auto-resolve") {
      setErrorMessage(
        `Terjadi ${duplicateCount} nama target yang sama. Selesaikan konflik terlebih dahulu.`
      );
      return;
    }

    if (readyCount > quota.remaining) {
      setErrorMessage(
        `Anda memilih ${readyCount} file, tetapi hanya ${quota.remaining} file tersedia dalam kuota Anda saat ini.`
      );
      return;
    }

    if (hasFolderPermission) {
      runDirectRename();
    } else {
      runZipFallback();
    }
  };

  const renameModes = [
    { key: "prefix", label: "Awalan", icon: Type },
    { key: "suffix", label: "Akhiran", icon: Type },
    { key: "find-replace", label: "Temukan & Ganti", icon: Replace },
    { key: "numbering", label: "Penomoran", icon: Hash },
    { key: "case", label: "Huruf", icon: Type },
    { key: "remove", label: "Hapus Teks", icon: Eraser },
    { key: "pattern", label: "Pola", icon: Braces },
  ];

  const runButtonLabel = isRenaming
    ? "Mengganti nama..."
    : hasFolderPermission
    ? `UBAH NAMA ${readyCount} FILE${readyCount === 1 ? "" : "S"}`
    : `UNDUH ZIP (${readyCount} FILE${readyCount === 1 ? "" : "S"})`;

  return (
    <div className="flex w-[360px] shrink-0 flex-col border-l border-border bg-panel overflow-hidden min-h-0">
      {result && (
        <RenameResultModal
          successful={result.successful}
          failed={result.failed}
          skipped={result.skipped}
          details={result.details}
          onClose={() => setResult(null)}
        />
      )}

      <div className="flex h-10 shrink-0 items-center justify-between border-b border-border px-3">
        <div className="flex items-center gap-2">
          <Wand2 size={14} className="text-primary" />
          <span className="text-[13px] font-medium">Ubah Nama</span>
        </div>
        <button
          className="toolbar-button !p-1"
          onClick={() => setShowAdvanced(!showAdvanced)}
          aria-label="Tampilkan opsi lanjutan"
        >
          {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <div>
          <label className="label">Mode</label>
          <div className="flex flex-wrap gap-1">
            {renameModes.map((mode) => {
              const Icon = mode.icon;
              const isActive = rule.mode === mode.key;
              return (
                <button
                  key={mode.key}
                  className={`rounded px-2.5 py-1.5 text-[12px] font-medium transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? "bg-primary text-white"
                      : "bg-card text-text-secondary hover:bg-card-hover border border-border"
                  }`}
                  onClick={() => setRule({ mode: mode.key as typeof rule.mode })}
                >
                  <Icon size={12} />
                  {mode.label}
                </button>
              );
            })}
          </div>
        </div>

        {rule.mode === "prefix" && (
          <div>
            <label className="label">Awalan</label>
            <input
              className="input"
              placeholder="mis. Liburan_"
              value={rule.prefix}
              onChange={(e) => setRule({ prefix: e.target.value })}
            />
            <p className="mt-1 text-[11px] text-text-muted">
              Menambahkan teks di awal nama file
            </p>
          </div>
        )}

        {rule.mode === "suffix" && (
          <div>
            <label className="label">Akhiran</label>
            <input
              className="input"
              placeholder="mis. _Final"
              value={rule.suffix}
              onChange={(e) => setRule({ suffix: e.target.value })}
            />
            <p className="mt-1 text-[11px] text-text-muted">
              Menambahkan teks di akhir nama (sebelum ekstensi)
            </p>
          </div>
        )}

        {rule.mode === "find-replace" && (
          <>
            <div>
              <label className="label">Temukan</label>
              <input
                className="input"
                placeholder="Teks yang dicari"
                value={rule.findText}
                onChange={(e) => setRule({ findText: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Ganti dengan</label>
              <input
                className="input"
                placeholder="Teks pengganti"
                value={rule.replaceText}
                onChange={(e) => setRule({ replaceText: e.target.value })}
              />
            </div>
            <label className="flex items-center gap-2 text-[12px] text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={rule.caseSensitive}
                onChange={(e) => setRule({ caseSensitive: e.target.checked })}
                className="h-4 w-4"
              />
              Peka huruf besar/kecil
            </label>
          </>
        )}

        {rule.mode === "numbering" && (
          <>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="label">Mulai</label>
                <input
                  type="number"
                  className="input"
                  value={rule.startNumber}
                  onChange={(e) =>
                    setRule({ startNumber: Number(e.target.value) || 1 })
                  }
                />
              </div>
              <div>
                <label className="label">Kenaikan</label>
                <input
                  type="number"
                  className="input"
                  value={rule.increment}
                  onChange={(e) =>
                    setRule({ increment: Number(e.target.value) || 1 })
                  }
                />
              </div>
              <div>
                <label className="label">Padding</label>
                <input
                  type="number"
                  className="input"
                  value={rule.padding}
                  onChange={(e) =>
                    setRule({ padding: Number(e.target.value) || 1 })
                  }
                />
              </div>
            </div>
            <p className="text-[11px] text-text-muted">
              pratinjau: {String(rule.startNumber || 1).padStart(rule.padding || 3, "0")}
            </p>
          </>
        )}

        {rule.mode === "case" && (
          <div>
            <label className="label">Jenis Huruf</label>
            <select
              className="select"
              value={rule.caseType}
              onChange={(e) =>
                setRule({ caseType: e.target.value as typeof rule.caseType })
              }
            >
              <option value="uppercase">HURUF BESAR</option>
              <option value="lowercase">huruf kecil</option>
              <option value="title">Judul (Title Case)</option>
              <option value="sentence">Kalimat (Sentence case)</option>
            </select>
          </div>
        )}

        {rule.mode === "remove" && (
          <div>
            <label className="label">Teks yang dihapus</label>
            <input
              className="input"
              placeholder="Teks untuk dihapus"
              value={rule.removeText}
              onChange={(e) => setRule({ removeText: e.target.value })}
            />
            <p className="mt-1 text-[11px] text-text-muted">
              Menghapus semua kemunculan teks dari nama file
            </p>
          </div>
        )}

        {rule.mode === "pattern" && (
          <>
            <div>
              <label className="label">Pola</label>
              <input
                className="input"
                placeholder="mis. PPPK_{nnn}"
                value={rule.pattern}
                onChange={(e) => setRule({ pattern: e.target.value })}
              />
              <div className="mt-2 flex flex-wrap gap-1">
                {[
                  ["{name}", "Nama asli"],
                  ["{n}", "Angka 1"],
                  ["{nn}", "Angka 01"],
                  ["{nnn}", "Angka 001"],
                  ["{date}", "YYYY-MM-DD"],
                  ["{time}", "HH-MM-SS"],
                  ["{ext}", "Ekstensi"],
                ].map(([variable, desc]) => (
                  <button
                    key={variable}
                    className="rounded border border-border bg-card px-1.5 py-0.5 text-[10px] text-text-secondary hover:bg-card-hover"
                    onClick={() =>
                      setRule({ pattern: (rule.pattern || "") + variable })
                    }
                    title={desc}
                  >
                    {variable}
                  </button>
                ))}
              </div>
            </div>
            {showAdvanced && (
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="label">Mulai</label>
                  <input
                    type="number"
                    className="input"
                    value={rule.startNumber}
                    onChange={(e) =>
                      setRule({ startNumber: Number(e.target.value) || 1 })
                    }
                  />
                </div>
                <div>
                  <label className="label">Kenaikan</label>
                  <input
                    type="number"
                    className="input"
                    value={rule.increment}
                    onChange={(e) =>
                      setRule({ increment: Number(e.target.value) || 1 })
                    }
                  />
                </div>
                <div>
                  <label className="label">Padding</label>
                  <input
                    type="number"
                    className="input"
                    value={rule.padding}
                    onChange={(e) =>
                      setRule({ padding: Number(e.target.value) || 1 })
                    }
                  />
                </div>
              </div>
            )}
          </>
        )}

        {showAdvanced && (
          <div className="space-y-3 border-t border-border pt-3">
            <div>
              <label className="label">Penanganan Konflik</label>
              <select
                className="select"
                value={conflictResolution}
                onChange={(e) =>
                  setConflictResolution(
                    e.target.value as typeof conflictResolution
                  )
                }
              >
                <option value="auto-resolve">
                  Selesaikan otomatis (file (1).png)
                </option>
                <option value="skip">Lewati konflik</option>
                <option value="cancel">Batalkan seluruh operasi saat konflik</option>
              </select>
            </div>
          </div>
        )}

        <div className="border-t border-border pt-3">
          <div className="flex items-center justify-between mb-2">
            <label className="label !mb-0">Pratinjau Langsung</label>
            <button
              className="toolbar-button !p-1"
              onClick={() => setShowPreview(!showPreview)}
              aria-label="Tampilkan/sembunyikan pratinjau"
            >
              {showPreview ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {showPreview && (
            <div className="max-h-56 overflow-y-auto rounded border border-border bg-background">
              <div className="flex items-center gap-2 border-b border-border px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                <span className="flex-1">Sebelum</span>
                <ArrowRight size={11} />
                <span className="flex-1">Sesudah</span>
              </div>
              {preview.length === 0 ? (
                <p className="p-3 text-center text-[12px] text-text-muted">
                  Pilih file untuk melihat pratinjau
                </p>
              ) : (
                <div className="divide-y divide-border">
                  {preview.slice(0, 8).map((p, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-2.5 py-1.5 text-[12px]"
                    >
                      <span className="min-w-0 flex-1 truncate text-text-muted">
                        {p.original}
                      </span>
                      <ArrowRight size={10} className="shrink-0 text-text-muted" />
                      <span
                        className={`min-w-0 flex-1 truncate ${
                          p.status === "invalid"
                            ? "text-danger"
                            : p.status === "duplicate"
                            ? "text-warning"
                            : "text-text-primary"
                        }`}
                      >
                        {p.newName}
                      </span>
                      {p.status === "ready" && (
                        <Check size={12} className="shrink-0 text-success" />
                      )}
                      {p.status === "invalid" && (
                        <X size={12} className="shrink-0 text-danger" />
                      )}
                      {p.status === "duplicate" && (
                        <TriangleAlert size={12} className="shrink-0 text-warning" />
                      )}
                    </div>
                  ))}
                  {preview.length > 8 && (
                    <p className="px-2.5 py-1.5 text-[11px] text-text-muted">
                      +{preview.length - 8} lainnya
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="mt-2 space-y-1">
            {invalidCount > 0 && (
              <p className="flex items-center gap-1.5 text-[12px] text-danger">
                <X size={13} />
                {invalidCount} nama tidak valid
              </p>
            )}
            {duplicateCount > 0 && (
              <p className="flex items-center gap-1.5 text-[12px] text-warning">
                <TriangleAlert size={13} />
                {duplicateCount} duplikat
              </p>
            )}
            {readyCount > 0 && (
              <p className="flex items-center gap-1.5 text-[12px] text-success">
                <Check size={13} />
                {readyCount} siap
              </p>
            )}
          </div>
        </div>

        {!hasFolderPermission && (
          <div className="flex items-start gap-2 rounded border border-warning-soft bg-warning-soft p-2.5 text-[12px] text-warning">
            <ShieldCheck size={14} className="mt-0.5 shrink-0" />
            <p>
              Mode cadangan: mengunduh file yang diubah namanya dalam arsip ZIP.
              Untuk mengubah nama file langsung di folder, buka folder yang
              mendukung File System Access.
            </p>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-border p-3">
        {isRenaming && hasFolderPermission ? (
          <button
            className="btn btn-danger btn-lg w-full text-[14px] font-semibold"
            onClick={() => {
              cancelRequestedRef.current = true;
            }}
          >
            <X size={16} />
            Batalkan
          </button>
        ) : (
          <button
            id="rename-run-button"
            className="btn btn-primary btn-lg w-full text-[14px] font-semibold"
            disabled={!canRename || totalSelected === 0}
            onClick={handleSave}
          >
            {hasFolderPermission ? <Zap size={16} /> : <Download size={16} />}
            {runButtonLabel}
          </button>
        )}

        {!userState && quota.remaining <= 0 && readyCount > 0 && (
          <div className="mt-2 space-y-1.5">
            <div className="rounded border border-warning-soft bg-warning-soft p-2 text-[11px] text-warning">
              Kuota gratis Anda telah terpakai. Mendaftar atau membeli token
              menambah batas file.
            </div>
            <button
              className="btn btn-secondary w-full"
              onClick={() => signIn("google")}
            >
              Masuk dengan Google
            </button>
            <button
              className="btn btn-primary w-full"
              onClick={() => setShowPayment(true)}
            >
              Beli Token
            </button>
          </div>
        )}

        {errorMessage && (
          <p className="mt-2 text-[12px] text-danger">{errorMessage}</p>
        )}
      </div>
    </div>
  );
}