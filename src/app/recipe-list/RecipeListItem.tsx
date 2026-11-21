import { A, useLocation } from "@solidjs/router";
import { type Component, Show } from "solid-js";
import { MarkButton } from "~/app/marks/MarkButton.tsx";
import { RecipeFlagBadge } from "~/app/verdicts/RecipeFlagBadge.tsx";
import type { RecipeVerdict } from "~/shared/verdicts.ts";
import styles from "./RecipeListItem.module.css";

type RecipeListItemProps = {
  urlSlug: string;
  name: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Unknown";
  time: string;
  verdict?: RecipeVerdict;
};

export const RecipeListItem: Component<RecipeListItemProps> = (props) => {
  const location = useLocation();

  return (
    <A
      href={`/recipe/${props.urlSlug}`}
      state={{ fromSearch: location.search }}
      class={styles.listItem}
    >
      <h3 class={styles.title}>
        {props.name}
        <Show when={props.verdict}>
          {(verdict) => (
            <span class={styles.verdict}>
              <RecipeFlagBadge kind={verdict()} isCompact />
            </span>
          )}
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
