import type { JSX } from "@solidjs/web";
import { type Component, Loading, lazy, Show } from "solid-js";
import { PlaceEmptyState } from "~/app/collections/PlaceEmptyState.tsx";
import { describeSmartFilters } from "~/app/collections/places.ts";
import { collectionStrings } from "~/app/collections/strings.ts";
import { RecipeList } from "~/app/recipe-list/RecipeList.tsx";
import buttonStyles from "~/app/ui/button.module.css";
import type { Collection } from "~/shared/collections.ts";
import type { ListPage } from "./createListPage.ts";
import styles from "./ListPage.module.css";

// Loaded only when reordering starts, so dnd-kit stays out of the list's bundle.
export const CollectionReorderView = lazy(
  () => import("~/app/collections/CollectionReorderView.tsx"),
  { export: "CollectionReorderView" },
);
const ReorderGrid = lazy(() => import("~/app/collections/ReorderGrid.tsx"), {
  export: "ReorderGrid",
});

const EmptyCollection: Component<{ collection: Collection; page: ListPage }> = (props) => (
  <PlaceEmptyState
    icon="collections_bookmark"
    title={collectionStrings.empty.title}
    body={
      <>
        <span class={styles.phoneOnly}>{collectionStrings.empty.phoneBody}</span>
        <span class={styles.desktopOnly}>{collectionStrings.empty.desktopBody}</span>
      </>
    }
    action={
      <button
        type="button"
        class={`${buttonStyles.button} ${buttonStyles.primary} ${styles.iconButton}`}
        onClick={() => props.page.startPicking(props.collection)}
      >
        <span class="material-symbols-outlined" aria-hidden="true">
          add
        </span>
        {collectionStrings.empty.addRecipes}
      </button>
    }
  />
);

const NothingMatches: Component<{ collection: Collection; page: ListPage }> = (props) => (
  <PlaceEmptyState
    icon="tune"
    title={collectionStrings.empty.smartTitle}
    body={
      props.collection.filters
        ? collectionStrings.empty.smartBody(describeSmartFilters(props.collection.filters))
        : collectionStrings.empty.smartNoFilters
    }
    action={
      <button
        type="button"
        class={`${buttonStyles.button} ${buttonStyles.secondary} ${styles.iconButton}`}
        onClick={() => props.page.startEditFilter(props.collection)}
      >
        <span class="material-symbols-outlined" aria-hidden="true">
          tune
        </span>
        {collectionStrings.header.editFilter}
      </button>
    }
  />
);

// The recipes of the place: the list (or the desktop reorder grid), or the
// dashed card of an empty collection or a smart filter that matches nothing.
// Filters hiding every recipe get the list's usual no-results state instead.
export const ListContent: Component<{ page: ListPage }> = (props) => {
  const emptyCollection = (): Collection | undefined => {
    const collection = props.page.placeCollection();
    const isEmpty =
      collection !== undefined &&
      props.page.placeRecipes().length === 0 &&
      !props.page.pickCollection() &&
      !props.page.isPreviewingFilter();
    return isEmpty ? collection : undefined;
  };

  const list = (): JSX.Element => (
    <Show
      when={props.page.isDesktop() && props.page.isReordering() && props.page.placeCollection()}
      fallback={
        <Loading>
          <RecipeList
            recipes={props.page.filteredRecipes()}
            currentPage={props.page.params.page()}
            viewMode={props.page.viewMode()}
            onPageChange={(details) => props.page.params.setPage(details.page)}
            onResetAll={props.page.params.resetAll}
            selection={
              props.page.isSelecting()
                ? {
                    isSelected: props.page.selection.isSelected,
                    onToggle: props.page.selection.toggle,
                  }
                : undefined
            }
            onLongPress={(slug) => props.page.selection.start({ kind: "select" }, slug)}
          />
        </Loading>
      }
    >
      {(collection) => (
        <Loading>
          <ReorderGrid collection={collection()} library={props.page.recipes()} />
        </Loading>
      )}
    </Show>
  );

  return (
    <Show when={emptyCollection()} fallback={list()}>
      {(collection) => (
        <Show
          when={collection().kind === "manual"}
          fallback={<NothingMatches collection={collection()} page={props.page} />}
        >
          <EmptyCollection collection={collection()} page={props.page} />
        </Show>
      )}
    </Show>
  );
};
