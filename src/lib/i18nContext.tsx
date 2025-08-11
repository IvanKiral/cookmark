import { createContext, useContext } from "solid-js";
import { type Locale, translations } from "~/i18n";

const I18nContext = createContext<Record<string, string>>(translations.en);

export function I18nProvider(props: { locale: Locale; children: Element }) {
	return (
		<I18nContext.Provider value={translations[props.locale]}>
			{props.children}
		</I18nContext.Provider>
	);
}

export function useT(): Record<string, string> {
	const context = useContext(I18nContext);
	if (!context) {
		throw new Error("useT must be used within I18nProvider");
	}
	return context;
}
