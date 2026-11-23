import { useLocation } from "@solidjs/router";
import type { JSX } from "@solidjs/web";
import { type Component, Show } from "solid-js";
import { ariaBoolean } from "~/app/ui/ariaBoolean.ts";
import { createLongPress } from "~/app/ui/createLongPress.ts";
import { toLinkState } from "~/app/ui/linkState.ts";
import styles from "./SelectableRecipeLink.module.css";
import { recipeListStrings } from "./strings.ts";

// Select mode: the card or row is a toggle button instead of a link.
export type RecipeSelection = {
  isSelected: boolean;
  onToggle: () => void;
};

type SelectableRecipeLinkProps = {
  urlSlug: string;
  name: string;
  // The card's or row's own classes, for both the link and the toggle.
  class: string;
  selectedClass: string;
  selection?: RecipeSelection;
  // Touch only: holding it enters select mode with this recipe selected.
  onLongPress?: () => void;
  // Called once per rendered element, so the link and the toggle each get their own.
  content: () => JSX.Element;
};

export const SelectCheck: Component<{ isSelected: boolean; class?: string }> = (props) => (
  <span
    class={`material-symbols-outlined ${styles.check} ${props.isSelected ? styles.checkOn : ""} ${props.class ?? ""}`}
    aria-hidden="true"
  >
    {props.isSelected ? "check_circle" : "radio_button_unchecked"}
  </span>
);

// A recipe in the list: a link to it, or in select mode a toggle.
export const SelectableRecipeLink: Component<SelectableRecipeLinkProps> = (props) => {
  const location = useLocation();
  const longPress = createLongPress(() => props.onLongPress?.());

  return (
    <Show
      when={props.selection}
      fallback={
        <a
          href={`/recipe/${props.urlSlug}`}
          state={toLinkState({ fromSearch: location.search })}
          class={[props.class, { [styles.pressable]: props.onLongPress !== undefined }]}
          {...(props.onLongPress ? longPress : {})}
        >
          {props.content()}
        </a>
      }
    >
      {(selection) => (
        <button
          type="button"
          class={[
            props.class,
            styles.selectable,
            { [props.selectedClass]: selection().isSelected },
          ]}
          aria-pressed={ariaBoolean(selection().isSelected)}
          aria-label={recipeListStrings.selectRecipe(props.name)}
          onClick={() => selection().onToggle()}
        >
          {props.content()}
        </button>
      )}
    </Show>
  );
};
