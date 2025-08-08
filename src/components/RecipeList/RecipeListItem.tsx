import { Component } from "solid-js";
import styles from "./RecipeListItem.module.css";

type RecipeListItemProps = {
  name: string;
  difficulty: "Easy" | "Medium" | "Hard";
  time: string;
};

const RecipeListItem: Component<RecipeListItemProps> = (props) => {
  return (
    <div class={styles.listItem}>
      <h3 class={styles.title}>{props.name}</h3>
      <span class={styles.difficulty}>{props.difficulty}</span>
      <span class={styles.time}>
        {props.time}
      </span>
    </div>
  );
};

export default RecipeListItem;
