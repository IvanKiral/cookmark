import type { JSX } from "solid-js";
import { createContext, useContext } from "solid-js";
import type { TypedTranslations } from "~/constants/translationTypes.js";
import { type Locale, translations } from "~/i18n";

const I18nContext = createContext<TypedTranslations>(translations.en[0]);

export function I18nProvider(props: { locale: Locale; children: JSX.Element }) {
  return (
    <I18nContext.Provider value={translations[props.locale][0]}>
      {props.children}
    </I18nContext.Provider>
  );
}

export function useT(): TypedTranslations {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useT must be used within I18nProvider");
  }
  return context;
}
