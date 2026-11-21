import { A } from "@solidjs/router";
import { type JSX, type ParentComponent, Show } from "solid-js";
import { recipeListStrings } from "~/app/recipe-list/strings.ts";
import styles from "./RecipePageLayout.module.css";

type RecipePageLayoutProps = {
  closeHref: string;
  // Router state passed along with the close link (e.g. the list's search).
  closeState?: unknown;
  closeLabel: string;
  isLogoShown: boolean;
  actions?: JSX.Element;
  mainClass?: string;
};

// The sticky bar with a close button, shared by the recipe and edit pages.
export const RecipePageLayout: ParentComponent<RecipePageLayoutProps> = (props) => (
  <div class={styles.page}>
    <nav class={styles.nav}>
      <div class={styles.navInner}>
        <div class={styles.navLeading}>
          <A
            href={props.closeHref}
            state={props.closeState}
            class={`${styles.navButton} ${styles.closeButton}`}
            aria-label={props.closeLabel}
          >
            <span class="material-symbols-outlined">close</span>
          </A>
          <Show when={props.isLogoShown}>
            <A href="/" class={styles.logo}>
              {recipeListStrings.title}
            </A>
          </Show>
        </div>
        <Show when={props.actions}>
          <div class={styles.navActions}>{props.actions}</div>
        </Show>
      </div>
    </nav>
    <main class={`${styles.main} ${props.mainClass ?? ""}`}>{props.children}</main>
  </div>
);
