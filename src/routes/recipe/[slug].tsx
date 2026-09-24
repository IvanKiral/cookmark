import { A, createAsync, useLocation, useParams } from "@solidjs/router";
import { type Component, For, Show, Suspense } from "solid-js";
import FavoriteButton from "~/components/FavoriteButton/FavoriteButton.tsx";
import RecipeVideo from "~/components/RecipeVideo/RecipeVideo.tsx";
import { strings } from "~/constants/strings.ts";
import { getRecipeBySlug } from "~/lib/recipeQueries.ts";
import styles from "./[slug].module.css";

type RecipeNavState = {
  fromSearch?: string;
};

const RecipePage: Component = () => {
  const params = useParams<{ slug: string }>();
  const location = useLocation();
  const recipe = createAsync(() => getRecipeBySlug(params.slug));

  const backHref = (): string => {
    const state = location.state as RecipeNavState | null;
    return state?.fromSearch ? `/${state.fromSearch}` : "/";
  };

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
    <Suspense>
      <Show
        when={recipe()}
        fallback={
          <div class={styles.notFound}>
            <h1>{strings.recipe.notFound}</h1>
            <A href="/">{strings.recipe.backToList}</A>
          </div>
        }
      >
        {(recipeData) => (
          <div class={styles.page}>
            <nav class={styles.nav}>
              <div class={styles.navInner}>
                <div class={styles.navLeading}>
                  <A
                    href={backHref()}
                    class={`${styles.navButton} ${styles.closeButton}`}
                    aria-label={strings.recipe.backToList}
                  >
                    <span class="material-symbols-outlined">close</span>
                  </A>
                  <A href="/" class={styles.logo}>
                    Cookmark
                  </A>
                </div>
                <div class={styles.navActions}>
                  <FavoriteButton slug={params.slug} name={recipeData().title} />
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
                    <span class={styles.metaLabel}>{strings.recipe.difficultyLabel}</span>
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
                      <span class={styles.metaLabel}>{strings.recipe.prep}</span>
                      <span class={styles.metaValue}>{formatTime(recipeData().prep_time)}</span>
                    </div>
                  </Show>
                  <div class={styles.metaItem}>
                    <span class={styles.metaLabel}>{strings.recipe.total}</span>
                    <span class={styles.metaValue}>{formatTime(recipeData().total_time)}</span>
                  </div>
                  <div class={styles.metaItem}>
                    <span class={styles.metaLabel}>{strings.recipe.servings}</span>
                    <span class={styles.metaValue}>{formatServings(recipeData().servings)}</span>
                  </div>
                  <Show when={recipeData().author}>
                    {(author) => (
                      <div class={styles.metaItem}>
                        <span class={styles.metaLabel}>{strings.recipe.author}</span>
                        <span class={styles.metaValue}>@{author()}</span>
                      </div>
                    )}
                  </Show>
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
                          {strings.recipe.viewSource}
                          <span class="material-symbols-outlined">open_in_new</span>
                        </a>
                      )}
                    </Show>
                  </div>
                </Show>
              </header>

              <div class={styles.content}>
                <section class={styles.ingredientsSection}>
                  <h2 class={styles.sectionTitle}>{strings.recipe.ingredients}</h2>
                  <ul class={styles.ingredientsList}>
                    {recipeData().ingredients.map((ingredient) => (
                      <li class={styles.ingredientItem}>
                        <span>{formatIngredient(ingredient)}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section class={styles.instructionsSection}>
                  <h2 class={styles.sectionTitle}>{strings.recipe.instructions}</h2>
                  <For each={recipeData().instructions}>
                    {(section) => (
                      <div class={styles.instructionGroup}>
                        <Show when={recipeData().instructions.length > 1}>
                          <h3 class={styles.instructionGroupTitle}>{section.name}</h3>
                        </Show>
                        <ol class={styles.instructionsList}>
                          {section.steps.map((step, index) => (
                            <li class={styles.instructionItem}>
                              <span class={styles.stepNumber}>{index + 1}</span>
                              <div class={styles.stepContent}>
                                <p class={styles.stepText}>{step}</p>
                              </div>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </For>
                </section>
              </div>

              <Show when={recipeData().video_url}>
                {(videoUrl) => <RecipeVideo src={videoUrl()} title={recipeData().title} />}
              </Show>
            </main>
          </div>
        )}
      </Show>
    </Suspense>
  );
};

export default RecipePage;
