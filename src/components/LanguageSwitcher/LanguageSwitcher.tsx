import { useParams } from "@solidjs/router";
import { createMemo } from "solid-js";
import type { Locale } from "~/i18n";
import { useT } from "~/lib/i18nContext";
import styles from "./LanguageSwitcher.module.css";

const LanguageSwitcher = () => {
  const t = useT();
  const params = useParams<{ lang: Locale }>();

  const currentLang = params.lang;
  const otherLang = createMemo(() => (currentLang === "en" ? "sk" : "en"));

  const handleLanguageSwitch = () => {
    window.location.replace(`/${otherLang()}`);
  };

  const switchToLang = createMemo(() => (currentLang === "en" ? "Slovak" : "English"));
  const switchToLabel = createMemo(() =>
    otherLang() === "en" ? t.languageSwitcher.switchToEnglish : t.languageSwitcher.switchToSlovak,
  );

  return (
    <button
      type="button"
      class={styles.switcher}
      onClick={handleLanguageSwitch}
      aria-label={switchToLabel()}
      title={switchToLabel()}
    >
      <span class={styles.icon}>🌐</span>
      <span class={styles.language}>{switchToLang()}</span>
    </button>
  );
};

export default LanguageSwitcher;
