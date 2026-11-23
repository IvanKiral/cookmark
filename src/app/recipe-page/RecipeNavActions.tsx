import { type Component, Show } from "solid-js";
import type { RecipeAdminActions } from "~/app/admin/createRecipeAdminActions.ts";
import { AddToCollectionPopover } from "~/app/collections/AddToCollectionPopover.tsx";
import { AddToCollectionSheet } from "~/app/collections/AddToCollectionSheet.tsx";
import type { RecipeCollections } from "~/app/collections/createRecipeCollections.ts";
import { collectionStrings } from "~/app/collections/strings.ts";
import { MarkButton } from "~/app/marks/MarkButton.tsx";
import iconButtonStyles from "~/app/ui/iconToggleButton.module.css";
import type { Recipe } from "~/shared/recipe.ts";
import styles from "./RecipeMore.module.css";
import { RecipeMoreMenu } from "./RecipeMoreMenu.tsx";
import { RecipeMoreSheet } from "./RecipeMoreSheet.tsx";
import { recipePageStrings } from "./strings.ts";

// Which phone sheet is open: the More sheet or its "Add to collection" page.
export type RecipeSheet = "more" | "collections" | undefined;

type RecipeNavActionsProps = {
  slug: string;
  recipe: Recipe;
  isAdmin: boolean;
  isDesktop: boolean;
  admin: RecipeAdminActions;
  recipeCollections: RecipeCollections;
  openSheet: RecipeSheet;
  onOpenSheetChange: (sheet: RecipeSheet) => void;
};

// Favourite, To try and More; More holds "Add to collection" and the admin actions.
export const RecipeNavActions: Component<RecipeNavActionsProps> = (props) => {
  let moreAnchor: HTMLSpanElement | undefined;
  const isPopoverOpen = (): boolean => props.openSheet === "collections" && props.isDesktop;

  const closeIf = (sheet: RecipeSheet) => (isOpen: boolean) => {
    if (!isOpen && props.openSheet === sheet) {
      props.onOpenSheetChange(undefined);
    }
  };

  return (
    <>
      <MarkButton mark="favorite" slug={props.slug} name={props.recipe.title} />
      <MarkButton mark="to-try" slug={props.slug} name={props.recipe.title} />
      <Show
        when={props.isDesktop}
        fallback={
          <>
            <button
              type="button"
              class={`${iconButtonStyles.button} ${styles.moreButton}`}
              aria-label={recipePageStrings.more.label}
              aria-haspopup="dialog"
              onClick={() => props.onOpenSheetChange("more")}
            >
              <span class="material-symbols-outlined" aria-hidden="true">
                more_vert
              </span>
            </button>
            <RecipeMoreSheet
              isOpen={props.openSheet === "more"}
              onOpenChange={(isOpen) => props.onOpenSheetChange(isOpen ? "more" : undefined)}
              slug={props.slug}
              title={props.recipe.title}
              isAdmin={props.isAdmin}
              admin={props.admin}
              collectionsRow={
                <button
                  type="button"
                  class={styles.row}
                  onClick={() => props.onOpenSheetChange("collections")}
                >
                  <span class="material-symbols-outlined" aria-hidden="true">
                    collections_bookmark
                  </span>
                  <span class={styles.rowText}>
                    <span>{collectionStrings.addTo.rowTitle}</span>
                    <span class={styles.rowSubtitle}>{props.recipeCollections.summary()}</span>
                  </span>
                  <span class={`material-symbols-outlined ${styles.chevron}`} aria-hidden="true">
                    chevron_right
                  </span>
                </button>
              }
            />
            <AddToCollectionSheet
              isOpen={props.openSheet === "collections"}
              onOpenChange={closeIf("collections")}
              recipeName={props.recipe.title}
              recipeCollections={props.recipeCollections}
              onBack={() => props.onOpenSheetChange("more")}
            />
          </>
        }
      >
        <span ref={moreAnchor} class={styles.moreAnchor}>
          <RecipeMoreMenu
            slug={props.slug}
            isAdmin={props.isAdmin}
            admin={props.admin}
            collectionsSummary={props.recipeCollections.summary()}
            onAddToCollection={() => props.onOpenSheetChange("collections")}
          />
        </span>
        <AddToCollectionPopover
          isOpen={isPopoverOpen()}
          onOpenChange={closeIf("collections")}
          anchor={() => moreAnchor}
          recipeCollections={props.recipeCollections}
        />
      </Show>
    </>
  );
};
