import type { JSX } from "@solidjs/web";
import { type Component, For, Show } from "solid-js";
import type { Collection } from "~/shared/collections.ts";
import { collectionIcon } from "./collectionIcons.ts";
import styles from "./LibrarySidebar.module.css";
import { isSamePlace, type Place } from "./places.ts";
import { collectionStrings } from "./strings.ts";

type LibrarySidebarProps = {
  place: Place;
  // Alphabetical.
  collections: ReadonlyArray<Collection>;
  countOf: (place: Place) => number;
  onSelectPlace: (place: Place) => void;
  // The "+" next to the Collections heading.
  headingAction?: JSX.Element;
  // Replaces a collection's row, e.g. while it is renamed.
  renderCollection?: (collection: Collection, row: JSX.Element) => JSX.Element;
  // Below the list, e.g. the inline create input.
  footer?: JSX.Element;
};

const strings = collectionStrings.places;

type ItemProps = {
  place: Place;
  icon: string;
  label: string;
  count: number;
  isCurrent: boolean;
  title?: string;
  onSelect: () => void;
  onDoubleClick?: () => void;
};

export const SidebarItem: Component<ItemProps> = (props) => (
  <button
    type="button"
    class={[styles.item, { [styles.current]: props.isCurrent }]}
    aria-current={props.isCurrent ? "page" : undefined}
    title={props.title}
    onClick={() => props.onSelect()}
    onDblClick={() => props.onDoubleClick?.()}
  >
    <span class={`material-symbols-outlined ${styles.icon}`} aria-hidden="true">
      {props.icon}
    </span>
    <span class={styles.label}>{props.label}</span>
    <span class={styles.count}>{props.count}</span>
  </button>
);

// The desktop library: All recipes, Favourites, To try, then every collection
// and smart filter with its total (filters do not change the counts).
export const LibrarySidebar: Component<LibrarySidebarProps> = (props) => {
  const libraryItem = (place: Place, icon: string, label: string): JSX.Element => (
    <SidebarItem
      place={place}
      icon={icon}
      label={label}
      count={props.countOf(place)}
      isCurrent={isSamePlace(props.place, place)}
      onSelect={() => props.onSelectPlace(place)}
    />
  );

  return (
    <aside class={styles.sidebar} aria-label={strings.library}>
      <nav class={styles.group} aria-label={strings.library}>
        {libraryItem({ kind: "all" }, "menu_book", strings.allRecipes)}
        {libraryItem({ kind: "mark", mark: "favorite" }, "favorite", strings.favorites)}
        {libraryItem({ kind: "mark", mark: "to-try" }, "bookmark", strings.toTry)}
      </nav>
      <section class={styles.group} aria-labelledby="library-collections-heading">
        <div class={styles.heading}>
          <h2 id="library-collections-heading" class={styles.headingTitle}>
            {strings.collections}
          </h2>
          {props.headingAction}
        </div>
        <For each={props.collections}>
          {(collection) => {
            const place: Place = { kind: "collection", id: collection.id };
            const row = (
              <SidebarItem
                place={place}
                icon={collectionIcon(collection)}
                label={collection.name}
                count={props.countOf(place)}
                isCurrent={isSamePlace(props.place, place)}
                title={collectionStrings.header.doubleClickToRename}
                onSelect={() => props.onSelectPlace(place)}
              />
            );
            return (
              <Show when={props.renderCollection} fallback={row}>
                {(render) => render()(collection, row)}
              </Show>
            );
          }}
        </For>
        {props.footer}
      </section>
    </aside>
  );
};
