import type { JSX } from "@solidjs/web";
import { type ParentComponent, Show } from "solid-js";
import { recipeListStrings } from "~/app/recipe-list/strings.ts";
import { toLinkState } from "~/app/ui/linkState.ts";
import styles from "./RecipePageLayout.module.css";

type RecipePageLayoutProps = {
  closeHref: string;
  // Router state passed along with the close link (e.g. the list's search).
  closeState?: unknown;
  closeLabel: string;
  // Material Symbols name of the close link's icon.
  closeIcon?: string;
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
          {/* biome-ignore lint/a11y/useAnchorContent: the aria-label names the link, the icon is decorative */}
          <a
            href={props.closeHref}
            state={toLinkState(props.closeState)}
            class={`${styles.navButton} ${styles.closeButton}`}
            aria-label={props.closeLabel}
          >
            <span class="material-symbols-outlined" aria-hidden="true">
              {props.closeIcon ?? "close"}
            </span>
          </a>
          <Show when={props.isLogoShown}>
            <a href="/" class={styles.logo}>
              {recipeListStrings.title}
            </a>
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
