import { useLocation } from "@solidjs/router";
import type { JSX } from "@solidjs/web";
import { type Component, Show } from "solid-js";
import { collectionStrings } from "~/app/collections/strings.ts";
import { MarkButton } from "~/app/marks/MarkButton.tsx";
import { ariaBoolean } from "~/app/ui/ariaBoolean.ts";
import { createLongPress } from "~/app/ui/createLongPress.ts";
import { toLinkState } from "~/app/ui/linkState.ts";
import { RecipeFlagBadge } from "~/app/verdicts/RecipeFlagBadge.tsx";
import type { RecipeVerdict } from "~/shared/verdicts.ts";
import { type RecipeSelection, SelectCheck } from "./RecipeCard.tsx";
import styles from "./RecipeListItem.module.css";

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
  const location = useLocation();
  const longPress = createLongPress(() => props.onLongPress?.());

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
    <Show
      when={props.selection}
      fallback={
        <a
          href={`/recipe/${props.urlSlug}`}
          state={toLinkState({ fromSearch: location.search })}
          class={[styles.listItem, { [styles.pressable]: props.onLongPress !== undefined }]}
          {...(props.onLongPress ? longPress : {})}
        >
          {content()}
        </a>
      }
    >
      {(selection) => (
        <button
          type="button"
          class={[
            styles.listItem,
            styles.selectable,
            { [styles.selected]: selection().isSelected },
          ]}
          aria-pressed={ariaBoolean(selection().isSelected)}
          aria-label={collectionStrings.select.selectRecipe(props.name)}
          onClick={() => selection().onToggle()}
        >
          {content()}
        </button>
      )}
    </Show>
  );
};
