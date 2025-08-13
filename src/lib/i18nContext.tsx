import type { JSX } from "solid-js";
import { createContext, useContext } from "solid-js";
import { type Locale, type TranslationStructure, translations } from "~/i18n";

const I18nContext = createContext<TranslationStructure>(translations.en);

export function I18nProvider(props: { locale: Locale; children: JSX.Element }) {
  return (
    <I18nContext.Provider value={translations[props.locale]}>{props.children}</I18nContext.Provider>
  );
}

export function useT(): TranslationStructure {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useT must be used within I18nProvider");
  }
  return context;
}
