import { type Accessor, createMemo, createSignal } from "solid-js";
import type { Recipe } from "~/shared/recipe.ts";
import { parseAmount, roundScaledAmount } from "./scaling.ts";

// What the user scales by: an ingredient (its index) or the servings.
export type ScaleTarget = number | "servings";

type ScaleAnchor = {
  slug: string;
  target: ScaleTarget;
  // 0 while the typed value is empty or unparseable: no scaling.
  value: number;
};

export type RecipeScale = {
  factor: Accessor<number>;
  isScaled: Accessor<boolean>;
  anchorTarget: Accessor<ScaleTarget | undefined>;
  anchorValue: Accessor<number>;
  // undefined for text and missing amounts, which never scale.
  ingredientAmount: (index: number) => number | undefined;
  servings: Accessor<number | undefined>;
  // Opens an edit of the target; the scale only changes once a value is typed.
  start: (target: ScaleTarget) => void;
  // Anchors the scale on the edited target at the typed value.
  change: (value: number) => void;
  // Restores the anchor from before the current edit.
  cancel: () => void;
  reset: () => void;
};

const originalServings = (recipe: Recipe | undefined): number | undefined =>
  recipe?.servings && recipe.servings > 0 ? recipe.servings : undefined;

// The scale state of the open recipe. It belongs to one slug, so it starts
// over on another recipe and is gone once the page is left.
export const createRecipeScale = (
  slug: Accessor<string>,
  recipe: Accessor<Recipe | undefined>,
): RecipeScale => {
  const [anchor, setAnchor] = createSignal<ScaleAnchor | undefined>(undefined);
  const [previousAnchor, setPreviousAnchor] = createSignal<ScaleAnchor | undefined>(undefined);
  const [editingTarget, setEditingTarget] = createSignal<ScaleTarget | undefined>(undefined);

  const currentAnchor = createMemo((): ScaleAnchor | undefined => {
    const value = anchor();
    return value?.slug === slug() ? value : undefined;
  });

  const originalOf = (target: ScaleTarget): number | undefined => {
    if (target === "servings") {
      return originalServings(recipe());
    }
    const ingredient = recipe()?.ingredients[target];
    return ingredient ? parseAmount(ingredient.amount) : undefined;
  };

  const factor = createMemo((): number => {
    const current = currentAnchor();
    if (!current || current.value <= 0) {
      return 1;
    }
    const original = originalOf(current.target);
    return original ? current.value / original : 1;
  });

  const isAnchoredOn = (target: ScaleTarget): boolean => {
    const current = currentAnchor();
    return current?.target === target && current.value > 0;
  };

  const ingredientAmount = (index: number): number | undefined => {
    const ingredient = recipe()?.ingredients[index];
    const original = ingredient ? parseAmount(ingredient.amount) : undefined;
    if (!(ingredient && original)) {
      return undefined;
    }
    if (isAnchoredOn(index)) {
      return currentAnchor()?.value;
    }
    return factor() === 1 ? original : roundScaledAmount(original * factor(), ingredient.unit);
  };

  const servings = createMemo((): number | undefined => {
    const original = originalServings(recipe());
    if (!original) {
      return undefined;
    }
    if (isAnchoredOn("servings")) {
      return currentAnchor()?.value;
    }
    return Math.max(1, Math.round(original * factor()));
  });

  return {
    factor,
    isScaled: () => factor() !== 1,
    anchorTarget: () => currentAnchor()?.target,
    anchorValue: () => currentAnchor()?.value ?? 0,
    ingredientAmount,
    servings,
    start: (target) => {
      setPreviousAnchor(currentAnchor());
      setEditingTarget(target);
    },
    change: (value) => {
      const target = editingTarget();
      if (target !== undefined) {
        setAnchor({ slug: slug(), target, value });
      }
    },
    cancel: () => setAnchor(previousAnchor()),
    reset: () => {
      setAnchor(undefined);
      setPreviousAnchor(undefined);
    },
  };
};
