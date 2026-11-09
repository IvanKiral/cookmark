import type { Component } from "solid-js";
import type { RecipeFlag } from "~/constants/recipeFlags.ts";
import {
  type RecipeVerdict,
  recipeVerdictIcons,
  recipeVerdictLabels,
} from "~/constants/recipeVerdicts.ts";
import { strings } from "~/constants/strings.ts";
import styles from "./RecipeFlagBadge.module.css";

type RecipeBadgeKind = RecipeVerdict | RecipeFlag;

type RecipeFlagBadgeProps = {
  kind: RecipeBadgeKind;
  // Icon only, for tight spots like list rows. The label stays available to
  // screen readers and as a tooltip.
  isCompact?: boolean;
};

const badgeConfigs: Record<RecipeBadgeKind, { icon: string; label: string; class: string }> = {
  "chef-kiss": {
    icon: recipeVerdictIcons["chef-kiss"],
    label: recipeVerdictLabels["chef-kiss"],
    class: styles.chefKiss,
  },
  "chef-approved": {
    icon: recipeVerdictIcons["chef-approved"],
    label: recipeVerdictLabels["chef-approved"],
    class: styles.chefApproved,
  },
  "chef-ok": {
    icon: recipeVerdictIcons["chef-ok"],
    label: recipeVerdictLabels["chef-ok"],
    class: styles.chefOk,
  },
  "chef-flop": {
    icon: recipeVerdictIcons["chef-flop"],
    label: recipeVerdictLabels["chef-flop"],
    class: styles.chefFlop,
  },
  "should-delete": {
    icon: "delete",
    label: strings.shouldDelete.label,
    class: styles.shouldDelete,
  },
};

const RecipeFlagBadge: Component<RecipeFlagBadgeProps> = (props) => {
  const config = () => badgeConfigs[props.kind];

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
