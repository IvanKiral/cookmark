import type { JSX } from "@solidjs/web";
import { type Component, Show } from "solid-js";
import type { RecipeAdminActions } from "~/app/admin/createRecipeAdminActions.ts";
import { MarkButton } from "~/app/marks/MarkButton.tsx";
import iconButtonStyles from "~/app/ui/iconToggleButton.module.css";
import type { Recipe } from "~/shared/recipe.ts";
import styles from "./RecipeMore.module.css";
import { RecipeMoreMenu } from "./RecipeMoreMenu.tsx";
import { RecipeMoreSheet } from "./RecipeMoreSheet.tsx";
import { recipePageStrings } from "./strings.ts";

type RecipeNavActionsProps = {
  slug: string;
  recipe: Recipe;
  isAdmin: boolean;
  isDesktop: boolean;
  isMoreShown: boolean;
  admin: RecipeAdminActions;
  isSheetOpen: boolean;
  onSheetOpenChange: (isOpen: boolean) => void;
  // "Add to collection": a sheet row on phone, a dropdown item on desktop.
  sheetCollectionsRow?: JSX.Element;
  menuCollectionsItem?: JSX.Element;
};

// Favourite, To try and More; the admin actions live in More.
export const RecipeNavActions: Component<RecipeNavActionsProps> = (props) => (
  <>
    <MarkButton mark="favorite" slug={props.slug} name={props.recipe.title} />
    <MarkButton mark="to-try" slug={props.slug} name={props.recipe.title} />
    <Show when={props.isMoreShown}>
      <Show
        when={props.isDesktop}
        fallback={
          <>
            <button
              type="button"
              class={`${iconButtonStyles.button} ${styles.moreButton}`}
              aria-label={recipePageStrings.more.label}
              aria-haspopup="dialog"
              onClick={() => props.onSheetOpenChange(true)}
            >
              <span class="material-symbols-outlined" aria-hidden="true">
                more_vert
              </span>
            </button>
            <RecipeMoreSheet
              isOpen={props.isSheetOpen}
              onOpenChange={props.onSheetOpenChange}
              slug={props.slug}
              title={props.recipe.title}
              isAdmin={props.isAdmin}
              admin={props.admin}
              collectionsRow={props.sheetCollectionsRow}
            />
          </>
        }
      >
        <RecipeMoreMenu
          slug={props.slug}
          isAdmin={props.isAdmin}
          admin={props.admin}
          items={props.menuCollectionsItem}
        />
      </Show>
    </Show>
  </>
);
