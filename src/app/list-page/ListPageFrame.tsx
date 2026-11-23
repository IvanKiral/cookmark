import type { JSX } from "@solidjs/web";
import type { ParentComponent } from "solid-js";
import { recipeListStrings } from "~/app/recipe-list/strings.ts";
import styles from "./ListPage.module.css";

type ListPageFrameProps = {
  isSelecting: boolean;
  sidebar: JSX.Element;
  toolbar: JSX.Element;
  // Drawers, sheets and dialogs, outside the layout.
  overlays: JSX.Element;
};

// The list page's header and layout: the sidebar on desktop, the toolbar, and
// the content column (children).
export const ListPageFrame: ParentComponent<ListPageFrameProps> = (props) => (
  <main class={[styles.main, { [styles.selecting]: props.isSelecting }]}>
    <header class={styles.header}>
      <div class={styles.headerContent}>
        <h1 class={styles.title}>{recipeListStrings.title}</h1>
        <p class={styles.subtitle}>{recipeListStrings.subtitle}</p>
      </div>
    </header>
    <div class={styles.container}>
      <div class={styles.layout}>
        <div class={styles.sidebar}>{props.sidebar}</div>
        <div class={styles.controls}>{props.toolbar}</div>
        <div class={styles.mainContent}>{props.children}</div>
      </div>
    </div>
    {props.overlays}
  </main>
);
