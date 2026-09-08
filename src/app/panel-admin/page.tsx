"use client";

import { useSession, signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Loader2, Shield, Sparkles } from "lucide-react";
import AdminPanel from "@/components/admin-panel";

export default function PanelAdminPage() {
  const t = useTranslations("panelAdmin");
  const { status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-1 items-center justify-center p-5">
        <div className="card w-full max-w-sm p-6 text-center">
          <Shield size={40} className="mx-auto mb-3 text-primary" />
          <p className="text-[15px] font-semibold">{t("signInTitle")}</p>
          <p className="mt-1 text-[13px] text-text-secondary mb-4">
            {t("signInBody")}
          </p>
          <button
            className="btn btn-primary w-full"
            onClick={() => signIn("google")}
          >
            <Sparkles size={15} />
            {t("signIn")}
          </button>
        </div>
      </div>
    );
  }

  return <AdminPanel variant="page" />;
}