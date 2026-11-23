import { type Component, For } from "solid-js";
import { formatMinutes } from "~/app/recipe-page/recipeFormat.ts";
import type { Collection } from "~/shared/collections.ts";
import type { RecipeSummary } from "~/shared/recipe.ts";
import { createCollectionReorder } from "./createCollectionReorder.ts";
import styles from "./ReorderGrid.module.css";
import { collectionStrings } from "./strings.ts";

type ReorderGridProps = {
  collection: Collection;
  library: ReadonlyArray<RecipeSummary>;
};

// Desktop: every recipe of the collection on one page as draggable cards
// (not links); each drop saves. Keyboard: Space lifts, arrows move, Space drops.
export const ReorderGrid: Component<ReorderGridProps> = (props) => {
  const reorder = createCollectionReorder(
    () => props.collection,
    () => props.library,
  );

  return (
    <div class={styles.grid}>
      <For each={reorder.recipes()}>
        {(recipe, index) => {
          const card = (
            <button
              type="button"
              class={styles.card}
              aria-label={collectionStrings.reorder.drag(recipe.name)}
            >
              <div class={styles.thumb}>
                <img
                  class={styles.image}
                  src={recipe.image_url}
                  alt=""
                  loading="lazy"
                  onError={(event) => event.currentTarget.classList.add(styles.broken)}
                />
                <span class={`material-symbols-outlined ${styles.badge}`} aria-hidden="true">
                  drag_indicator
                </span>
              </div>
              <div class={styles.body}>
                <span class={styles.name}>{recipe.name}</span>
                <span class={styles.meta}>
                  {collectionStrings.reorder.meta(
                    recipe.difficulty,
                    formatMinutes(recipe.total_time),
                  )}
                </span>
              </div>
            </button>
          ) as HTMLElement;
          reorder.sortable.register(recipe.url_slug, index, card);
          return card;
        }}
      </For>
    </div>
  );
};
