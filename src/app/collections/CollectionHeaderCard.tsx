import type { JSX } from "@solidjs/web";
import { type Component, Show } from "solid-js";
import type { Collection } from "~/shared/collections.ts";
import styles from "./CollectionHeaderCard.module.css";
import { InlineNameInput } from "./InlineNameInput.tsx";
import { collectionStrings } from "./strings.ts";

type CollectionHeaderCardProps = {
  collection: Collection;
  meta: string;
  isRenaming: boolean;
  renameError: string | undefined;
  onRenameCommit: (name: string) => boolean;
  onRenameCancel: () => void;
  // Reorder or Edit filter, depending on the kind.
  actions?: JSX.Element;
  onOpenMenu: () => void;
};

const strings = collectionStrings.header;

// Phone: the open collection or smart filter above the list.
export const CollectionHeaderCard: Component<CollectionHeaderCardProps> = (props) => (
  <div class={styles.card}>
    <div class={styles.text}>
      <Show
        when={props.isRenaming}
        fallback={<span class={styles.name}>{props.collection.name}</span>}
      >
        <div class={styles.rename}>
          <InlineNameInput
            class={styles.renameInput}
            initialValue={props.collection.name}
            label={strings.renameLabel}
            error={props.renameError}
            onCommit={props.onRenameCommit}
            onCancel={props.onRenameCancel}
          />
          {/* Clicking it blurs the input, which saves. */}
          <button type="button" class={styles.save}>
            {strings.save}
          </button>
        </div>
      </Show>
      <span class={styles.meta}>
        <Show when={props.collection.kind === "smart"}>
          <span class={`material-symbols-outlined ${styles.metaIcon}`} aria-hidden="true">
            tune
          </span>
        </Show>
        {props.meta}
      </span>
    </div>
    {props.actions}
    <button
      type="button"
      class={styles.menuButton}
      aria-haspopup="dialog"
      aria-label={strings.actionsPhone}
      onClick={() => props.onOpenMenu()}
    >
      <span class="material-symbols-outlined" aria-hidden="true">
        more_horiz
      </span>
    </button>
  </div>
);
