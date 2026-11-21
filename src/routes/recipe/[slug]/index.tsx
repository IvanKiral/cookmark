import { A, createAsync, useLocation, useParams } from "@solidjs/router";
import { type Component, For, Match, Show, Suspense, Switch } from "solid-js";
import { RecipeFlagToggle } from "~/app/admin/RecipeFlagToggle.tsx";
import { RecipeVerdictToggle } from "~/app/admin/RecipeVerdictToggle.tsx";
import { adminStrings } from "~/app/admin/strings.ts";
import { getRecipeBySlug } from "~/app/api/recipeQueries.ts";
import { MarkButton } from "~/app/marks/MarkButton.tsx";
import { RecipeImage } from "~/app/recipe-page/RecipeImage.tsx";
import { RecipeVideo } from "~/app/recipe-page/RecipeVideo.tsx";
import { formatMinutes } from "~/app/recipe-page/recipeFormat.ts";
import { recipePageStrings } from "~/app/recipe-page/strings.ts";
import { useCurrentUser } from "~/app/user/CurrentUserContext.tsx";
import { RecipeFlagBadge } from "~/app/verdicts/RecipeFlagBadge.tsx";
import type { Ingredient } from "~/shared/recipe.ts";
import { getSourceImageUrl } from "~/shared/recipeImage.ts";
import iconButtonStyles from "~/styles/iconToggleButton.module.css";
import styles from "./index.module.css";

type RecipeNavState = {
  fromSearch?: string;
};

const RecipePage: Component = () => {
  const params = useParams<{ slug: string }>();
  const location = useLocation();
  const recipe = createAsync(() => getRecipeBySlug(params.slug));
  const { isAdmin } = useCurrentUser();

  const backHref = (): string => {
    const state = location.state as RecipeNavState | null;
    return state?.fromSearch ? `/${state.fromSearch}` : "/";
  };

  const formatServings = (servings: number | null): string =>
    servings ? recipePageStrings.servingsCount(servings) : recipePageStrings.notAvailable;

  const formatIngredient = (ingredient: Ingredient): string => {
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
            <h1>{recipePageStrings.notFound}</h1>
            <A href="/">{recipePageStrings.backToList}</A>
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
                    aria-label={recipePageStrings.backToList}
                  >
                    <span class="material-symbols-outlined">close</span>
                  </A>
                  {/* Admins get extra action buttons; the logo would crowd them on phones. */}
                  <Show when={!isAdmin()}>
                    <A href="/" class={styles.logo}>
                      Cookmark
                    </A>
                  </Show>
                </div>
                <div class={styles.navActions}>
                  <Show when={isAdmin()}>
                    <A
                      href={`/recipe/${params.slug}/edit`}
                      state={location.state}
                      class={iconButtonStyles.button}
                      aria-label={adminStrings.edit.edit(recipeData().title)}
                    >
                      <span class="material-symbols-outlined" aria-hidden="true">
                        edit
                      </span>
                    </A>
                  </Show>
                  <RecipeVerdictToggle
                    slug={params.slug}
                    name={recipeData().title}
                    verdict={recipeData().verdict}
                  />
                  <RecipeFlagToggle
                    flag="should-delete"
                    slug={params.slug}
                    name={recipeData().title}
                    isSet={recipeData().should_delete ?? false}
                  />
                  <MarkButton mark="favorite" slug={params.slug} name={recipeData().title} />
                  <MarkButton mark="to-try" slug={params.slug} name={recipeData().title} />
                </div>
              </div>
            </nav>

            <main class={styles.main}>
              <header class={styles.header}>
                <div class={styles.headerTop}>
                  <Show when={recipeData().verdict || (isAdmin() && recipeData().should_delete)}>
                    <div class={styles.badges}>
                      <Show when={recipeData().verdict}>
                        {(verdict) => <RecipeFlagBadge kind={verdict()} />}
                      </Show>
                      <Show when={isAdmin() && recipeData().should_delete}>
                        <RecipeFlagBadge kind="should-delete" />
                      </Show>
                    </div>
                  </Show>
                  <h1 class={styles.title}>{recipeData().title}</h1>
                  <p class={styles.description}>{recipeData().description}</p>
                </div>

                <div class={styles.metaBar}>
                  <div class={styles.metaItem}>
                    <span class={styles.metaLabel}>{recipePageStrings.difficultyLabel}</span>
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
                      <span class={styles.metaLabel}>{recipePageStrings.prep}</span>
                      <span class={styles.metaValue}>{formatMinutes(recipeData().prep_time)}</span>
                    </div>
                  </Show>
                  <div class={styles.metaItem}>
                    <span class={styles.metaLabel}>{recipePageStrings.total}</span>
                    <span class={styles.metaValue}>{formatMinutes(recipeData().total_time)}</span>
                  </div>
                  <div class={styles.metaItem}>
                    <span class={styles.metaLabel}>{recipePageStrings.servings}</span>
                    <span class={styles.metaValue}>{formatServings(recipeData().servings)}</span>
                  </div>
                  <Show when={recipeData().author}>
                    {(author) => (
                      <div class={styles.metaItem}>
                        <span class={styles.metaLabel}>{recipePageStrings.author}</span>
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
                          {recipePageStrings.viewSource}
                          <span class="material-symbols-outlined">open_in_new</span>
                        </a>
                      )}
                    </Show>
                  </div>
                </Show>
              </header>

              <div class={styles.content}>
                <section class={styles.ingredientsSection}>
                  <h2 class={styles.sectionTitle}>{recipePageStrings.ingredients}</h2>
                  <ul class={styles.ingredientsList}>
                    {recipeData().ingredients.map((ingredient) => (
                      <li class={styles.ingredientItem}>
                        <span>{formatIngredient(ingredient)}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section class={styles.instructionsSection}>
                  <h2 class={styles.sectionTitle}>{recipePageStrings.instructions}</h2>
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

              <Switch>
                <Match when={recipeData().video_url}>
                  {(videoUrl) => <RecipeVideo src={videoUrl()} title={recipeData().title} />}
                </Match>
                <Match when={getSourceImageUrl(recipeData())}>
                  {(imageUrl) => <RecipeImage src={imageUrl()} title={recipeData().title} />}
                </Match>
              </Switch>
            </main>
          </div>
        )}
      </Show>
    </Suspense>
  );
};

export default RecipePage;
