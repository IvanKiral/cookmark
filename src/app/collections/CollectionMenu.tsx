import { DropdownMenu } from "@kobalte/core/dropdown-menu";
import type { Component } from "solid-js";
import { createAfterMenuClose } from "~/app/ui/createAfterMenuClose.ts";
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
  // Rename starts once the menu has closed, so the title input keeps the focus.
  const afterClose = createAfterMenuClose();

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
        <DropdownMenu.Content class={styles.menu} onCloseAutoFocus={afterClose.onCloseAutoFocus}>
          <DropdownMenu.Item
            class={styles.menuItem}
            onSelect={() => afterClose.schedule(props.onRename)}
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
