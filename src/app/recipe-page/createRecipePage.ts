import { type Accessor, createMemo, createSignal } from "solid-js";
import {
  createRecipeAdminActions,
  type RecipeAdminActions,
} from "~/app/admin/createRecipeAdminActions.ts";
import { getRecipeBySlug, getRecipesList } from "~/app/api/recipeQueries.ts";
import {
  createRecipeCollections,
  type RecipeCollections,
} from "~/app/collections/createRecipeCollections.ts";
import { createMediaQuery } from "~/app/ui/createMediaQuery.ts";
import { useCurrentUser } from "~/app/user/CurrentUserContext.tsx";
import type { Recipe } from "~/shared/recipe.ts";
import { createRecipeScale, type RecipeScale } from "./createRecipeScale.ts";
import type { RecipeSheet } from "./RecipeNavActions.tsx";

const DESKTOP_QUERY = "(min-width: 1024px)";

export type RecipePageState = {
  recipe: Accessor<Recipe | undefined>;
  isAdmin: Accessor<boolean>;
  isDesktop: Accessor<boolean>;
  scale: RecipeScale;
  admin: RecipeAdminActions;
  recipeCollections: RecipeCollections;
  openSheet: Accessor<RecipeSheet>;
  setOpenSheet: (sheet: RecipeSheet) => void;
  // The verdict (for everyone) and the To delete mark (admins), as being saved.
  isShouldDeleteShown: Accessor<boolean>;
  hasBadges: Accessor<boolean>;
  // Admins on phones open the More sheet from the verdict badge.
  canOpenSheetFromBadge: Accessor<boolean>;
};

// The recipe page's data and state: the recipe, its scale, the admin actions,
// its collections and which phone sheet is open.
export const createRecipePage = (slug: Accessor<string>): RecipePageState => {
  const recipe = createMemo(() => getRecipeBySlug(slug()));
  const { isAdmin } = useCurrentUser();
  const isDesktop = createMediaQuery(DESKTOP_QUERY);
  const admin = createRecipeAdminActions({
    slug,
    name: () => recipe()?.title ?? "",
    verdict: () => recipe()?.verdict,
    isShouldDelete: () => recipe()?.should_delete ?? false,
  });
  const [openSheet, setOpenSheet] = createSignal<RecipeSheet>(undefined);
  const isShouldDeleteShown = (): boolean => isAdmin() && admin.isShouldDelete();

  return {
    recipe,
    isAdmin,
    isDesktop,
    scale: createRecipeScale(slug, recipe),
    admin,
    recipeCollections: createRecipeCollections(slug, getRecipesList),
    openSheet,
    setOpenSheet,
    isShouldDeleteShown,
    hasBadges: () => admin.verdict() !== undefined || isShouldDeleteShown(),
    canOpenSheetFromBadge: () => isAdmin() && !isDesktop(),
  };
};
