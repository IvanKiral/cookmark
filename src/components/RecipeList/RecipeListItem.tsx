import { A, useParams } from "@solidjs/router";
import type { Component } from "solid-js";
import type { Locale } from "~/i18n";
import styles from "./RecipeListItem.module.css";

type RecipeListItemProps = {
  urlSlug: string;
  name: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Unknown";
  time: string;
};

const RecipeListItem: Component<RecipeListItemProps> = (props) => {
  const params = useParams<{ lang: Locale }>();

  return (
    <A href={`/${params.lang}/recipe/${props.urlSlug}`} class={styles.listItem}>
      <h3 class={styles.title}>{props.name}</h3>
      <span class={styles.difficulty} data-level={props.difficulty}>
        {props.difficulty}
      </span>
      <span class={styles.time}>{props.time}</span>
    </A>
  );
};

export default RecipeListItem;
