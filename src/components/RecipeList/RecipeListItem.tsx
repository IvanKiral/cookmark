import { A, useLocation } from "@solidjs/router";
import { type Component, Show } from "solid-js";
import MarkButton from "~/components/MarkButton/MarkButton.tsx";
import RecipeFlagBadge from "~/components/RecipeFlagBadge/RecipeFlagBadge.tsx";
import styles from "./RecipeListItem.module.css";

type RecipeListItemProps = {
  urlSlug: string;
  name: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Unknown";
  time: string;
  isChefPick: boolean;
};

const RecipeListItem: Component<RecipeListItemProps> = (props) => {
  const location = useLocation();

  return (
    <A
      href={`/recipe/${props.urlSlug}`}
      state={{ fromSearch: location.search }}
      class={styles.listItem}
    >
      <h3 class={styles.title}>
        {props.name}
        <Show when={props.isChefPick}>
          <span class={styles.chefPick}>
            <RecipeFlagBadge flag="chef-pick" isCompact />
          </span>
        </Show>
      </h3>
      <span class={styles.difficulty} data-level={props.difficulty}>
        {props.difficulty}
      </span>
      <span class={styles.time}>{props.time}</span>
      <div class={styles.marks}>
        <MarkButton mark="favorite" slug={props.urlSlug} name={props.name} />
        <MarkButton mark="to-try" slug={props.urlSlug} name={props.name} />
      </div>
    </A>
  );
};

export default RecipeListItem;
