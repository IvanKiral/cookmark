import type { Component } from "solid-js";
import { strings } from "~/constants/strings.ts";
import styles from "./ChefPickBadge.module.css";

type ChefPickBadgeProps = {
  // Icon only, for tight spots like list rows. The label stays available to
  // screen readers and as a tooltip.
  isCompact?: boolean;
};

const ChefPickBadge: Component<ChefPickBadgeProps> = (props) => (
  <span
    class={styles.badge}
    classList={{ [styles.compact]: props.isCompact }}
    title={props.isCompact ? strings.chefPick.label : undefined}
  >
    <span class="material-symbols-outlined" aria-hidden="true">
      chef_hat
    </span>
    <span class={props.isCompact ? styles.visuallyHidden : undefined}>
      {strings.chefPick.label}
    </span>
  </span>
);

export default ChefPickBadge;
