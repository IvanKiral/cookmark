import { type Component, For, Show } from "solid-js";
import type { Ingredient, Recipe } from "~/shared/recipe.ts";
import type { RecipeScale } from "./createRecipeScale.ts";
import styles from "./RecipeBody.module.css";
import { formatIngredient } from "./recipeFormat.ts";
import { ScalableAmount } from "./ScalableAmount.tsx";
import { formatAmount, formatFactor, getAmountStep } from "./scaling.ts";
import { recipePageStrings } from "./strings.ts";

type RecipeBodyProps = {
  recipe: Recipe;
  scale: RecipeScale;
};

const strings = recipePageStrings.scale;

const ScaleBanner: Component<{ recipe: Recipe; scale: RecipeScale }> = (props) => {
  const anchorText = (): string => {
    const target = props.scale.anchorTarget();
    const value = formatAmount(props.scale.anchorValue());
    if (target === "servings" || target === undefined) {
      return strings.servingsCount(value);
    }
    const ingredient = props.recipe.ingredients[target];
    return [value, ingredient?.unit, ingredient?.name].filter(Boolean).join(" ");
  };

  return (
    <div class={styles.scaleBanner}>
      <span class={`material-symbols-outlined ${styles.scaleIcon}`} aria-hidden="true">
        scale
      </span>
      <span class={styles.scaleText}>
        {strings.scaledTo} <strong>{anchorText()}</strong>{" "}
        {strings.factor(formatFactor(props.scale.factor()))}
      </span>
      <button type="button" class={styles.scaleReset} onClick={() => props.scale.reset()}>
        {strings.reset}
      </button>
    </div>
  );
};

const IngredientRow: Component<{ ingredient: Ingredient; index: number; scale: RecipeScale }> = (
  props,
) => {
  const amount = (): number | undefined => props.scale.ingredientAmount(props.index);
  const unit = (): string => props.ingredient.unit ?? "";

  return (
    <li class={styles.ingredientItem}>
      <Show when={amount()} fallback={<span>{formatIngredient(props.ingredient)}</span>}>
        {(value) => (
          <>
            <ScalableAmount
              value={value()}
              unit={unit()}
              inputUnit={unit() || strings.pieces}
              buttonLabel={strings.changeAmount(
                props.ingredient.name,
                [formatAmount(value()), unit()].filter(Boolean).join(" "),
              )}
              inputLabel={strings.amountOf(props.ingredient.name)}
              isAnchor={props.scale.isScaled() && props.scale.anchorTarget() === props.index}
              step={getAmountStep(props.ingredient.unit)}
              onStart={() => props.scale.start(props.index)}
              onChange={props.scale.change}
              onCancel={props.scale.cancel}
            />
            <span class={styles.ingredientName}>{props.ingredient.name}</span>
          </>
        )}
      </Show>
    </li>
  );
};

// Ingredients next to the instructions on wide screens, stacked on phones.
export const RecipeBody: Component<RecipeBodyProps> = (props) => {
  const hasScalableAmounts = (): boolean =>
    props.recipe.ingredients.some((_, index) => props.scale.ingredientAmount(index) !== undefined);

  return (
    <div class={styles.content}>
      <section class={styles.ingredients}>
        <h2 class={styles.sectionTitle}>{recipePageStrings.ingredients}</h2>
        <Show when={props.scale.isScaled()}>
          <ScaleBanner recipe={props.recipe} scale={props.scale} />
        </Show>
        <Show when={hasScalableAmounts()}>
          <p class={`${styles.scaleHint} ${styles.phoneOnly}`}>{strings.phoneHint}</p>
          <p class={`${styles.scaleHint} ${styles.desktopOnly}`}>
            {strings.desktopHint} <kbd>{strings.desktopKeys.up}</kbd>{" "}
            <kbd>{strings.desktopKeys.down}</kbd> {strings.desktopStep}{" "}
            <kbd>{strings.desktopKeys.enter}</kbd> {strings.desktopConfirm}{" "}
            <kbd>{strings.desktopKeys.escape}</kbd> {strings.desktopCancel}
          </p>
        </Show>
        <ul class={styles.ingredientsList}>
          <For each={props.recipe.ingredients}>
            {(ingredient, index) => (
              <IngredientRow ingredient={ingredient} index={index()} scale={props.scale} />
            )}
          </For>
        </ul>
      </section>

      <section>
        <h2 class={styles.sectionTitle}>{recipePageStrings.instructions}</h2>
        <For each={props.recipe.instructions}>
          {(section) => (
            <div class={styles.instructionGroup}>
              {/* A single section needs no name of its own. */}
              <Show when={props.recipe.instructions.length > 1}>
                <h3 class={styles.instructionGroupTitle}>{section.name}</h3>
              </Show>
              <ol class={styles.instructionsList}>
                <For each={section.steps}>
                  {(step, index) => (
                    <li class={styles.instructionItem}>
                      <span class={styles.stepNumber}>{index() + 1}</span>
                      <div class={styles.stepContent}>
                        <p class={styles.stepText}>{step}</p>
                      </div>
                    </li>
                  )}
                </For>
              </ol>
            </div>
          )}
        </For>
      </section>
    </div>
  );
};
