import { type Component, For, Show } from "solid-js";
import { ariaBoolean } from "~/app/ui/ariaBoolean.ts";
import type { Collection } from "~/shared/collections.ts";
import styles from "./CollectionChips.module.css";
import { isSamePlace, type Place } from "./places.ts";
import { collectionStrings } from "./strings.ts";

type CollectionChipsProps = {
  place: Place;
  // Pinned collections in pin order.
  pinned: ReadonlyArray<Collection>;
  // The open collection when it is not pinned; shown as a temporary chip.
  temporary: Collection | undefined;
  onSelectPlace: (place: Place) => void;
  onOpenSheet: () => void;
};

const strings = collectionStrings.places;

const TuneIcon: Component = () => (
  <span class={`material-symbols-outlined ${styles.icon}`} aria-hidden="true">
    tune
  </span>
);

// The phone row of places: All, Favourites, To try, the pinned collections,
// the open unpinned one, and a way into every collection. No counts.
export const CollectionChips: Component<CollectionChipsProps> = (props) => {
  const PlaceChip: Component<{ place: Place; label: string; isSmart?: boolean }> = (chip) => {
    const isSelected = (): boolean => isSamePlace(props.place, chip.place);
    return (
      <button
        type="button"
        class={[styles.chip, { [styles.selected]: isSelected() }]}
        aria-pressed={ariaBoolean(isSelected())}
        onClick={() => props.onSelectPlace(chip.place)}
      >
        <Show when={chip.isSmart}>
          <TuneIcon />
        </Show>
        <span>{chip.label}</span>
      </button>
    );
  };

  return (
    <div role="group" aria-label={strings.chipsLabel} class={styles.row}>
      <PlaceChip place={{ kind: "all" }} label={strings.all} />
      <PlaceChip place={{ kind: "mark", mark: "favorite" }} label={strings.favorites} />
      <PlaceChip place={{ kind: "mark", mark: "to-try" }} label={strings.toTry} />
      <For each={props.pinned}>
        {(collection) => (
          <PlaceChip
            place={{ kind: "collection", id: collection.id }}
            label={collection.name}
            isSmart={collection.kind === "smart"}
          />
        )}
      </For>
      <Show when={props.temporary}>
        {(collection) => (
          <span class={`${styles.chip} ${styles.selected} ${styles.temporary}`}>
            <Show when={collection().kind === "smart"}>
              <TuneIcon />
            </Show>
            <span>{collection().name}</span>
            <button
              type="button"
              class={styles.close}
              aria-label={strings.closePlace(collection().name)}
              onClick={() => props.onSelectPlace({ kind: "all" })}
            >
              <span class="material-symbols-outlined" aria-hidden="true">
                close
              </span>
            </button>
          </span>
        )}
      </Show>
      <button
        type="button"
        class={`${styles.chip} ${styles.dashed}`}
        aria-haspopup="dialog"
        onClick={() => props.onOpenSheet()}
      >
        <span class={`material-symbols-outlined ${styles.icon}`} aria-hidden="true">
          collections_bookmark
        </span>
        <span>{strings.collections}</span>
      </button>
    </div>
  );
};
