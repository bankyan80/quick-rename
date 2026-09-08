import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { routing } from "./routing";

const LOCALES = routing.locales as readonly string[];
const DEFAULT_LOCALE = routing.defaultLocale;

function pickLocale(
  cookieValue: string | undefined,
  acceptLanguage: string | undefined
): string {
  if (cookieValue && LOCALES.includes(cookieValue)) return cookieValue;
  if (acceptLanguage) {
    for (const part of acceptLanguage.split(",")) {
      const tag = part.trim().split(";")[0].split("-")[0].toLowerCase();
      if (LOCALES.includes(tag)) return tag;
    }
  }
  return DEFAULT_LOCALE;
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const locale = pickLocale(
    cookieStore.get("NEXT_LOCALE")?.value,
    headerStore.get("accept-language") ?? undefined
  );

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});