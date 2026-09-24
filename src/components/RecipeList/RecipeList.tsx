import { type Component, createMemo, For, Show } from "solid-js";
import RecipeCard from "~/components/RecipeCard/RecipeCard.tsx";
import type { ViewMode } from "~/components/ViewToggle/ViewToggle.tsx";
import { strings } from "~/constants/strings.ts";
import type { Recipe } from "~/types/Recipe.ts";
import { Pagination } from "../Pagination/Pagination.jsx";
import styles from "./RecipeList.module.css";
import RecipeListItem from "./RecipeListItem.jsx";

type RecipeListProps = {
  recipes: ReadonlyArray<Recipe>;
  currentPage: number;
  viewMode: ViewMode;
  onPageChange: (details: { page: number }) => void;
  onResetAll?: () => void;
};

const ITEMS_PER_PAGE_LIST = 15;
// 12 divides evenly by every card-grid column count (2/3/4), so the last row
// is never ragged regardless of breakpoint.
const ITEMS_PER_PAGE_CARD = 12;

const RecipeList: Component<RecipeListProps> = (props) => {
  const itemsPerPage = createMemo(() =>
    props.viewMode === "card" ? ITEMS_PER_PAGE_CARD : ITEMS_PER_PAGE_LIST,
  );

  const paginatedRecipes = createMemo(() => {
    const page = props.currentPage;
    const start = (page - 1) * itemsPerPage();
    const end = start + itemsPerPage();
    return props.recipes.slice(start, end);
  });

  const handlePageChange = (details: { page: number }) => {
    props.onPageChange(details);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div class={styles.wrapper}>
      <Show when={props.recipes.length > 0 && props.viewMode === "list"}>
        <div class={styles.header}>
          <span class={styles.headerName}>{strings.recipeList.name}</span>
          <span class={styles.headerDifficulty}>{strings.recipeList.difficulty}</span>
          <span class={styles.headerTime}>{strings.recipeList.time}</span>
          <span class={styles.headerFavorite} aria-hidden="true" />
        </div>
      </Show>
      <Show when={props.recipes.length === 0}>
        <div class={styles.emptyState}>
          <p class={styles.emptyTitle}>{strings.search.noResults}</p>
          <p class={styles.emptyHint}>{strings.search.noResultsHint}</p>
          <Show when={props.onResetAll}>
            <button type="button" class={styles.emptyClearButton} onClick={props.onResetAll}>
              {strings.search.clearSearchAndFilters}
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
                  time={recipe.time}
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
                difficulty={recipe.difficulty}
                time={recipe.time}
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
      />
    </div>
  );
};

export default RecipeList;
