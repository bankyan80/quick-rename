import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["id", "en"],
  defaultLocale: "id",
  localePrefix: "never",
  localeDetection: true,
});

export type AppLocale = (typeof routing.locales)[number];