export type Locale = "en" | "sk";

import { enTranslations } from "./i18n/translations/en";
import { skTranslations } from "./i18n/translations/sk";

export const translations: Record<Locale, Record<string, string>> = {
	en: enTranslations,
	sk: skTranslations,
};
