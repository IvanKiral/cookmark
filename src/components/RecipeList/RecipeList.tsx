import { type Component, createMemo, For, Show } from "solid-js";
import RecipeCard from "~/components/RecipeCard/RecipeCard.tsx";
import type { ViewMode } from "~/components/ViewToggle/ViewToggle.tsx";
import { strings } from "~/constants/strings.ts";
import type { Recipe } from "~/types/Recipe.ts";
import createMediaQuery from "~/utils/createMediaQuery.ts";
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
// Full rows on every card grid: 4 rows of 4 on wide screens (4 columns from
// 960px, see RecipeList.module.css), 12 below for the 2 and 3 column grids.
const ITEMS_PER_PAGE_CARD = 12;
const ITEMS_PER_PAGE_CARD_WIDE = 16;
const WIDE_CARD_GRID_QUERY = "(min-width: 960px)";

const RecipeList: Component<RecipeListProps> = (props) => {
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
                  isChefPick={recipe.is_chef_pick}
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
                time={recipe.time}
                isChefPick={recipe.is_chef_pick}
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
