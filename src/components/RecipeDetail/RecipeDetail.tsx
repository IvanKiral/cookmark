import { Component } from "solid-js";
import type { RecipeData } from "~/types/Recipe";
import styles from "./RecipeDetail.module.css";

type RecipeDetailProps = {
  recipe: RecipeData;
};

const RecipeDetail: Component<RecipeDetailProps> = (props) => {
  const formatTime = (time: string | null): string => {
    return time || "N/A";
  };

  const formatServings = (servings: number | null): string => {
    return servings ? `${servings} servings` : "N/A";
  };

  return (
    <div class={styles.container} id="recipe-detail-content">
      <header class={styles.header}>
        <h2 class={styles.title} id="recipe-detail-title">{props.recipe.title}</h2>
        <p class={styles.description}>{props.recipe.description}</p>
        
        <div class={styles.metadata}>
          <span class={styles.difficulty} data-level={props.recipe.difficulty}>
            {props.recipe.difficulty.charAt(0).toUpperCase() + props.recipe.difficulty.slice(1)}
          </span>
          
          <div class={styles.timeInfo}>
            {props.recipe.prep_time && (
              <span class={styles.time}>
                <strong>Prep:</strong> {formatTime(props.recipe.prep_time)}
              </span>
            )}
            {props.recipe.cook_time && (
              <span class={styles.time}>
                <strong>Cook:</strong> {formatTime(props.recipe.cook_time)}
              </span>
            )}
            <span class={styles.time}>
              <strong>Total:</strong> {formatTime(props.recipe.total_time)}
            </span>
            <span class={styles.time}>
              <strong>Servings:</strong> {formatServings(props.recipe.servings)}
            </span>
          </div>
        </div>

        {props.recipe.cuisine && (
          <div class={styles.cuisine}>
            <strong>Cuisine:</strong> {props.recipe.cuisine}
          </div>
        )}

        {props.recipe.tags.length > 0 && (
          <div class={styles.tags}>
            {props.recipe.tags.map((tag) => (
              <span class={styles.tag}>{tag}</span>
            ))}
          </div>
        )}
      </header>

      <section class={styles.section}>
        <h3 class={styles.sectionTitle}>Ingredients</h3>
        <ul class={styles.ingredientsList}>
          {props.recipe.ingredients.map((ingredient) => (
            <li class={styles.ingredient}>
              {ingredient.amount && ingredient.unit 
                ? `${ingredient.amount} ${ingredient.unit} ${ingredient.name}`
                : ingredient.amount 
                  ? `${ingredient.amount} ${ingredient.name}`
                  : ingredient.name
              }
            </li>
          ))}
        </ul>
      </section>

      <section class={styles.section}>
        <h3 class={styles.sectionTitle}>Instructions</h3>
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