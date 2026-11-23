import { DropdownMenu } from "@kobalte/core/dropdown-menu";
import type { Component } from "solid-js";
import type { Collection } from "~/shared/collections.ts";
import styles from "./CollectionMenu.module.css";
import { collectionStrings } from "./strings.ts";

type CollectionMenuProps = {
  collection: Collection;
  onRename: () => void;
  onDelete: () => void;
};

// Desktop "⋯" next to the collection title.
export const CollectionMenu: Component<CollectionMenuProps> = (props) => {
  // Rename starts once the menu has closed: it moves focus into the title
  // input, which the menu would otherwise take back to its trigger (and the
  // blur would save the unchanged name at once).
  let isRenameChosen = false;

  return (
    <DropdownMenu placement="bottom-end" gutter={6}>
      <DropdownMenu.Trigger
        class={styles.trigger}
        aria-label={collectionStrings.header.actionsDesktop}
      >
        <span class="material-symbols-outlined" aria-hidden="true">
          more_horiz
        </span>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          class={styles.menu}
          onCloseAutoFocus={(event) => {
            if (isRenameChosen) {
              event.preventDefault();
              isRenameChosen = false;
              props.onRename();
            }
          }}
        >
          <DropdownMenu.Item
            class={styles.menuItem}
            onSelect={() => {
              isRenameChosen = true;
            }}
          >
            <span class="material-symbols-outlined" aria-hidden="true">
              edit
            </span>
            {collectionStrings.menu.rename}
          </DropdownMenu.Item>
          <DropdownMenu.Item
            class={`${styles.menuItem} ${styles.danger}`}
            onSelect={() => props.onDelete()}
          >
            <span class="material-symbols-outlined" aria-hidden="true">
              delete
            </span>
            {props.collection.kind === "smart"
              ? collectionStrings.menu.deleteSmartFilter
              : collectionStrings.menu.deleteCollection}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu>
  );
};
