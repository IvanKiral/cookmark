import { A, useParams } from "@solidjs/router";
import { type Component, Show } from "solid-js";
import type { Locale } from "~/i18n";
import { useT } from "~/lib/i18nContext";
import { getRecipeDataBySlug } from "~/utils/loadRecipes";
import styles from "./[slug].module.css";

const RecipePage: Component = () => {
  const t = useT();
  const params = useParams<{ lang: Locale; slug: string }>();
  const recipe = () => getRecipeDataBySlug(params.slug);

  const formatTime = (time: number | null): string => {
    if (!time) {
      return "N/A";
    }
    return `${time} min`;
  };

  const formatServings = (servings: number | null): string => {
    if (!servings) {
      return "N/A";
    }
    return `${servings} servings`;
  };

  const formatIngredient = (ingredient: {
    name: string;
    amount: string | null;
    unit: string | null;
  }): string => {
    if (ingredient.amount && ingredient.unit) {
      return `${ingredient.amount} ${ingredient.unit} ${ingredient.name}`;
    }
    if (ingredient.amount) {
      return `${ingredient.amount} ${ingredient.name}`;
    }
    return ingredient.name;
  };

  const getDifficultyClass = (difficulty: string | null): string => {
    switch (difficulty) {
      case "easy":
        return styles.difficultyEasy;
      case "medium":
        return styles.difficultyMedium;
      case "hard":
        return styles.difficultyHard;
      default:
        return styles.difficultyUnknown;
    }
  };

  return (
    <Show
      when={recipe()}
      fallback={
        <div class={styles.notFound}>
          <h1>{t.recipe.notFound}</h1>
          <A href={`/${params.lang}`}>{t.recipe.backToList}</A>
        </div>
      }
    >
      {(recipeData) => (
        <div class={styles.page}>
          <nav class={styles.nav}>
            <div class={styles.navInner}>
              <A href={`/${params.lang}`} class={styles.logo}>
                Cookmark
              </A>
              <div class={styles.navActions}>
                <A
                  href={`/${params.lang}`}
                  class={styles.navButton}
                  aria-label={t.recipe.backToList}
                >
                  <span class="material-symbols-outlined">close</span>
                </A>
              </div>
            </div>
          </nav>

          <main class={styles.main}>
            <header class={styles.header}>
              <div class={styles.headerTop}>
                <h1 class={styles.title}>{recipeData().title}</h1>
                <p class={styles.description}>{recipeData().description}</p>
              </div>

              <div class={styles.metaBar}>
                <div class={styles.metaItem}>
                  <span class={styles.metaLabel}>{t.recipe.difficultyLabel}</span>
                  <span
                    class={`${styles.difficultyBadge} ${getDifficultyClass(recipeData().difficulty)}`}
                  >
                    {(() => {
                      const diff = recipeData().difficulty;
                      return diff ? diff.toUpperCase() : "UNKNOWN";
                    })()}
                  </span>
                </div>
                <Show when={recipeData().prep_time}>
                  <div class={styles.metaItem}>
                    <span class={styles.metaLabel}>{t.recipe.prep}</span>
                    <span class={styles.metaValue}>{formatTime(recipeData().prep_time)}</span>
                  </div>
                </Show>
                <div class={styles.metaItem}>
                  <span class={styles.metaLabel}>{t.recipe.total}</span>
                  <span class={styles.metaValue}>{formatTime(recipeData().total_time)}</span>
                </div>
                <div class={styles.metaItem}>
                  <span class={styles.metaLabel}>{t.recipe.servings}</span>
                  <span class={styles.metaValue}>{formatServings(recipeData().servings)}</span>
                </div>
              </div>

              <Show when={recipeData().tags.length > 0 || recipeData().source_url}>
                <div class={styles.tagsRow}>
                  <Show when={recipeData().tags.length > 0}>
                    <div class={styles.tagsList}>
                      {recipeData().tags.map((tag) => (
                        <span class={styles.tag}>{tag}</span>
                      ))}
                    </div>
                  </Show>
                  <Show when={recipeData().source_url}>
                    {(sourceUrl) => (
                      <a
                        href={sourceUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        class={styles.sourceLink}
                      >
                        {t.recipe.viewSource}
                        <span class="material-symbols-outlined">open_in_new</span>
                      </a>
                    )}
                  </Show>
                </div>
              </Show>
            </header>

            <div class={styles.content}>
              <section class={styles.ingredientsSection}>
                <h2 class={styles.sectionTitle}>{t.recipe.ingredients}</h2>
                <ul class={styles.ingredientsList}>
                  {recipeData().ingredients.map((ingredient) => (
                    <li class={styles.ingredientItem}>
                      <span>{formatIngredient(ingredient)}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section class={styles.instructionsSection}>
                <h2 class={styles.sectionTitle}>{t.recipe.instructions}</h2>
                <ol class={styles.instructionsList}>
                  {recipeData().instructions.map((instruction, index) => (
                    <li class={styles.instructionItem}>
                      <span class={styles.stepNumber}>{index + 1}</span>
                      <div class={styles.stepContent}>
                        <p class={styles.stepText}>{instruction}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            </div>
          </main>
        </div>
      )}
    </Show>
  );
};

export default RecipePage;
