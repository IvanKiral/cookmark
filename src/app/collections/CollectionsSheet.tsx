import { type Component, createMemo, createSignal, For } from "solid-js";
import { ariaBoolean } from "~/app/ui/ariaBoolean.ts";
import { BottomSheet } from "~/app/ui/BottomSheet.tsx";
import buttonStyles from "~/app/ui/button.module.css";
import { type Collection, MAX_PINS } from "~/shared/collections.ts";
import styles from "./CollectionsSheet.module.css";
import { collectionIcon } from "./collectionIcons.ts";
import { collectionStrings } from "./strings.ts";

type CollectionsSheetProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  // Alphabetical.
  collections: ReadonlyArray<Collection>;
  countOf: (collection: Collection) => number;
  onOpenCollection: (collection: Collection) => void;
  onTogglePin: (collection: Collection) => void;
  onNewCollection: () => void;
  onNewSmartFilter: () => void;
};

const strings = collectionStrings.sheet;

// Every collection and smart filter on phone: open one, or pin up to three to the chips row.
export const CollectionsSheet: Component<CollectionsSheetProps> = (props) => {
  const [query, setQuery] = createSignal("");

  const shown = createMemo(() => {
    const normalized = query().trim().toLowerCase();
    return normalized
      ? props.collections.filter((collection) => collection.name.toLowerCase().includes(normalized))
      : props.collections;
  });

  const pinnedCount = (): number =>
    props.collections.filter((collection) => collection.pinPosition !== null).length;
  const isFull = (): boolean => pinnedCount() >= MAX_PINS;

  const meta = (collection: Collection): string =>
    collection.kind === "smart"
      ? strings.smartMeta(props.countOf(collection))
      : collectionStrings.recipeCount(props.countOf(collection));

  return (
    <BottomSheet
      isOpen={props.isOpen}
      onOpenChange={props.onOpenChange}
      title={strings.title}
      closeLabel={strings.close}
      footer={
        <div class={styles.footer}>
          <button
            type="button"
            class={`${buttonStyles.button} ${buttonStyles.primary}`}
            onClick={() => props.onNewCollection()}
          >
            {strings.newCollection}
          </button>
          <button
            type="button"
            class={`${buttonStyles.button} ${buttonStyles.secondary}`}
            onClick={() => props.onNewSmartFilter()}
          >
            {strings.newSmartFilter}
          </button>
        </div>
      }
    >
      <input
        type="search"
        class={styles.search}
        placeholder={strings.search}
        aria-label={strings.searchLabel}
        value={query()}
        onInput={(event) => setQuery(event.currentTarget.value)}
      />
      <p class={styles.pinned}>
        {isFull() ? strings.pinsFull : strings.pinnedCount(pinnedCount())}
      </p>
      <ul class={styles.list}>
        <For each={shown()} fallback={<li class={styles.empty}>{strings.noMatches}</li>}>
          {(collection) => {
            const isPinned = (): boolean => collection.pinPosition !== null;
            return (
              <li class={styles.row}>
                <button
                  type="button"
                  class={styles.open}
                  onClick={() => props.onOpenCollection(collection)}
                >
                  <span class={`material-symbols-outlined ${styles.icon}`} aria-hidden="true">
                    {collectionIcon(collection)}
                  </span>
                  <span class={styles.text}>
                    <span class={styles.name}>{collection.name}</span>
                    <span class={styles.meta}>{meta(collection)}</span>
                  </span>
                </button>
                <button
                  type="button"
                  class={[styles.pin, { [styles.pinActive]: isPinned() }]}
                  aria-label={
                    isPinned() ? strings.unpin(collection.name) : strings.pin(collection.name)
                  }
                  aria-pressed={ariaBoolean(isPinned())}
                  disabled={!isPinned() && isFull()}
                  onClick={() => props.onTogglePin(collection)}
                >
                  <span class="material-symbols-outlined" aria-hidden="true">
                    push_pin
                  </span>
                </button>
              </li>
            );
          }}
        </For>
      </ul>
    </BottomSheet>
  );
};
