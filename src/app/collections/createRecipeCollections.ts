import { type Accessor, createMemo, createSignal, onSettled } from "solid-js";
import type { Collection } from "~/shared/collections.ts";
import type { RecipeSummary } from "~/shared/recipe.ts";
import { useCollections } from "./CollectionsContext.tsx";
import { createNamedCollection } from "./collectionNames.ts";
import { collectionStrings } from "./strings.ts";

export type RecipeCollections = {
  // Manual collections, alphabetical.
  manual: Accessor<ReadonlyArray<Collection>>;
  isIn: (collection: Collection) => boolean;
  // Saves at once.
  toggle: (collection: Collection) => void;
  // Creates a collection that already holds the recipe.
  create: (name: string) => Promise<string | undefined>;
  // "In Soups, For guests" or "Not in any collection".
  summary: Accessor<string>;
  // For the counts; undefined until the library has loaded.
  librarySlugs: Accessor<ReadonlySet<string> | undefined>;
};

// The collections of the recipe page's recipe, for the More menu.
export const createRecipeCollections = (
  slug: Accessor<string>,
  loadLibrary: () => Promise<ReadonlyArray<RecipeSummary>>,
): RecipeCollections => {
  const collectionsContext = useCollections();
  const [librarySlugs, setLibrarySlugs] = createSignal<ReadonlySet<string> | undefined>(undefined);

  // The recipe page does not render the library, so it is fetched once on the
  // client, without holding up the page; counts use every stored recipe until then.
  onSettled(() => {
    loadLibrary()
      .then((recipes) => setLibrarySlugs(new Set(recipes.map((recipe) => recipe.url_slug))))
      .catch(() => undefined);
  });

  const manual = createMemo(() =>
    collectionsContext.collections().filter((collection) => collection.kind === "manual"),
  );

  const isIn = (collection: Collection): boolean => collection.slugs.includes(slug());

  const toggle = (collection: Collection): void => {
    if (isIn(collection)) {
      collectionsContext.removeRecipes(collection.id, [slug()]);
      return;
    }
    collectionsContext.addRecipes([collection.id], [slug()]);
  };

  const create = async (name: string): Promise<string | undefined> => {
    const created = await createNamedCollection(collectionsContext, {
      name,
      kind: "manual",
      slugs: [slug()],
    });
    return typeof created === "string" ? created : undefined;
  };

  const summary = (): string => {
    const names = manual()
      .filter(isIn)
      .map((collection) => collection.name);
    return names.length > 0
      ? collectionStrings.addTo.inCollections(names)
      : collectionStrings.addTo.notInAny;
  };

  return { manual, isIn, toggle, create, summary, librarySlugs };
};
