import { Component, createMemo, createEffect } from "solid-js";
import Drawer from "@corvu/drawer";
import type { RecipeData } from "~/types/Recipe";
import RecipeDetail from "~/components/RecipeDetail/RecipeDetail";
import { getRecipeDataById } from "~/utils/loadRecipes";
import createMediaQuery from "~/utils/createMediaQuery";
import styles from "./RecipeDrawer.module.css";

type RecipeDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipeId: string | null;
  onClose: () => void;
};

const RecipeDrawer: Component<RecipeDrawerProps> = (props) => {
  const isMobile = createMediaQuery("(max-width: 768px)");
  
  const selectedRecipeData = createMemo((): RecipeData | undefined => {
    return props.recipeId ? getRecipeDataById(props.recipeId) : undefined;
  });

  return (
    <Drawer open={props.open} onOpenChange={props.onOpenChange} side={isMobile() ? "bottom" : "right"}>
      <Drawer.Portal>
        <Drawer.Overlay
          class={styles.overlay}
          onClick={props.onClose}
          aria-hidden="true"
        />
        <Drawer.Content
          class={styles.content}
          role="dialog"
          aria-modal="true"
          aria-labelledby="recipe-detail-title"
          aria-describedby="recipe-detail-content"
        >
          <Drawer.Close
            class={styles.closeButton}
            onClick={props.onClose}
            aria-label="Close recipe detail"
            title="Close recipe detail (Escape)"
          >
            ×
          </Drawer.Close>
          {selectedRecipeData() && (
            <RecipeDetail recipe={selectedRecipeData()!} />
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer>
  );
};

export default RecipeDrawer;
