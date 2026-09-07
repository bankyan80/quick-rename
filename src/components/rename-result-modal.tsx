"use client";

import { CheckCircle2, XCircle, AlertTriangle, X, History } from "lucide-react";
import { useAppStore } from "@/store/use-store";

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
  const setShowHistory = useAppStore((s) => s.setShowHistory);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal w-full max-w-lg p-5"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Hasil penggantian nama"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-semibold">Hasil Penggantian Nama</h2>
          <button
            className="toolbar-button !p-1"
            onClick={onClose}
            aria-label="Tutup hasil"
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
            <div className="text-[11px] text-text-secondary">Berhasil</div>
          </div>
          <div className="rounded border border-danger-soft bg-danger-soft p-3 text-center">
            <XCircle size={18} className="mx-auto mb-1 text-danger" />
            <div className="text-[20px] font-semibold text-danger">{failed}</div>
            <div className="text-[11px] text-text-secondary">Gagal</div>
          </div>
          <div className="rounded border border-warning-soft bg-warning-soft p-3 text-center">
            <AlertTriangle size={18} className="mx-auto mb-1 text-warning" />
            <div className="text-[20px] font-semibold text-warning">{skipped}</div>
            <div className="text-[11px] text-text-secondary">Dilewati</div>
          </div>
        </div>

        {details.length > 0 && (
          <div className="max-h-64 overflow-y-auto rounded border border-border">
            <table className="w-full text-[12px]">
              <thead className="sticky top-0 bg-card">
                <tr className="text-left text-text-muted">
                  <th className="px-2.5 py-1.5 font-medium">Nama Asli</th>
                  <th className="px-2.5 py-1.5 font-medium">Nama Baru</th>
                  <th className="px-2.5 py-1.5 font-medium">Status</th>
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
                        <span className="text-success">Berhasil</span>
                      ) : d.skipped ? (
                        <span className="text-warning">Dilewati</span>
                      ) : (
                        <span className="text-danger" title={d.error}>
                          Gagal
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
            Lihat Riwayat
          </button>
          <button
            className="btn btn-primary btn-lg flex-1"
            onClick={onClose}
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
