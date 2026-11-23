import type { JSX } from "@solidjs/web";
import { type Component, For, Show } from "solid-js";
import { useCurrentUser } from "~/app/user/CurrentUserContext.tsx";
import { RecipeFlagBadge } from "~/app/verdicts/RecipeFlagBadge.tsx";
import type { Recipe } from "~/shared/recipe.ts";
import type { RecipeScale } from "./createRecipeScale.ts";
import styles from "./RecipeHeader.module.css";
import { formatMinutes } from "./recipeFormat.ts";
import { ScalableAmount } from "./ScalableAmount.tsx";
import { formatAmount } from "./scaling.ts";
import { recipePageStrings } from "./strings.ts";

type RecipeHeaderProps = {
  recipe: Recipe;
  scale: RecipeScale;
};

const difficultyClasses: Record<NonNullable<Recipe["difficulty"]>, string> = {
  easy: styles.difficultyEasy,
  medium: styles.difficultyMedium,
  hard: styles.difficultyHard,
};

const MetaItem: Component<{ label: string; value: string | undefined; class?: string }> = (
  props,
) => (
  <Show when={props.value}>
    <div class={`${styles.metaItem} ${props.class ?? ""}`}>
      <span class={styles.metaLabel}>{props.label}</span>
      <span class={styles.metaValue}>{props.value}</span>
    </div>
  </Show>
);

export const RecipeHeader: Component<RecipeHeaderProps> = (props) => {
  const { isAdmin } = useCurrentUser();
  const isShouldDeleteShown = (): boolean => isAdmin() && (props.recipe.should_delete ?? false);
  // The recipe JSON is not validated, so any other value gets the unknown style.
  const difficultyClass = (): string => {
    const difficulty = props.recipe.difficulty;
    if (!difficulty) {
      return styles.difficultyUnknown;
    }
    return difficultyClasses[difficulty] ?? styles.difficultyUnknown;
  };

  const sourceLink = (sourceUrl: string): JSX.Element => (
    <a href={sourceUrl} target="_blank" rel="noopener noreferrer" class={styles.sourceLink}>
      {recipePageStrings.viewSource}
      <span class="material-symbols-outlined" aria-hidden="true">
        open_in_new
      </span>
    </a>
  );

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
        <MetaItem label={recipePageStrings.total} value={formatMinutes(props.recipe.total_time)} />
        <MetaItem label={recipePageStrings.prep} value={formatMinutes(props.recipe.prep_time)} />
        <div class={styles.metaItem}>
          <span class={styles.metaLabel}>{recipePageStrings.difficultyLabel}</span>
          <span class={`${styles.difficultyBadge} ${difficultyClass()}`}>
            {props.recipe.difficulty?.toUpperCase() ?? recipePageStrings.unknownDifficulty}
          </span>
        </div>
        <MetaItem
          label={recipePageStrings.author}
          value={props.recipe.author ? `@${props.recipe.author}` : undefined}
          class={styles.desktopOnly}
        />
      </div>

      <Show when={props.scale.servings()}>
        {(servings) => (
          <div class={styles.servings}>
            <span>{recipePageStrings.serves}</span>
            <ScalableAmount
              value={servings()}
              unit=""
              inputUnit=""
              buttonLabel={recipePageStrings.scale.changeServings(formatAmount(servings()))}
              inputLabel={recipePageStrings.scale.numberOfServings}
              isAnchor={props.scale.isScaled() && props.scale.anchorTarget() === "servings"}
              step={1}
              onStart={() => props.scale.start("servings")}
              onChange={props.scale.change}
              onCancel={props.scale.cancel}
            />
          </div>
        )}
      </Show>

      <Show when={props.recipe.tags.length > 0 || props.recipe.source_url}>
        <div class={styles.tagsRow}>
          <Show when={props.recipe.tags.length > 0}>
            <div class={styles.tagsList}>
              <For each={props.recipe.tags}>{(tag) => <span class={styles.tag}>{tag}</span>}</For>
            </div>
          </Show>
          <Show when={props.recipe.source_url}>
            {(sourceUrl) => <span class={styles.desktopOnly}>{sourceLink(sourceUrl())}</span>}
          </Show>
        </div>
      </Show>

      <Show when={props.recipe.author || props.recipe.source_url}>
        <div class={`${styles.authorRow} ${styles.phoneOnly}`}>
          <Show when={props.recipe.author} fallback={<span />}>
            {(author) => (
              <span>
                {recipePageStrings.byAuthor} <span class={styles.authorName}>@{author()}</span>
              </span>
            )}
          </Show>
          <Show when={props.recipe.source_url}>{(sourceUrl) => sourceLink(sourceUrl())}</Show>
        </div>
      </Show>
    </header>
  );
};
