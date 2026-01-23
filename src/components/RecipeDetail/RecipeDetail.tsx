import type { Component } from "solid-js";
import { strings } from "~/constants/strings";
import type { RecipeData } from "~/types/Recipe";
import styles from "./RecipeDetail.module.css";

type RecipeDetailProps = {
  recipe: RecipeData;
};

const RecipeDetail: Component<RecipeDetailProps> = (props) => {
  const formatTime = (time: number | null): string => {
    return time ? `${time} min` : "N/A";
  };

  const formatServings = (servings: number | null): string => {
    return servings ? `${servings} servings` : "N/A";
  };

  return (
    <div class={styles.container} id="recipe-detail-content">
      <header class={styles.header}>
        <h2 class={styles.title} id="recipe-detail-title">
          {props.recipe.title}
        </h2>
        <p class={styles.description}>{props.recipe.description}</p>

        <div class={styles.metadata}>
          <span class={styles.difficulty} data-level={props.recipe.difficulty}>
            {props.recipe.difficulty
              ? props.recipe.difficulty.charAt(0).toUpperCase() + props.recipe.difficulty.slice(1)
              : "Unknown"}
          </span>

          <div class={styles.timeInfo}>
            {props.recipe.prep_time && (
              <span class={styles.time}>
                <strong>{strings.recipe.prep}</strong> {formatTime(props.recipe.prep_time)}
              </span>
            )}
            {props.recipe.cook_time && (
              <span class={styles.time}>
                <strong>{strings.recipe.cook}</strong> {formatTime(props.recipe.cook_time)}
              </span>
            )}
            <span class={styles.time}>
              <strong>{strings.recipe.total}</strong> {formatTime(props.recipe.total_time)}
            </span>
            <span class={styles.time}>
              <strong>{strings.recipe.servings}</strong> {formatServings(props.recipe.servings)}
            </span>
          </div>
        </div>

        {props.recipe.cuisine && (
          <div class={styles.cuisine}>
            <strong>{strings.recipe.cuisine}</strong> {props.recipe.cuisine}
          </div>
        )}

        {props.recipe.tags.length > 0 && (
          <div class={styles.tags}>
            {props.recipe.tags.map((tag) => (
              <span class={styles.tag}>{tag}</span>
            ))}
          </div>
        )}

        {props.recipe.source_url && (
          <div class={styles.sourceUrl}>
            <a href={props.recipe.source_url} target="_blank" rel="noopener noreferrer">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-label="External link"
              >
                <title>External link</title>
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              {strings.recipe.viewSource}
            </a>
          </div>
        )}
      </header>

      <section class={styles.section}>
        <h3 class={styles.sectionTitle}>{strings.recipe.ingredients}</h3>
        <ul class={styles.ingredientsList}>
          {props.recipe.ingredients.map((ingredient) => (
            <li class={styles.ingredient}>
              {ingredient.amount && ingredient.unit
                ? `${ingredient.amount} ${ingredient.unit} ${ingredient.name}`
                : ingredient.amount
                  ? `${ingredient.amount} ${ingredient.name}`
                  : ingredient.name}
            </li>
          ))}
        </ul>
      </section>

      <section class={styles.section}>
        <h3 class={styles.sectionTitle}>{strings.recipe.instructions}</h3>
        <ol class={styles.instructionsList}>
          {props.recipe.instructions.map((instruction, index) => (
            <li class={styles.instruction}>
              <span class={styles.instructionNumber}>{index + 1}</span>
              <span class={styles.instructionText}>{instruction}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
};

export default RecipeDetail;
