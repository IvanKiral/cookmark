import type { JSX } from "@solidjs/web";
import type { Component } from "solid-js";
import styles from "./PlaceEmptyState.module.css";

type PlaceEmptyStateProps = {
  icon: string;
  title: string;
  body: JSX.Element;
  action?: JSX.Element;
};

// The dashed card of an empty collection or a smart filter that matches nothing.
export const PlaceEmptyState: Component<PlaceEmptyStateProps> = (props) => (
  <div class={styles.card}>
    <span class={`material-symbols-outlined ${styles.icon}`} aria-hidden="true">
      {props.icon}
    </span>
    <h2 class={styles.title}>{props.title}</h2>
    <p class={styles.body}>{props.body}</p>
    {props.action}
  </div>
);
