export type Locale = "en" | "sk";

import { enTranslations } from "./i18n/translations/en";
import { skTranslations } from "./i18n/translations/sk";

type ToTranslationStructure<T> = {
	[K in keyof T]: T[K] extends string
		? string
		: T[K] extends Record<string, unknown>
			? ToTranslationStructure<T[K]>
			: T[K];
};

export type TranslationStructure = ToTranslationStructure<
	typeof enTranslations
>;

export const translations: Record<Locale, TranslationStructure> = {
	en: enTranslations,
	sk: skTranslations,
};
