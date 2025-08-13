import type { Component } from "solid-js";
import styles from "./RecipeListItem.module.css";

type RecipeListItemProps = {
  id: string;
  name: string;
  difficulty: "Easy" | "Medium" | "Hard";
  time: string;
  onSelect: (id: string) => void;
};

const RecipeListItem: Component<RecipeListItemProps> = (props) => {
  const handleClick = () => {
    props.onSelect(props.id);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      props.onSelect(props.id);
    }
  };

  return (
    <div
      class={styles.listItem}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Select recipe: ${props.name}`}
    >
      <h3 class={styles.title}>{props.name}</h3>
      <span class={styles.difficulty} data-level={props.difficulty}>
        {props.difficulty}
      </span>
      <span class={styles.time}>{props.time}</span>
    </div>
  );
};

export default RecipeListItem;
