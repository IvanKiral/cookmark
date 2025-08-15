export type Locale = "en" | "sk";

import type { TypedTranslations } from "./constants/translationTypes.js";
import { enTranslations } from "./i18n/translations/en.js";
import { skTranslations } from "./i18n/translations/sk.js";

export const translations: Record<Locale, TypedTranslations> = {
  en: enTranslations,
  sk: skTranslations,
};
