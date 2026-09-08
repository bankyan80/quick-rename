"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/use-store";
import { useTranslations } from "next-intl";
import { X, LogOut, Shield, User as UserIcon } from "lucide-react";
import { signOut, signIn } from "next-auth/react";
import { refreshUserQuota } from "@/lib/quota-client";

interface ProfileOrder {
  id: string;
  orderNumber: string;
  paymentMethod: string;
  amount: number;
  status: string;
}

export default function ProfileModal() {
  const t = useTranslations("profileModal");
  const setShowProfile = useAppStore((s) => s.setShowProfile);
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);
  const quota = useAppStore((s) => s.quota);
  const setQuota = useAppStore((s) => s.setQuota);
  const setShowPayment = useAppStore((s) => s.setShowPayment);
  const setShowAdmin = useAppStore((s) => s.setShowAdmin);
  const isAdmin = useAppStore((s) => s.isAdmin);
  const [orders, setOrders] = useState<ProfileOrder[]>([]);

  useEffect(() => {
    refreshUserQuota();
    if (user) {
      fetch("/api/payment/orders")
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) setOrders(data.orders || []);
        })
        .catch(() => {});
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    setUser(null);
    setQuota({ type: "free", total: 5, used: 0, remaining: 5 });
    setShowProfile(false);
  };

  return (
    <div className="modal-overlay" onClick={() => setShowProfile(false)}>
      <div
        className="modal w-full max-w-md p-5"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={t("ariaLabel")}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center gap-2 text-[16px] font-semibold">
            <UserIcon size={16} className="text-primary" />
            {t("title")}
          </h2>
          <button
            className="toolbar-button !p-1"
            onClick={() => setShowProfile(false)}
            aria-label={t("closeAria")}
          >
            <X size={16} />
          </button>
        </div>

        {user ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {user.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-semibold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[14px] font-medium">{user.name}</p>
                  {isAdmin && (
                    <span className="rounded bg-primary-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                      {t("adminBadge")}
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-text-muted">{user.email}</p>
              </div>
            </div>

            <div className="rounded border border-border bg-card p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted mb-2">
                {t("quotaBalance")}
              </p>
              <div className="space-y-1.5 text-[13px]">
                <p className="flex justify-between">
                  <span className="text-text-secondary">{t("googleUsed")}</span>
                  <span className="font-medium">
                    {quota.used} / {quota.total <= 10 ? quota.total : 10}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-text-secondary">{t("tokenBalance")}</span>
                  <span className="font-medium">
                    {t("tokenBalanceValue", { count: Math.max(0, quota.remaining) })}
                  </span>
                </p>
              </div>
            </div>

            <div>
              <button
                className="btn btn-primary w-full"
                onClick={() => {
                  setShowProfile(false);
                  setShowPayment(true);
                }}
              >
                {t("buyToken")}
              </button>

              {isAdmin && (
                <button
                  className="btn btn-secondary w-full mt-2"
                  onClick={() => {
                    setShowProfile(false);
                    setShowAdmin(true);
                  }}
                >
                  <Shield size={15} />
                  {t("adminPanel")}
                </button>
              )}
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted mb-2">
                {t("purchaseHistory")}
              </p>
              {orders.length === 0 ? (
                <p className="text-[12px] text-text-muted">{t("noOrders")}</p>
              ) : (
                <div className="max-h-40 overflow-y-auto space-y-1.5">
                  {orders.map((o) => (
                    <div
                      key={o.id}
                      className="flex items-center justify-between rounded border border-border px-2.5 py-1.5 text-[11px]"
                    >
                      <span className="font-mono text-text-secondary">
                        {o.orderNumber}
                      </span>
                      <span className="text-text-muted">
                        {o.paymentMethod} · Rp
                        {o.amount.toLocaleString("id-ID")}
                      </span>
                      <span
                        className={
                          o.status === "APPROVED"
                            ? "text-success"
                            : o.status === "REJECTED"
                            ? "text-danger"
                            : "text-warning"
                        }
                      >
                        {o.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              className="btn btn-ghost w-full text-danger"
              onClick={handleLogout}
            >
              <LogOut size={15} />
              {t("logout")}
            </button>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-[14px] text-text-secondary mb-4">
              {t("guestPrompt")}
            </p>
            <button
              className="btn btn-primary w-full"
              onClick={() => signIn("google")}
            >
              {t("continueWithGoogle")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}