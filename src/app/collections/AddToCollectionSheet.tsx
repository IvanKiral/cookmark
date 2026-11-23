import { type Component, Show } from "solid-js";
import { BottomSheet } from "~/app/ui/BottomSheet.tsx";
import buttonStyles from "~/app/ui/button.module.css";
import styles from "./AddToCollection.module.css";
import { CollectionCheckList } from "./CollectionCheckList.tsx";
import type { RecipeCollections } from "./createRecipeCollections.ts";
import { collectionStrings } from "./strings.ts";

type AddToCollectionSheetProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  recipeName: string;
  recipeCollections: RecipeCollections;
  // The back arrow; without it the sheet has a close button.
  onBack?: () => void;
};

const strings = collectionStrings.addTo;

// Phone: tick the collections the recipe belongs to; each tick saves at once.
export const AddToCollectionSheet: Component<AddToCollectionSheetProps> = (props) => (
  <BottomSheet
    isOpen={props.isOpen}
    onOpenChange={props.onOpenChange}
    title={strings.title}
    subtitle={props.recipeName}
    closeLabel={collectionStrings.sheet.close}
    leading={
      <Show when={props.onBack}>
        {(onBack) => (
          <button
            type="button"
            class={styles.back}
            aria-label={strings.back}
            onClick={() => onBack()()}
          >
            <span class="material-symbols-outlined" aria-hidden="true">
              arrow_back
            </span>
          </button>
        )}
      </Show>
    }
    footer={
      <button
        type="button"
        class={`${buttonStyles.button} ${buttonStyles.primary}`}
        onClick={() => props.onOpenChange(false)}
      >
        {strings.done}
      </button>
    }
  >
    <CollectionCheckList
      collections={props.recipeCollections.manual()}
      isChecked={props.recipeCollections.isIn}
      onToggle={props.recipeCollections.toggle}
      countOf={(collection) => collection.slugs.length}
      onCreate={props.recipeCollections.create}
    />
  </BottomSheet>
);
