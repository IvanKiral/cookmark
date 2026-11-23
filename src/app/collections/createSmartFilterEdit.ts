import { type Accessor, createMemo, createSignal } from "solid-js";
import {
  countActiveFilters,
  emptyFilters,
  filterRecipes,
  type RecipeFilterKey,
  type RecipeFilters,
} from "~/app/filters/recipeFilters.ts";
import { showToast } from "~/app/ui/Toast.tsx";
import type { Collection } from "~/shared/collections.ts";
import type { RecipeSummary } from "~/shared/recipe.ts";
import { useCollections } from "./CollectionsContext.tsx";
import { collectionStrings } from "./strings.ts";

export type SmartFilterEdit = {
  // The smart filter being edited, undefined when none is.
  collection: Accessor<Collection | undefined>;
  draft: Accessor<RecipeFilters | undefined>;
  // Library recipes the draft matches.
  matches: Accessor<ReadonlyArray<RecipeSummary>>;
  canUpdate: Accessor<boolean>;
  start: (collection: Collection) => void;
  end: () => void;
  setDraft: <K extends RecipeFilterKey>(key: K, values: RecipeFilters[K]) => void;
  update: () => Promise<void>;
};

// Edit filter works on a draft held here; the URL filters are left alone.
// Cancel throws the draft away, Update saves it.
export const createSmartFilterEdit = (
  library: Accessor<ReadonlyArray<RecipeSummary>>,
  // Closes the drawer or panel the edit happens in.
  onEnd: () => void,
): SmartFilterEdit => {
  const collectionsContext = useCollections();
  const [editing, setEditing] = createSignal<
    { collectionId: string; draft: RecipeFilters } | undefined
  >(undefined);

  const collection = createMemo(() => {
    const current = editing();
    return current
      ? collectionsContext.collections().find((item) => item.id === current.collectionId)
      : undefined;
  });
  const draft = (): RecipeFilters | undefined => editing()?.draft;
  const matches = createMemo(() => {
    const current = draft();
    return current ? filterRecipes(library(), current) : [];
  });
  const canUpdate = (): boolean => {
    const current = draft();
    return current !== undefined && countActiveFilters(current) > 0;
  };

  const end = (): void => {
    setEditing(undefined);
    onEnd();
  };

  const update = async (): Promise<void> => {
    const current = draft();
    const edited = collection();
    if (!(current && edited && canUpdate())) {
      return;
    }
    end();
    const isSaved = await collectionsContext.update(edited.id, {
      name: edited.name,
      filters: current,
      isPinned: edited.pinPosition !== null,
    });
    if (isSaved) {
      showToast(collectionStrings.smart.updated(edited.name));
    }
  };

  return {
    collection,
    draft,
    matches,
    canUpdate,
    start: (target) => {
      setEditing({ collectionId: target.id, draft: target.filters ?? emptyFilters });
    },
    end,
    setDraft: (key, values) => {
      const current = editing();
      if (current) {
        setEditing({ ...current, draft: { ...current.draft, [key]: values } });
      }
    },
    update,
  };
};
