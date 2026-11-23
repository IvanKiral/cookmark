import { type Accessor, action, createOptimistic, createSignal } from "solid-js";
import { saveRecipeFlag, saveRecipeVerdict } from "~/app/api/adminApi.ts";
import { revalidateRecipes } from "~/app/api/recipeQueries.ts";
import { recipeVerdictLabels } from "~/app/verdicts/verdictDisplay.ts";
import type { RecipeVerdict } from "~/shared/verdicts.ts";
import { adminStrings } from "./strings.ts";

export type AdminConfirmation = {
  title: string;
  description: string;
  confirmLabel: string;
  run: () => Promise<void>;
};

type RecipeAdminSource = {
  slug: Accessor<string>;
  name: Accessor<string>;
  verdict: Accessor<RecipeVerdict | undefined>;
  isShouldDelete: Accessor<boolean>;
};

export type RecipeAdminActions = {
  // What the menus and badges show: the saved value, or the one being saved.
  verdict: Accessor<RecipeVerdict | undefined>;
  isShouldDelete: Accessor<boolean>;
  isSaving: Accessor<boolean>;
  // Losing a Chef's kiss asks first (returns true); every other change saves at once.
  chooseVerdict: (verdict: RecipeVerdict | undefined) => boolean;
  // Always asks first.
  toggleShouldDelete: () => void;
  confirmation: Accessor<AdminConfirmation | undefined>;
  confirm: () => Promise<void>;
  cancel: () => void;
};

// The verdict and To delete saves of the recipe page, shared by the More sheet,
// the More dropdown and the header badges. Optimistic: the new value shows at
// once and stays until the refetched recipe confirms it; a failed save reverts.
export const createRecipeAdminActions = (source: RecipeAdminSource): RecipeAdminActions => {
  const [verdict, setVerdict] = createOptimistic(() => source.verdict());
  const [isShouldDelete, setIsShouldDelete] = createOptimistic(() => source.isShouldDelete());
  // True only while a save runs; it reverts on its own when the action ends.
  const [isSaving, setIsSaving] = createOptimistic(false);
  const [confirmation, setConfirmation] = createSignal<AdminConfirmation | undefined>(undefined);

  const saveVerdict = action(async function* (nextVerdict: RecipeVerdict | undefined) {
    setVerdict(nextVerdict);
    setIsSaving(true);
    const isSaved = await saveRecipeVerdict(source.slug(), nextVerdict);
    // Re-enter the action's transaction before the refetch.
    yield;
    if (isSaved) {
      revalidateRecipes();
    }
  });

  const saveShouldDelete = action(async function* (nextIsSet: boolean) {
    setIsShouldDelete(nextIsSet);
    setIsSaving(true);
    const isSaved = await saveRecipeFlag(source.slug(), "should-delete", nextIsSet);
    yield;
    if (isSaved) {
      revalidateRecipes();
    }
  });

  const getVerdictConfirmation = (
    nextVerdict: RecipeVerdict | undefined,
  ): AdminConfirmation | undefined => {
    if (verdict() !== "chef-kiss") {
      return undefined;
    }
    const description = adminStrings.verdict.confirmRemoveDescription(source.name());
    const run = async (): Promise<void> => {
      await saveVerdict(nextVerdict);
    };
    if (nextVerdict) {
      const nextLabel = recipeVerdictLabels[nextVerdict];
      return {
        title: adminStrings.verdict.confirmChangeTitle(nextLabel),
        description,
        confirmLabel: adminStrings.verdict.confirmChange(nextLabel),
        run,
      };
    }
    return {
      title: adminStrings.verdict.confirmRemoveTitle,
      description,
      confirmLabel: adminStrings.verdict.confirmRemove,
      run,
    };
  };

  const chooseVerdict = (nextVerdict: RecipeVerdict | undefined): boolean => {
    if (nextVerdict === verdict()) {
      return false;
    }
    const nextConfirmation = getVerdictConfirmation(nextVerdict);
    if (nextConfirmation) {
      setConfirmation(nextConfirmation);
      return true;
    }
    saveVerdict(nextVerdict);
    return false;
  };

  const toggleShouldDelete = (): void => {
    const nextIsSet = !isShouldDelete();
    const name = source.name();
    const run = async (): Promise<void> => {
      await saveShouldDelete(nextIsSet);
    };
    setConfirmation(
      nextIsSet
        ? {
            title: adminStrings.shouldDelete.confirmAddTitle,
            description: adminStrings.shouldDelete.confirmAddDescription(name),
            confirmLabel: adminStrings.shouldDelete.confirmAdd,
            run,
          }
        : {
            title: adminStrings.shouldDelete.confirmRemoveTitle,
            description: adminStrings.shouldDelete.confirmRemoveDescription(name),
            confirmLabel: adminStrings.shouldDelete.confirmRemove,
            run,
          },
    );
  };

  const confirm = async (): Promise<void> => {
    const current = confirmation();
    setConfirmation(undefined);
    await current?.run();
  };

  return {
    verdict,
    isShouldDelete,
    isSaving,
    chooseVerdict,
    toggleShouldDelete,
    confirmation,
    confirm,
    cancel: () => setConfirmation(undefined),
  };
};
