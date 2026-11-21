import { type Component, For, Show } from "solid-js";
import type { Recipe } from "~/shared/recipe.ts";
import styles from "./RecipeBody.module.css";
import { formatIngredient } from "./recipeFormat.ts";
import { recipePageStrings } from "./strings.ts";

type RecipeBodyProps = {
  recipe: Recipe;
};

// Ingredients next to the instructions on wide screens, stacked on phones.
export const RecipeBody: Component<RecipeBodyProps> = (props) => (
  <div class={styles.content}>
    <section>
      <h2 class={styles.sectionTitle}>{recipePageStrings.ingredients}</h2>
      <ul class={styles.ingredientsList}>
        <For each={props.recipe.ingredients}>
          {(ingredient) => (
            <li class={styles.ingredientItem}>
              <span>{formatIngredient(ingredient)}</span>
            </li>
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
