"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store/use-store";
import { useTranslations } from "next-intl";
import { X, Zap, CreditCard, CheckCircle2, Loader2, Download } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { refreshUserQuota } from "@/lib/quota-client";

const TOKEN_PRICE = Number(process.env.NEXT_PUBLIC_TOKEN_PRICE || 50000);

interface PaymentOrderEntry {
  id: string;
  orderNumber: string;
  status: string;
}

export default function PaymentModal() {
  const t = useTranslations("paymentModal");
  const setShowPayment = useAppStore((s) => s.setShowPayment);
  const { data: session } = useSession();

  const [step, setStep] = useState<"select" | "instructions" | "done">("select");
  const [method, setMethod] = useState<"DANA" | "QRIS" | null>(null);
  const [order, setOrder] = useState<PaymentOrderEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proof, setProof] = useState("");

  useEffect(() => {
    refreshUserQuota();
  }, []);
  const [orders, setOrders] = useState<PaymentOrderEntry[]>([]);
  const [danaNumber, setDanaNumber] = useState("");
  const [danaName, setDanaName] = useState("");
  const [qrisUrl, setQrisUrl] = useState("");
  const [zoomOpen, setZoomOpen] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (!data.error) {
          setDanaNumber(data.danaPaymentNumber || "");
          setDanaName(data.danaPaymentName || "");
          setQrisUrl(data.qrisImageUrl || "");
        }
      } catch {}
    };
    loadSettings();

    const loadOrders = async () => {
      try {
        const res = await fetch("/api/payment/orders");
        const data = await res.json();
        if (!data.error) setOrders(data.orders || []);
      } catch {}
    };
    loadOrders();
  }, []);

  const handleCreateOrder = async (paymentMethod: "DANA" | "QRIS") => {
    if (!session?.user) {
      await signIn("google");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/payment/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenQuantity: 1,
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("createOrderError"));
        setLoading(false);
        return;
      }
      setOrder(data.order);
      setMethod(paymentMethod);
      setStep("instructions");
    } catch {
      setError(t("networkError"));
    }
    setLoading(false);
  };

  const handleSubmitProof = async () => {
    if (!order) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/payment/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: proof || t("submitProof"),
          notes: proof,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("submitProofError"));
        setLoading(false);
        return;
      }
      setStep("done");
    } catch {
      setError(t("networkErrorShort"));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!zoomOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomOpen]);

  const downloadQris = async () => {
    if (!qrisUrl) return;
    try {
      const res = await fetch(qrisUrl);
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "qris.png";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(link.href);
    } catch {
      window.open(qrisUrl, "_blank", "noopener,noreferrer");
    }
  };

  const amount = TOKEN_PRICE.toLocaleString("id-ID");

  return (
    <div className="modal-overlay" onClick={() => setShowPayment(false)}>
      <div
        className="modal w-full max-w-md p-5"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={t("title")}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-semibold flex items-center gap-2">
            <Zap size={16} className="text-primary" />
            {t("title")}
          </h2>
          <button
            className="toolbar-button !p-1"
            onClick={() => setShowPayment(false)}
            aria-label={t("closeAria")}
          >
            <X size={16} />
          </button>
        </div>

        {step === "select" && (
          <>
            <div className="card p-4 mb-4">
              <div className="text-center py-2">
                <p className="text-[24px] font-bold">{t("cardToken")}</p>
                <p className="text-[15px] text-text-secondary mt-1">
                  {t("cardFiles")}
                </p>
                <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-primary-soft px-4 py-1.5 text-[18px] font-bold text-primary">
                  Rp{amount}
                </p>
                <p className="mt-2 text-[11px] text-text-muted">
                  {t("unitNote")}
                </p>
              </div>
            </div>

            {session?.user ? (
              <p className="mb-3 text-center text-[12px] text-text-secondary">
                {t("buyAs", { email: session.user.email || "" })}
              </p>
            ) : (
              <p className="mb-3 text-center text-[12px] text-warning">
                {t("mustSignIn")}
              </p>
            )}

            <div className="space-y-2">
              <button
                className="btn btn-secondary flex w-full items-center justify-center gap-2 !h-11"
                onClick={() => handleCreateOrder("DANA")}
                disabled={loading || !session?.user}
              >
                {loading && method === "DANA" ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <CreditCard size={16} />
                )}
                {t("payDana")}
              </button>
              <button
                className="btn btn-primary flex w-full items-center justify-center gap-2 !h-11"
                onClick={() => handleCreateOrder("QRIS")}
                disabled={loading || !session?.user}
              >
                {loading && method === "QRIS" ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <CreditCard size={16} />
                )}
                {t("payQris")}
              </button>
            </div>

            {!session?.user && (
              <button
                className="btn btn-ghost mt-2 w-full text-[12px] text-primary"
                onClick={() => signIn("google")}
              >
                {t("signInFirst")}
              </button>
            )}

            {error && <p className="mt-2 text-[12px] text-danger">{error}</p>}

            {orders.length > 0 && (
              <div className="mt-4 border-t border-border pt-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted mb-2">
                  {t("yourOrders")}
                </p>
                <div className="max-h-32 overflow-y-auto space-y-1.5">
                  {orders.slice(0, 5).map((o) => (
                    <div
                      key={o.id}
                      className="flex items-center justify-between rounded border border-border px-2.5 py-1.5 text-[11px]"
                    >
                      <span className="font-mono text-text-secondary">
                        {o.orderNumber}
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
              </div>
            )}
          </>
        )}

        {step === "instructions" && order && (
          <div className="space-y-3">
            <p className="text-[13px] font-medium">
              {t("completePay", { method: method ?? "" })}
            </p>

            <div className="rounded border border-border bg-card p-3">
              <p className="text-[11px] text-text-muted mb-1.5">{t("orderNumber")}</p>
              <p className="font-mono text-[13px] font-medium">{order.orderNumber}</p>
            </div>

            {method === "DANA" && (
              <div className="rounded border border-border bg-card p-3">
                <p className="text-[11px] text-text-muted mb-1.5">
                  {t("sendToDana")}
                </p>
                <p className="text-[15px] font-semibold">
                  {danaNumber || t("danaNotConfigured")}
                </p>
                {danaName && (
                  <p className="text-[12px] text-text-secondary mt-0.5">
                    a.n. {danaName}
                  </p>
                )}
                <p className="mt-1.5 text-[12px] text-text-secondary">
                  {t("amountLabel")}: <span className="font-semibold">Rp{amount}</span>
                </p>
              </div>
            )}

            {method === "QRIS" && (
              <div className="rounded border border-border bg-card p-3 text-center">
                <p className="text-[11px] text-text-muted mb-2">
                  {t("scanQris")}
                </p>
                {qrisUrl ? (
                  <>
                    <button
                      type="button"
                      className="block cursor-zoom-in rounded"
                      onClick={() => setZoomOpen(true)}
                      aria-label={t("zoomQris")}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={qrisUrl}
                        alt={t("qrisAlt")}
                        className="mx-auto h-40 w-40 rounded object-contain"
                      />
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost mt-2 w-full text-[12px]"
                      onClick={downloadQris}
                    >
                      <Download size={14} />
                      {t("downloadQris")}
                    </button>
                  </>
                ) : (
                  <p className="text-[12px] text-text-muted">
                    {t("qrisNotConfigured")}
                  </p>
                )}
                <p className="mt-2 text-[12px] text-text-secondary">
                  {t("amountLabel")}: <span className="font-semibold">Rp{amount}</span>
                </p>
              </div>
            )}

            <div>
              <label className="label">
                {t("proofLabel")}
              </label>
              <input
                className="input"
                placeholder={t("proofPlaceholder")}
                value={proof}
                onChange={(e) => setProof(e.target.value)}
              />
            </div>

            <p className="text-[11px] text-text-muted leading-snug">
              {t.rich("afterPay", {
                bold: (chunks) => (
                  <span className="font-semibold">{chunks}</span>
                ),
                files: 100,
              })}
            </p>

            {error && <p className="text-[12px] text-danger">{error}</p>}

            <div className="flex gap-2">
              <button
                className="btn btn-secondary flex-1"
                onClick={() => setStep("select")}
                disabled={loading}
              >
                {t("back")}
              </button>
              <button
                className="btn btn-primary flex-1"
                onClick={handleSubmitProof}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  t("submitProof")
                )}
              </button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="text-center py-6">
            <CheckCircle2 size={48} className="mx-auto mb-3 text-success" />
            <p className="text-[16px] font-semibold">{t("doneTitle")}</p>
            <p className="mt-1 text-[13px] text-text-secondary mb-4">
              {t.rich("doneDesc", {
                bold: (chunks) => (
                  <span className="font-medium text-warning">{chunks}</span>
                ),
                files: 100,
              })}
            </p>
            <button
              className="btn btn-primary w-full"
              onClick={() => setShowPayment(false)}
            >
              {t("closeAria")}
            </button>
          </div>
        )}
      </div>

      {zoomOpen && qrisUrl && (
        <div
          className="modal-overlay"
          style={{ zIndex: 120 }}
          onClick={(e) => {
            e.stopPropagation();
            setZoomOpen(false);
          }}
          role="dialog"
          aria-label={t("zoomQris")}
        >
          <div
            className="relative flex flex-col items-center gap-3 rounded-xl bg-card p-4"
            style={{ maxWidth: "90vw", maxHeight: "85vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="toolbar-button absolute right-2 top-2 !p-1"
              onClick={() => setZoomOpen(false)}
              aria-label={t("closeAria")}
            >
              <X size={18} />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrisUrl}
              alt={t("qrisAlt")}
              className="mt-4 rounded object-contain"
              style={{ maxWidth: "85vw", maxHeight: "70vh" }}
            />
            <button
              type="button"
              className="btn btn-primary w-full"
              onClick={downloadQris}
            >
              <Download size={15} />
              {t("downloadQris")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}