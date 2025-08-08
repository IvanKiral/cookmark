import { Component, For } from "solid-js";
import type { Recipe } from "~/types/Recipe";
import RecipeListItem from "./RecipeListItem";
import styles from "./RecipeList.module.css";

type RecipeListProps = {
  recipes: Recipe[];
};

const RecipeList: Component<RecipeListProps> = (props) => {
  return (
    <div class={styles.container}>
      <For each={props.recipes}>
        {(recipe) => (
          <RecipeListItem
            name={recipe.name}
            difficulty={recipe.difficulty}
            time={recipe.time}
          />
        )}
      </For>
    </div>
  );
};

export default RecipeList;
