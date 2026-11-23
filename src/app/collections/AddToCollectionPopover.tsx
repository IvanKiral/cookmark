import { Popover } from "@kobalte/core/popover";
import type { Component } from "solid-js";
import buttonStyles from "~/app/ui/button.module.css";
import styles from "./AddToCollection.module.css";
import { CollectionCheckList } from "./CollectionCheckList.tsx";
import type { RecipeCollections } from "./createRecipeCollections.ts";
import { collectionStrings } from "./strings.ts";

type AddToCollectionPopoverProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  anchor: () => HTMLElement | undefined;
  recipeCollections: RecipeCollections;
};

const strings = collectionStrings.addTo;

// Desktop: the same list as the phone sheet, anchored to the More button.
export const AddToCollectionPopover: Component<AddToCollectionPopoverProps> = (props) => (
  <Popover
    open={props.isOpen}
    onOpenChange={props.onOpenChange}
    anchorRef={props.anchor}
    placement="bottom-end"
    gutter={6}
  >
    <Popover.Portal>
      <Popover.Content class={styles.popover}>
        <Popover.Title class={styles.popoverTitle}>{strings.title}</Popover.Title>
        <CollectionCheckList
          collections={props.recipeCollections.manual()}
          isChecked={props.recipeCollections.isIn}
          onToggle={props.recipeCollections.toggle}
          countOf={(collection) => collection.slugs.length}
          onCreate={props.recipeCollections.create}
        />
        <button
          type="button"
          class={`${buttonStyles.button} ${buttonStyles.primary} ${styles.done}`}
          onClick={() => props.onOpenChange(false)}
        >
          {strings.done}
        </button>
      </Popover.Content>
    </Popover.Portal>
  </Popover>
);
