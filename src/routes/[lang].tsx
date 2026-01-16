import { useParams } from "@solidjs/router";
import type { ParentComponent } from "solid-js";
import type { Locale } from "~/i18n";
import { I18nProvider } from "~/lib/i18nContext";

const LangLayout: ParentComponent = (props) => {
  const params = useParams<{ lang: Locale }>();
  return <I18nProvider locale={params.lang}>{props.children}</I18nProvider>;
};

export default LangLayout;
