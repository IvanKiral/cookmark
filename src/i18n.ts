export type Locale = "en" | "sk";

import { enTranslations } from "./i18n/translations/en.js";
import { skTranslations } from "./i18n/translations/sk.js";

export const translations = {
  en: enTranslations,
  sk: skTranslations,
} as const;
