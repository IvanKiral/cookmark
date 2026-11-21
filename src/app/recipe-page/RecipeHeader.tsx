import { type Component, For, Show } from "solid-js";
import { useCurrentUser } from "~/app/user/CurrentUserContext.tsx";
import { RecipeFlagBadge } from "~/app/verdicts/RecipeFlagBadge.tsx";
import type { Recipe } from "~/shared/recipe.ts";
import styles from "./RecipeHeader.module.css";
import { formatMinutes, formatServings } from "./recipeFormat.ts";
import { recipePageStrings } from "./strings.ts";

type RecipeHeaderProps = {
  recipe: Recipe;
};

const difficultyClasses: Record<NonNullable<Recipe["difficulty"]>, string> = {
  easy: styles.difficultyEasy,
  medium: styles.difficultyMedium,
  hard: styles.difficultyHard,
};

export const RecipeHeader: Component<RecipeHeaderProps> = (props) => {
  const { isAdmin } = useCurrentUser();
  const isShouldDeleteShown = (): boolean => isAdmin() && (props.recipe.should_delete ?? false);
  const difficultyClass = (): string =>
    props.recipe.difficulty ? difficultyClasses[props.recipe.difficulty] : styles.difficultyUnknown;

  return (
    <header class={styles.header}>
      <div class={styles.headerTop}>
        <Show when={props.recipe.verdict || isShouldDeleteShown()}>
          <div class={styles.badges}>
            <Show when={props.recipe.verdict}>
              {(verdict) => <RecipeFlagBadge kind={verdict()} />}
            </Show>
            <Show when={isShouldDeleteShown()}>
              <RecipeFlagBadge kind="should-delete" />
            </Show>
          </div>
        </Show>
        <h1 class={styles.title}>{props.recipe.title}</h1>
        <p class={styles.description}>{props.recipe.description}</p>
      </div>

      <div class={styles.metaBar}>
        <div class={styles.metaItem}>
          <span class={styles.metaLabel}>{recipePageStrings.difficultyLabel}</span>
          <span class={`${styles.difficultyBadge} ${difficultyClass()}`}>
            {props.recipe.difficulty?.toUpperCase() ?? recipePageStrings.unknownDifficulty}
          </span>
        </div>
        <Show when={props.recipe.prep_time}>
          <div class={styles.metaItem}>
            <span class={styles.metaLabel}>{recipePageStrings.prep}</span>
            <span class={styles.metaValue}>{formatMinutes(props.recipe.prep_time)}</span>
          </div>
        </Show>
        <div class={styles.metaItem}>
          <span class={styles.metaLabel}>{recipePageStrings.total}</span>
          <span class={styles.metaValue}>{formatMinutes(props.recipe.total_time)}</span>
        </div>
        <div class={styles.metaItem}>
          <span class={styles.metaLabel}>{recipePageStrings.servings}</span>
          <span class={styles.metaValue}>{formatServings(props.recipe.servings)}</span>
        </div>
        <Show when={props.recipe.author}>
          {(author) => (
            <div class={styles.metaItem}>
              <span class={styles.metaLabel}>{recipePageStrings.author}</span>
              <span class={styles.metaValue}>@{author()}</span>
            </div>
          )}
        </Show>
      </div>

      <Show when={props.recipe.tags.length > 0 || props.recipe.source_url}>
        <div class={styles.tagsRow}>
          <Show when={props.recipe.tags.length > 0}>
            <div class={styles.tagsList}>
              <For each={props.recipe.tags}>{(tag) => <span class={styles.tag}>{tag}</span>}</For>
            </div>
          </Show>
          <Show when={props.recipe.source_url}>
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
  );
};
