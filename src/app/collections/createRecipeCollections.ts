import { type Accessor, createMemo } from "solid-js";
import type { Collection } from "~/shared/collections.ts";
import { useCollections } from "./CollectionsContext.tsx";
import { describeNameError, getNameError } from "./collectionNames.ts";
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
};

// The collections of the recipe page's recipe, for the More menu.
export const createRecipeCollections = (slug: Accessor<string>): RecipeCollections => {
  const collectionsContext = useCollections();

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
    const error = getNameError(name, collectionsContext.collections());
    if (error) {
      return error;
    }
    const result = await collectionsContext.create({
      name: name.trim(),
      kind: "manual",
      slugs: [slug()],
    });
    return result.isOk ? undefined : describeNameError(result.error, name);
  };

  const summary = (): string => {
    const names = manual()
      .filter(isIn)
      .map((collection) => collection.name);
    return names.length > 0
      ? collectionStrings.addTo.inCollections(names)
      : collectionStrings.addTo.notInAny;
  };

  return { manual, isIn, toggle, create, summary };
};
