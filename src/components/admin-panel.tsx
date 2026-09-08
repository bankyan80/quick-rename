"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
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
  ArrowLeft,
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

interface AdminPanelProps {
  variant: "modal" | "page";
  onClose?: () => void;
}

export default function AdminPanel({ variant, onClose }: AdminPanelProps) {
  const t = useTranslations("adminModal");
  const tPage = useTranslations("panelAdmin");
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
        if (!cancelled) setError(t("loadError"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tab, refreshOrders, refreshUsers, refreshSettings, t]);

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
        setError(data.error || t("actionFailed"));
      } else {
        const result = await refreshOrders();
        setOrders(result);
      }
    } catch {
      setError(t("networkError"));
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
      setError(t("actionFailed"));
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
      alert(t("saved"));
    } catch {
      setError(t("actionFailed"));
    }
  };

  if (unauthorized) {
    return (
      <div
        className={variant === "modal" ? "modal-overlay" : "flex flex-1 items-center justify-center p-5"}
        onClick={variant === "modal" ? onClose : undefined}
      >
        <div
          className={`${
            variant === "modal" ? "modal w-full max-w-sm p-5 text-center" : "card w-full max-w-sm p-6 text-center"
          }`}
        >
          <Shield size={40} className="mx-auto mb-3 text-danger" />
          <p className="text-[15px] font-semibold">{t("unauthorizedTitle")}</p>
          <p className="mt-1 text-[13px] text-text-secondary mb-4">
            {t("unauthorizedBody")}
          </p>
          {variant === "page" ? (
            <Link href="/" className="btn btn-secondary w-full">
              <ArrowLeft size={15} />
              {tPage("back")}
            </Link>
          ) : (
            <button
              className="btn btn-secondary w-full"
              onClick={onClose}
            >
              {t("closeAria")}
            </button>
          )}
        </div>
      </div>
    );
  }

  const content = (
    <>
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="flex items-center gap-2 text-[16px] font-semibold">
          <Shield size={16} className="text-primary" />
          {variant === "page" ? tPage("title") : t("title")}
        </h2>
        {variant === "page" ? (
          <Link
            href="/"
            className="toolbar-button !p-1.5 text-[13px]"
            aria-label={tPage("back")}
          >
            <ArrowLeft size={16} />
            <span>{tPage("back")}</span>
          </Link>
        ) : (
          <button
            className="toolbar-button !p-1"
            onClick={onClose}
            aria-label={t("closeAria")}
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="flex gap-1 border-b border-border px-5 py-2">
        {(
          [
            ["orders", t("tabOrders")],
            ["users", t("tabUsers")],
            ["settings", t("tabSettings")],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            className={`toolbar-button rounded ${
              tab === key ? "bg-primary-soft text-primary" : ""
            }`}
            onClick={() => {
              setLoading(true);
              setTab(key);
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div
        className={
          variant === "modal"
            ? "max-h-[70vh] overflow-y-auto p-5"
            : "overflow-y-auto p-5"
        }
      >
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
                {t("ordersEmpty")}
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
                      <span className="text-text-muted">{t("proofPrefix")}</span>{" "}
                      {o.proof.reference || o.proof.notes || t("proofDefault")}
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
                        {t("acceptLabel", { count: o.fileQuantity })}
                      </button>
                      <button
                        className="btn btn-secondary !h-8 text-[12px]"
                        onClick={() => handleOrderAction(o.id, "reject")}
                        disabled={loading}
                      >
                        <XCircle size={14} />
                        {t("reject")}
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
              {t("usersHint")}
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
                        {u.email} · {t("balance", { count: u.tokenAccount?.balance ?? 0 })}
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
                      title={t("addFilesTitle")}
                      onClick={() =>
                        handleUserAction(u.id, "adjust-token", { tokenAdjustment: 100 })
                      }
                    >
                      <Plus size={13} />
                    </button>
                    <button
                      className="btn btn-secondary !h-7 !px-2"
                      title={t("removeFilesTitle")}
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
              {t("settingsHint")}
            </div>
            <div>
              <label className="label">{t("danaName")}</label>
              <input
                className="input"
                value={settings.danaPaymentName}
                onChange={(e) =>
                  setSettings({ ...settings, danaPaymentName: e.target.value })
                }
                placeholder={t("danaNamePlaceholder")}
              />
            </div>
            <div>
              <label className="label">{t("danaNumber")}</label>
              <input
                className="input"
                value={settings.danaPaymentNumber}
                onChange={(e) =>
                  setSettings({ ...settings, danaPaymentNumber: e.target.value })
                }
                placeholder={t("danaNumberPlaceholder")}
              />
            </div>
            <div>
              <label className="label">{t("qrisUrl")}</label>
              <input
                className="input"
                value={settings.qrisImageUrl}
                onChange={(e) =>
                  setSettings({ ...settings, qrisImageUrl: e.target.value })
                }
                placeholder={t("qrisUrlPlaceholder")}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">{t("tokenPrice")}</label>
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
                <label className="label">{t("filesPerToken")}</label>
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
              {t("save")}
            </button>
          </div>
        )}
      </div>
    </>
  );

  if (variant === "modal") {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div
          className="modal w-full max-w-3xl"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-label={t("title")}
        >
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col px-4 pt-5 pb-10 h-full min-h-0">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border bg-panel">
        {content}
      </div>
    </div>
  );
}