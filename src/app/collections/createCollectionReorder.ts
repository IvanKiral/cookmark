import { type Accessor, createMemo, createSignal } from "solid-js";
import { createSortableList, type SortableList } from "~/app/ui/createSortableList.ts";
import type { Collection } from "~/shared/collections.ts";
import type { RecipeSummary } from "~/shared/recipe.ts";
import { useCollections } from "./CollectionsContext.tsx";

export type CollectionReorder = {
  // The collection's recipes that are in the library, in the shown order.
  recipes: Accessor<ReadonlyArray<RecipeSummary>>;
  sortable: SortableList;
  remove: (slug: string) => void;
};

// Reordering a manual collection: each drop saves. The order sent is the
// shown recipes, then the stored slugs whose recipe left the library, so the
// server gets exactly the stored set.
export const createCollectionReorder = (
  collection: Accessor<Collection>,
  library: Accessor<ReadonlyArray<RecipeSummary>>,
): CollectionReorder => {
  const collectionsContext = useCollections();
  // The order of the last drop until the save settles; then the collection's own.
  const [droppedOrder, setDroppedOrder] = createSignal<ReadonlyArray<string> | undefined>(
    undefined,
  );

  const bySlug = createMemo(() => new Map(library().map((recipe) => [recipe.url_slug, recipe])));
  const storedVisible = (): ReadonlyArray<string> =>
    collection().slugs.filter((slug) => bySlug().has(slug));
  const order = (): ReadonlyArray<string> => droppedOrder() ?? storedVisible();

  const recipes = createMemo(() =>
    order().flatMap((slug) => {
      const recipe = bySlug().get(slug);
      return recipe ? [recipe] : [];
    }),
  );

  const save = async (next: ReadonlyArray<string>): Promise<void> => {
    const missing = collection().slugs.filter((slug) => !bySlug().has(slug));
    await collectionsContext.reorder(collection().id, [...next, ...missing]);
    setDroppedOrder(undefined);
  };

  const sortable = createSortableList(order, (next) => {
    setDroppedOrder(next);
    // After the glue's flush, outside the drag listener.
    queueMicrotask(() => {
      save(next);
    });
  });

  return {
    recipes,
    sortable,
    remove: (slug) => {
      collectionsContext.removeRecipes(collection().id, [slug]);
    },
  };
};
