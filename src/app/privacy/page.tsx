import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function PrivacyPage() {
  const t = await getTranslations("privacy");
  const sections = [
    { title: t("filesLocalTitle"), body: t("filesLocalBody") },
    { title: t("storedTitle"), body: t("storedBody") },
    { title: t("authTitle"), body: t("authBody") },
    { title: t("paymentsTitle"), body: t("paymentsBody") },
    { title: t("cookiesTitle"), body: t("cookiesBody") },
    { title: t("contactTitle"), body: t("contactBody") },
  ];
  return (
    <div className="min-h-screen overflow-y-auto bg-background text-text-primary">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <Link href="/" className="text-[13px] text-primary hover:underline">
          {t("back")}
        </Link>
        <h1 className="mt-4 text-2xl font-semibold">{t("title")}</h1>
        <p className="mt-1 text-[12px] text-text-muted">{t("updated")}</p>

        <div className="mt-6 space-y-5 text-[14px] leading-relaxed text-text-secondary">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="mb-1 text-[15px] font-medium text-text-primary">
                {section.title}
              </h2>
              <p>{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}