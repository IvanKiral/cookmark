import { type Component, createMemo, For, Show } from "solid-js";
import { useT } from "~/lib/i18nContext";
import type { Recipe } from "~/types/Recipe";
import { Pagination } from "../Pagination/Pagination.jsx";
import styles from "./RecipeList.module.css";
import RecipeListItem from "./RecipeListItem.jsx";

type RecipeListProps = {
  recipes: ReadonlyArray<Recipe>;
  onRecipeSelect: (id: string) => void;
  currentPage: number;
  onPageChange: (details: { page: number }) => void;
};

const ITEMS_PER_PAGE = 10;

const RecipeList: Component<RecipeListProps> = (props) => {
  const t = useT();

  const paginatedRecipes = createMemo(() => {
    const page = props.currentPage;
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return props.recipes.slice(start, end);
  });

  const handlePageChange = (details: { page: number }) => {
    props.onPageChange(details);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div class={styles.wrapper}>
      <Show when={props.recipes.length > 0}>
        <div class={styles.header}>
          <span class={styles.headerName}>{t.recipeList.name}</span>
          <span class={styles.headerDifficulty}>{t.recipeList.difficulty}</span>
          <span class={styles.headerTime}>{t.recipeList.time}</span>
        </div>
      </Show>
      <div class={styles.container}>
        <For each={paginatedRecipes()}>
          {(recipe) => (
            <RecipeListItem
              id={recipe.id}
              name={recipe.name}
              difficulty={recipe.difficulty}
              time={recipe.time}
              onSelect={props.onRecipeSelect}
            />
          )}
        </For>
      </div>
      <Pagination
        count={props.recipes.length}
        pageSize={ITEMS_PER_PAGE}
        page={props.currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default RecipeList;
