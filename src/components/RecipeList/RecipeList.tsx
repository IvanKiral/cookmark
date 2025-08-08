import { Component, For } from "solid-js";
import type { Recipe } from "~/types/Recipe";
import RecipeListItem from "./RecipeListItem";
import styles from "./RecipeList.module.css";

type RecipeListProps = {
  recipes: ReadonlyArray<Recipe>;
  onRecipeSelect: (id: string) => void;
};

const RecipeList: Component<RecipeListProps> = (props) => {
  return (
    <div class={styles.container}>
      <For each={props.recipes}>
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
  );
};

export default RecipeList;
