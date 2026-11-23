import { type Component, createSignal, For, Show } from "solid-js";
import type { Collection } from "~/shared/collections.ts";
import styles from "./CollectionCheckList.module.css";
import { InlineNameInput } from "./InlineNameInput.tsx";
import { collectionStrings } from "./strings.ts";

type CollectionCheckListProps = {
  // Manual collections, alphabetical.
  collections: ReadonlyArray<Collection>;
  isChecked: (collection: Collection) => boolean;
  onToggle: (collection: Collection) => void;
  countOf: (collection: Collection) => number;
  // Resolves with an error message, or undefined once created (and checked).
  onCreate: (name: string) => Promise<string | undefined>;
};

const strings = collectionStrings.addTo;

// Manual collections as checkboxes, an inline "New collection" and the note
// on smart filters, which pick their own recipes.
export const CollectionCheckList: Component<CollectionCheckListProps> = (props) => {
  const [isCreating, setIsCreating] = createSignal(false);
  const [createError, setCreateError] = createSignal<string | undefined>(undefined);

  const stopCreating = (): void => {
    setIsCreating(false);
    setCreateError(undefined);
  };

  const handleCreate = async (name: string): Promise<boolean> => {
    const error = await props.onCreate(name);
    setCreateError(error);
    if (!error) {
      setIsCreating(false);
    }
    return !error;
  };

  return (
    <div class={styles.list}>
      <For each={props.collections} fallback={<p class={styles.empty}>{strings.noCollections}</p>}>
        {(collection) => (
          <label class={styles.row}>
            <input
              type="checkbox"
              class={styles.checkbox}
              checked={props.isChecked(collection)}
              onChange={() => props.onToggle(collection)}
            />
            <span class={styles.name}>{collection.name}</span>
            <span class={styles.count}>
              {collectionStrings.recipeCount(props.countOf(collection))}
            </span>
          </label>
        )}
      </For>
      <Show
        when={isCreating()}
        fallback={
          <button type="button" class={styles.newButton} onClick={() => setIsCreating(true)}>
            <span class="material-symbols-outlined" aria-hidden="true">
              add
            </span>
            {collectionStrings.create.newCollectionButton}
          </button>
        }
      >
        <div class={styles.create}>
          <InlineNameInput
            class={styles.createInput}
            initialValue=""
            label={collectionStrings.create.inlineLabel}
            placeholder={collectionStrings.create.inlinePlaceholder}
            error={createError()}
            onCommit={handleCreate}
            onCancel={stopCreating}
          />
          {/* Clicking it blurs the input, which creates. */}
          <button type="button" class={styles.createButton}>
            {collectionStrings.create.create}
          </button>
        </div>
      </Show>
      <p class={styles.note}>{strings.smartNote}</p>
    </div>
  );
};
