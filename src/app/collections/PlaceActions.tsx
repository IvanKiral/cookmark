import type { JSX } from "@solidjs/web";
import { type Component, Show } from "solid-js";
import buttonStyles from "~/app/ui/button.module.css";
import type { Collection } from "~/shared/collections.ts";
import styles from "./PlaceActions.module.css";
import { collectionStrings } from "./strings.ts";

type PlaceActionsProps = {
  collection: Collection;
  canReorder: boolean;
  onReorder: () => void;
  onEditFilter: () => void;
  // Desktop only: "Add recipes" for a manual collection.
  onAddRecipes?: () => void;
  // Desktop only: the "⋯" dropdown that follows (the phone card has its own).
  menu?: JSX.Element;
};

const strings = collectionStrings.header;

// The actions next to an open collection or smart filter: the phone header
// card and the desktop title share them.
export const PlaceActions: Component<PlaceActionsProps> = (props) => (
  <div class={styles.actions}>
    <Show when={props.collection.kind === "smart"}>
      <button
        type="button"
        class={`${buttonStyles.button} ${buttonStyles.secondary}`}
        onClick={() => props.onEditFilter()}
      >
        {strings.editFilter}
      </button>
    </Show>
    <Show when={props.canReorder}>
      <button
        type="button"
        class={`${buttonStyles.button} ${buttonStyles.secondary} ${styles.withIcon}`}
        onClick={() => props.onReorder()}
      >
        <span class="material-symbols-outlined" aria-hidden="true">
          reorder
        </span>
        {strings.reorder}
      </button>
    </Show>
    <Show when={props.collection.kind === "manual" && props.onAddRecipes}>
      {(onAddRecipes) => (
        <button
          type="button"
          class={`${buttonStyles.button} ${buttonStyles.secondary}`}
          onClick={() => onAddRecipes()()}
        >
          {strings.addRecipes}
        </button>
      )}
    </Show>
    {props.menu}
  </div>
);
