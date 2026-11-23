import type { JSX } from "@solidjs/web";
import { type Component, Show } from "solid-js";
import { MarkButton } from "~/app/marks/MarkButton.tsx";
import { RecipeFlagBadge } from "~/app/verdicts/RecipeFlagBadge.tsx";
import type { RecipeVerdict } from "~/shared/verdicts.ts";
import styles from "./RecipeListItem.module.css";
import {
  type RecipeSelection,
  SelectableRecipeLink,
  SelectCheck,
} from "./SelectableRecipeLink.tsx";

type RecipeListItemProps = {
  urlSlug: string;
  name: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Unknown";
  time?: string;
  verdict?: RecipeVerdict;
  selection?: RecipeSelection;
  // Touch only: holding the row enters select mode with it selected.
  onLongPress?: () => void;
};

export const RecipeListItem: Component<RecipeListItemProps> = (props) => {
  const content = (): JSX.Element => (
    <>
      <h3 class={styles.title}>
        <Show when={props.selection}>
          {(selection) => <SelectCheck isSelected={selection().isSelected} class={styles.check} />}
        </Show>
        {props.name}
        <Show when={!props.selection && props.verdict}>
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
      <span class={styles.time}>{props.time ?? ""}</span>
      <div class={styles.marks}>
        <Show when={!props.selection}>
          <MarkButton mark="favorite" slug={props.urlSlug} name={props.name} />
          <MarkButton mark="to-try" slug={props.urlSlug} name={props.name} />
        </Show>
      </div>
    </>
  );

  return (
    <SelectableRecipeLink
      urlSlug={props.urlSlug}
      name={props.name}
      class={styles.listItem}
      selectedClass={styles.selected}
      selection={props.selection}
      onLongPress={props.onLongPress}
      content={content}
    />
  );
};
