import { type Component, createMemo, For, Show } from "solid-js";
import { formatMinutes } from "~/app/recipe-page/recipeFormat.ts";
import { createMediaQuery } from "~/app/ui/createMediaQuery.ts";
import { Pagination } from "~/app/ui/Pagination.tsx";
import type { RecipeSummary } from "~/shared/recipe.ts";
import { RecipeCard } from "./RecipeCard.tsx";
import styles from "./RecipeList.module.css";
import { RecipeListItem } from "./RecipeListItem.tsx";
import { recipeListStrings } from "./strings.ts";
import type { ViewMode } from "./ViewToggle.tsx";

type RecipeListProps = {
  recipes: ReadonlyArray<RecipeSummary>;
  currentPage: number;
  viewMode: ViewMode;
  onPageChange: (details: { page: number }) => void;
  onResetAll?: () => void;
  // Select mode: cards become toggles and pages holding selected recipes get a dot.
  selection?: {
    isSelected: (slug: string) => boolean;
    onToggle: (slug: string) => void;
  };
  // Touch only: holding a card or row.
  onLongPress?: (slug: string) => void;
};

const ITEMS_PER_PAGE_LIST = 15;
// Full rows on every card grid: 4 rows of 4 on wide screens (4 columns from
// 960px, see RecipeList.module.css), 12 below for the 2 and 3 column grids.
const ITEMS_PER_PAGE_CARD = 12;
const ITEMS_PER_PAGE_CARD_WIDE = 16;
const WIDE_CARD_GRID_QUERY = "(min-width: 960px)";

export const RecipeList: Component<RecipeListProps> = (props) => {
  // false on the server and until mount, so a wide screen briefly renders 12.
  const isWideCardGrid = createMediaQuery(WIDE_CARD_GRID_QUERY);

  const itemsPerPage = createMemo(() => {
    if (props.viewMode === "list") {
      return ITEMS_PER_PAGE_LIST;
    }
    return isWideCardGrid() ? ITEMS_PER_PAGE_CARD_WIDE : ITEMS_PER_PAGE_CARD;
  });

  const paginatedRecipes = createMemo(() => {
    const page = props.currentPage;
    const start = (page - 1) * itemsPerPage();
    const end = start + itemsPerPage();
    return props.recipes.slice(start, end);
  });

  const markedPages = createMemo((): ReadonlySet<number> | undefined => {
    const selection = props.selection;
    if (!selection) {
      return undefined;
    }
    return new Set(
      props.recipes.flatMap((recipe, index) =>
        selection.isSelected(recipe.url_slug) ? [Math.floor(index / itemsPerPage()) + 1] : [],
      ),
    );
  });

  const selectionOf = (slug: string) => {
    const selection = props.selection;
    return selection
      ? { isSelected: selection.isSelected(slug), onToggle: () => selection.onToggle(slug) }
      : undefined;
  };

  const longPressOf = (slug: string) => {
    const onLongPress = props.onLongPress;
    return onLongPress && !props.selection ? () => onLongPress(slug) : undefined;
  };

  const handlePageChange = (details: { page: number }) => {
    props.onPageChange(details);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div class={styles.wrapper}>
      <Show when={props.recipes.length > 0 && props.viewMode === "list"}>
        <div class={styles.header}>
          <span class={styles.headerName}>{recipeListStrings.name}</span>
          <span class={styles.headerDifficulty}>{recipeListStrings.difficulty}</span>
          <span class={styles.headerTime}>{recipeListStrings.time}</span>
          <span class={styles.headerFavorite} aria-hidden="true" />
        </div>
      </Show>
      <Show when={props.recipes.length === 0}>
        <div class={styles.emptyState}>
          <p class={styles.emptyTitle}>{recipeListStrings.noResults}</p>
          <p class={styles.emptyHint}>{recipeListStrings.noResultsHint}</p>
          <Show when={props.onResetAll}>
            <button type="button" class={styles.emptyClearButton} onClick={props.onResetAll}>
              {recipeListStrings.clearSearchAndFilters}
            </button>
          </Show>
        </div>
      </Show>
      <Show
        when={props.viewMode === "card"}
        fallback={
          <div class={styles.container}>
            <For each={paginatedRecipes()}>
              {(recipe) => (
                <RecipeListItem
                  urlSlug={recipe.url_slug}
                  name={recipe.name}
                  difficulty={recipe.difficulty}
                  time={formatMinutes(recipe.total_time)}
                  verdict={recipe.verdict}
                  selection={selectionOf(recipe.url_slug)}
                  onLongPress={longPressOf(recipe.url_slug)}
                />
              )}
            </For>
          </div>
        }
      >
        <div class={styles.cardGrid}>
          <For each={paginatedRecipes()}>
            {(recipe) => (
              <RecipeCard
                urlSlug={recipe.url_slug}
                name={recipe.name}
                imageUrl={recipe.image_url}
                difficulty={recipe.difficulty}
                time={formatMinutes(recipe.total_time)}
                verdict={recipe.verdict}
                selection={selectionOf(recipe.url_slug)}
                onLongPress={longPressOf(recipe.url_slug)}
              />
            )}
          </For>
        </div>
      </Show>
      <Pagination
        count={props.recipes.length}
        pageSize={itemsPerPage()}
        page={props.currentPage}
        onPageChange={handlePageChange}
        markedPages={markedPages()}
      />
    </div>
  );
};
