import { type Component, Show } from "solid-js";
import { ListSelection } from "~/app/collections/ListSelection.tsx";
import type { ListPage } from "./createListPage.ts";
import styles from "./ListPage.module.css";

// Select mode's bar, in place of the toolbar on desktop.
export const ListSelectionBar: Component<{ page: ListPage }> = (props) => (
  <Show when={props.page.isSelecting()}>
    <div class={styles.selectionBar}>
      <ListSelection
        selection={props.page.selection}
        placeCollection={props.page.placeCollection()}
        viewCount={props.page.filteredRecipes().length}
        librarySlugs={props.page.librarySlugs()}
      />
    </div>
  </Show>
);
