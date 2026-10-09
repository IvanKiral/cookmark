import type { Component } from "solid-js";
import type { RecipeFlag } from "~/constants/recipeFlags.ts";
import { strings } from "~/constants/strings.ts";
import styles from "./RecipeFlagBadge.module.css";

type RecipeFlagBadgeProps = {
  flag: RecipeFlag;
  // Icon only, for tight spots like list rows. The label stays available to
  // screen readers and as a tooltip.
  isCompact?: boolean;
};

const badgeConfigs: Record<RecipeFlag, { icon: string; label: string; class: string }> = {
  "chef-pick": { icon: "chef_hat", label: strings.chefPick.label, class: styles.chefPick },
  "should-delete": {
    icon: "delete",
    label: strings.shouldDelete.label,
    class: styles.shouldDelete,
  },
};

const RecipeFlagBadge: Component<RecipeFlagBadgeProps> = (props) => {
  const config = () => badgeConfigs[props.flag];

  return (
    <span
      class={`${styles.badge} ${config().class}`}
      classList={{ [styles.compact]: props.isCompact }}
      title={props.isCompact ? config().label : undefined}
    >
      <span class="material-symbols-outlined" aria-hidden="true">
        {config().icon}
      </span>
      <span class={props.isCompact ? styles.visuallyHidden : undefined}>{config().label}</span>
    </span>
  );
};

export default RecipeFlagBadge;
