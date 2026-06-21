import { A, useLocation } from "@solidjs/router";
import type { Component } from "solid-js";
import FavoriteButton from "~/components/FavoriteButton/FavoriteButton.tsx";
import styles from "./RecipeListItem.module.css";

type RecipeListItemProps = {
  urlSlug: string;
  name: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Unknown";
  time: string;
};

const RecipeListItem: Component<RecipeListItemProps> = (props) => {
  const location = useLocation();

  return (
    <A
      href={`/recipe/${props.urlSlug}`}
      state={{ fromSearch: location.search }}
      class={styles.listItem}
    >
      <h3 class={styles.title}>{props.name}</h3>
      <span class={styles.difficulty} data-level={props.difficulty}>
        {props.difficulty}
      </span>
      <span class={styles.time}>{props.time}</span>
      <div class={styles.favorite}>
        <FavoriteButton slug={props.urlSlug} name={props.name} />
      </div>
    </A>
  );
};

export default RecipeListItem;
