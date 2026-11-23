import { type Component, For, Show } from "solid-js";
import { formatMinutes } from "~/app/recipe-page/recipeFormat.ts";
import type { Collection } from "~/shared/collections.ts";
import type { RecipeSummary } from "~/shared/recipe.ts";
import styles from "./CollectionReorderView.module.css";
import { createCollectionReorder } from "./createCollectionReorder.ts";
import { collectionStrings } from "./strings.ts";

type CollectionReorderViewProps = {
  collection: Collection;
  library: ReadonlyArray<RecipeSummary>;
  onDone: () => void;
};

const strings = collectionStrings.reorder;

// Phone: a full-screen list over the collection; drag ⋮⋮ to move, each drop saves.
export const CollectionReorderView: Component<CollectionReorderViewProps> = (props) => {
  const reorder = createCollectionReorder(
    () => props.collection,
    () => props.library,
  );

  return (
    <div class={styles.view} role="dialog" aria-modal="true" aria-labelledby="reorder-title">
      <header class={styles.header}>
        <button
          type="button"
          class={styles.iconButton}
          aria-label={strings.back}
          onClick={() => props.onDone()}
        >
          <span class="material-symbols-outlined" aria-hidden="true">
            arrow_back
          </span>
        </button>
        <h2 id="reorder-title" class={styles.title}>
          {strings.title}
        </h2>
        <button type="button" class={styles.done} onClick={() => props.onDone()}>
          {strings.done}
        </button>
      </header>
      <div class={styles.intro}>
        <p class={styles.name}>{props.collection.name}</p>
        <p class={styles.hint}>{strings.hint(reorder.recipes().length)}</p>
      </div>
      <ul class={styles.list}>
        <For each={reorder.recipes()}>
          {(recipe, index) => {
            const handle = (
              <button type="button" class={styles.handle} aria-label={strings.drag(recipe.name)}>
                <span class="material-symbols-outlined" aria-hidden="true">
                  drag_indicator
                </span>
              </button>
            ) as HTMLElement;
            const row = (
              <li class={styles.row}>
                <button
                  type="button"
                  class={styles.remove}
                  aria-label={strings.removeFromCollection(recipe.name)}
                  onClick={() => reorder.remove(recipe.url_slug)}
                >
                  <span class="material-symbols-outlined" aria-hidden="true">
                    do_not_disturb_on
                  </span>
                </button>
                <img
                  class={styles.thumb}
                  src={recipe.image_url}
                  alt=""
                  loading="lazy"
                  onError={(event) => event.currentTarget.classList.add(styles.broken)}
                />
                <span class={styles.text}>
                  <span class={styles.recipeName}>{recipe.name}</span>
                  <span class={styles.meta}>
                    {strings.meta(recipe.difficulty, formatMinutes(recipe.total_time))}
                  </span>
                </span>
                {handle}
              </li>
            ) as HTMLElement;
            reorder.sortable.register(recipe.url_slug, index, row, handle);
            return row;
          }}
        </For>
      </ul>
      <Show when={reorder.recipes().length === 0}>
        <p class={styles.hint}>{collectionStrings.empty.title}</p>
      </Show>
    </div>
  );
};
