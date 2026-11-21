import type { JSX } from "@solidjs/web";
import type { Component } from "solid-js";
import styles from "./RecipeMediaSection.module.css";

type RecipeMediaSectionProps = {
  title: string;
  children: JSX.Element;
};

export const RecipeMediaSection: Component<RecipeMediaSectionProps> = (props) => (
  <div class={styles.wrapper}>
    <div class={styles.header}>
      <span class={styles.headerTitle}>{props.title}</span>
      <div class={styles.headerLine} />
    </div>
    {props.children}
  </div>
);
