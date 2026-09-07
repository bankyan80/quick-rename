"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/store/use-store";
import {
  X,
  Shield,
  CheckCircle2,
  XCircle,
  Loader2,
  Plus,
  Minus,
  Users,
  Settings2,
} from "lucide-react";

type Tab = "orders" | "users" | "settings";

interface PaymentOrderRow {
  id: string;
  orderNumber: string;
  tokenQuantity: number;
  fileQuantity: number;
  amount: number;
  paymentMethod: string;
  status: string;
  user?: { name?: string | null; email?: string | null };
  proof?: { reference?: string | null; notes?: string | null; submittedAt: string };
}

interface UserRow {
  id: string;
  name: string | null;
  email: string | null;
  avatarUrl?: string | null;
  role: string;
  tokenAccount?: { balance: number } | null;
}

interface AdminSettings {
  danaPaymentName: string;
  danaPaymentNumber: string;
  qrisImageUrl: string;
  tokenPrice: number;
  filesPerToken: number;
}

export default function AdminModal() {
  const setShowAdmin = useAppStore((s) => s.setShowAdmin);
  const [tab, setTab] = useState<Tab>("orders");
  const [orders, setOrders] = useState<PaymentOrderRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [settings, setSettings] = useState<AdminSettings>({
    danaPaymentName: "",
    danaPaymentNumber: "",
    qrisImageUrl: "",
    tokenPrice: 50000,
    filesPerToken: 100,
  });

  const refreshOrders = useCallback(async (): Promise<PaymentOrderRow[]> => {
    const res = await fetch("/api/admin/orders");
    if (res.status === 403) {
      setUnauthorized(true);
      return [];
    }
    const data = await res.json();
    return data.error ? [] : (data.orders as PaymentOrderRow[]);
  }, []);

  const refreshUsers = useCallback(async (): Promise<UserRow[]> => {
    const res = await fetch("/api/admin/users");
    if (res.status === 403) {
      setUnauthorized(true);
      return [];
    }
    const data = await res.json();
    return data.error ? [] : (data.users as UserRow[]);
  }, []);

  const refreshSettings = useCallback(async (): Promise<AdminSettings | null> => {
    const res = await fetch("/api/admin/settings");
    if (res.ok) {
      const data = await res.json();
      if (!data.error) return data as AdminSettings;
    }
    return null;
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        if (tab === "orders") {
          const result = await refreshOrders();
          if (!cancelled) setOrders(result);
        } else if (tab === "users") {
          const result = await refreshUsers();
          if (!cancelled) setUsers(result);
        } else {
          const result = await refreshSettings();
          if (!cancelled && result) setSettings(result);
        }
      } catch {
        if (!cancelled) setError("Gagal memuat data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tab, refreshOrders, refreshUsers, refreshSettings]);

  const handleOrderAction = async (orderId: string, action: "approve" | "reject") => {
    setError(null);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Tindakan gagal");
      } else {
        const result = await refreshOrders();
        setOrders(result);
      }
    } catch {
      setError("Kesalahan jaringan");
    }
  };

  const handleUserAction = async (
    userId: string,
    action: string,
    value: { role?: string; tokenAdjustment?: number }
  ) => {
    setError(null);
    try {
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, ...value }),
      });
      const result = await refreshUsers();
      setUsers(result);
    } catch {
      setError("Tindakan gagal");
    }
  };

  const handleSaveSettings = async () => {
    setError(null);
    try {
      await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          danaPaymentName: settings.danaPaymentName,
          danaPaymentNumber: settings.danaPaymentNumber,
          qrisImageUrl: settings.qrisImageUrl,
          tokenPrice: String(settings.tokenPrice),
          filesPerToken: String(settings.filesPerToken),
        }),
      });
      alert("Pengaturan disimpan");
    } catch {
      setError("Gagal menyimpan pengaturan");
    }
  };

  if (unauthorized) {
    return (
      <div className="modal-overlay" onClick={() => setShowAdmin(false)}>
        <div className="modal w-full max-w-sm p-5 text-center">
          <Shield size={40} className="mx-auto mb-3 text-danger" />
          <p className="text-[15px] font-semibold">Tidak Diizinkan</p>
          <p className="mt-1 text-[13px] text-text-secondary mb-4">
            Anda tidak memiliki akses admin. Hubungi administrator.
          </p>
          <button className="btn btn-secondary w-full" onClick={() => setShowAdmin(false)}>
            Tutup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={() => setShowAdmin(false)}>
      <div
        className="modal w-full max-w-3xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Panel admin"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="flex items-center gap-2 text-[16px] font-semibold">
            <Shield size={16} className="text-primary" />
            Panel Admin
          </h2>
          <button
            className="toolbar-button !p-1"
            onClick={() => setShowAdmin(false)}
            aria-label="Tutup admin"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex gap-1 border-b border-border px-5 py-2">
          {(
            [
              ["orders", "Pesanan Pembayaran"],
              ["users", "Pengguna"],
              ["settings", "Pengaturan"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              className={`toolbar-button rounded ${tab === key ? "bg-primary-soft text-primary" : ""}`}
              onClick={() => {
                setLoading(true);
                setTab(key);
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-5">
          {error && (
            <p className="mb-3 rounded border border-danger-soft bg-danger-soft px-3 py-2 text-[12px] text-danger">
              {error}
            </p>
          )}

          {tab === "orders" && (
            <div className="space-y-2">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 size={24} className="animate-spin text-primary" />
                </div>
              ) : orders.length === 0 ? (
                <p className="py-6 text-center text-text-muted text-[13px]">
                  Belum ada pesanan pembayaran.
                </p>
              ) : (
                orders.map((o) => (
                  <div
                    key={o.id}
                    className="rounded border border-border bg-card p-3"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <p className="font-mono text-[13px] font-medium">
                          {o.orderNumber}
                        </p>
                        <p className="text-[11px] text-text-muted mt-0.5">
                          {o.user?.name} · {o.user?.email}
                        </p>
                      </div>
                      <span
                        className={`badge ${
                          o.status === "APPROVED"
                            ? "bg-success-soft text-success"
                            : o.status === "REJECTED"
                            ? "bg-danger-soft text-danger"
                            : o.status === "WAITING_VERIFICATION"
                            ? "bg-warning-soft text-warning"
                            : "bg-card text-text-muted border border-border"
                        }`}
                      >
                        {o.status}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-3 text-[12px] text-text-secondary">
                      <span>{o.paymentMethod}</span>
                      <span className="text-text-muted">·</span>
                      <span>{o.tokenQuantity} token</span>
                      <span className="text-text-muted">·</span>
                      <span>{o.fileQuantity} file</span>
                      <span className="text-text-muted">·</span>
                      <span className="font-medium">
                        Rp{o.amount.toLocaleString("id-ID")}
                      </span>
                    </div>

                    {o.proof && (
                      <div className="mt-2 rounded bg-background px-2.5 py-1.5 text-[11px] text-text-secondary">
                        <span className="text-text-muted">Bukti:</span>{" "}
                        {o.proof.reference || o.proof.notes || "Dikirim"}
                        <span className="text-text-muted"> · </span>
                        {new Date(o.proof.submittedAt).toLocaleString()}
                      </div>
                    )}

                    {(o.status === "PENDING" ||
                      o.status === "WAITING_VERIFICATION") && (
                      <div className="mt-2 flex gap-2">
                        <button
                          className="btn btn-primary !h-8 text-[12px]"
                          onClick={() => handleOrderAction(o.id, "approve")}
                          disabled={loading}
                        >
                          <CheckCircle2 size={14} />
                          Setujui (+{o.fileQuantity} file)
                        </button>
                        <button
                          className="btn btn-secondary !h-8 text-[12px]"
                          onClick={() => handleOrderAction(o.id, "reject")}
                          disabled={loading}
                        >
                          <XCircle size={14} />
                          Tolak
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "users" && (
            <div>
              <div className="mb-3 flex items-center gap-2 text-[12px] text-text-secondary">
                <Users size={14} />
                Kelola peran pengguna dan saldo token
              </div>
              <div className="space-y-2">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between rounded border border-border bg-card p-3"
                  >
                    <div className="min-w-0 flex items-center gap-2.5">
                      {u.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={u.avatarUrl}
                          alt=""
                          className="h-7 w-7 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[11px] text-white">
                          {u.name?.charAt(0)?.toUpperCase() || "?"}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium">
                          {u.name}
                        </p>
                        <p className="truncate text-[11px] text-text-muted">
                          {u.email} · saldo: {u.tokenAccount?.balance ?? 0} file
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <select
                        className="select !h-7 !w-32 !text-[11px]"
                        value={u.role}
                        onChange={(e) =>
                          handleUserAction(u.id, "set-role", { role: e.target.value })
                        }
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                      <button
                        className="btn btn-secondary !h-7 !px-2"
                        title="Tambah 100 file"
                        onClick={() =>
                          handleUserAction(u.id, "adjust-token", { tokenAdjustment: 100 })
                        }
                      >
                        <Plus size={13} />
                      </button>
                      <button
                        className="btn btn-secondary !h-7 !px-2"
                        title="Kurangi 100 file"
                        onClick={() =>
                          handleUserAction(u.id, "adjust-token", { tokenAdjustment: -100 })
                        }
                      >
                        <Minus size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "settings" && (
            <div className="space-y-4 max-w-md">
              <div className="flex items-center gap-2 text-[12px] text-text-secondary">
                <Settings2 size={14} />
                Konfigurasi pembayaran
              </div>
              <div>
                <label className="label">Nama pembayaran DANA</label>
                <input
                  className="input"
                  value={settings.danaPaymentName}
                  onChange={(e) =>
                    setSettings({ ...settings, danaPaymentName: e.target.value })
                  }
                  placeholder="a.n. nama yang ditampilkan ke pembeli"
                />
              </div>
              <div>
                <label className="label">Nomor telepon DANA</label>
                <input
                  className="input"
                  value={settings.danaPaymentNumber}
                  onChange={(e) =>
                    setSettings({ ...settings, danaPaymentNumber: e.target.value })
                  }
                  placeholder="08xx..."
                />
              </div>
              <div>
                <label className="label">URL gambar QRIS</label>
                <input
                  className="input"
                  value={settings.qrisImageUrl}
                  onChange={(e) =>
                    setSettings({ ...settings, qrisImageUrl: e.target.value })
                  }
                  placeholder="/qris.png atau https://..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Harga token (Rp)</label>
                  <input
                    type="number"
                    className="input"
                    value={settings.tokenPrice}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        tokenPrice: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="label">File per token</label>
                  <input
                    type="number"
                    className="input"
                    value={settings.filesPerToken}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        filesPerToken: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <button
                className="btn btn-primary"
                onClick={handleSaveSettings}
              >
                Simpan Pengaturan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}