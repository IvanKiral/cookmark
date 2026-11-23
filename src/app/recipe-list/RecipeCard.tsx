import { useLocation } from "@solidjs/router";
import type { JSX } from "@solidjs/web";
import { type Component, createSignal, onSettled, Show } from "solid-js";
import { collectionStrings } from "~/app/collections/strings.ts";
import { MarkButton } from "~/app/marks/MarkButton.tsx";
import { ariaBoolean } from "~/app/ui/ariaBoolean.ts";
import { createLongPress } from "~/app/ui/createLongPress.ts";
import { toLinkState } from "~/app/ui/linkState.ts";
import { RecipeFlagBadge } from "~/app/verdicts/RecipeFlagBadge.tsx";
import type { RecipeVerdict } from "~/shared/verdicts.ts";
import styles from "./RecipeCard.module.css";

// Select mode: the card is a toggle button instead of a link.
export type RecipeSelection = {
  isSelected: boolean;
  onToggle: () => void;
};

type RecipeCardProps = {
  urlSlug: string;
  name: string;
  imageUrl: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Unknown";
  time?: string;
  verdict?: RecipeVerdict;
  selection?: RecipeSelection;
  // Touch only: holding the card enters select mode with it selected.
  onLongPress?: () => void;
};

export const SelectCheck: Component<{ isSelected: boolean; class?: string }> = (props) => (
  <span
    class={`material-symbols-outlined ${styles.check} ${props.isSelected ? styles.checkOn : ""} ${props.class ?? ""}`}
    aria-hidden="true"
  >
    {props.isSelected ? "check_circle" : "radio_button_unchecked"}
  </span>
);

export const RecipeCard: Component<RecipeCardProps> = (props) => {
  const location = useLocation();
  const [hasImageError, setHasImageError] = createSignal(false);
  const longPress = createLongPress(() => props.onLongPress?.());
  let imageRef: HTMLImageElement | undefined;

  // The image is server-rendered, so a 404 can fire its error event before the
  // client hydrates and attaches onError. Re-check once mounted: a finished load
  // with zero intrinsic width means the thumbnail failed.
  onSettled(() => {
    if (imageRef?.complete && imageRef.naturalWidth === 0) {
      setHasImageError(true);
    }
  });

  const content = (): JSX.Element => (
    <>
      <div class={styles.thumb}>
        <Show
          when={!hasImageError()}
          fallback={
            <div class={styles.placeholder} aria-hidden="true">
              <span class="material-symbols-outlined">restaurant</span>
            </div>
          }
        >
          <img
            ref={imageRef}
            class={styles.image}
            src={props.imageUrl}
            alt={props.selection ? "" : props.name}
            loading="lazy"
            onError={() => setHasImageError(true)}
          />
        </Show>
        <Show
          when={props.selection}
          fallback={
            <>
              <Show when={props.verdict}>
                {(verdict) => (
                  <div class={styles.verdict}>
                    <RecipeFlagBadge kind={verdict()} />
                  </div>
                )}
              </Show>
              <div class={styles.marks}>
                <MarkButton mark="favorite" slug={props.urlSlug} name={props.name} />
                <MarkButton mark="to-try" slug={props.urlSlug} name={props.name} />
              </div>
            </>
          }
        >
          {(selection) => <SelectCheck isSelected={selection().isSelected} />}
        </Show>
      </div>
      <div class={styles.body}>
        <h3 class={styles.title}>{props.name}</h3>
        <div class={styles.meta}>
          <span class={styles.difficulty} data-level={props.difficulty}>
            {props.difficulty}
          </span>
          <Show when={props.time}>
            <span class={styles.time}>{props.time}</span>
          </Show>
        </div>
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
          class={[styles.card, { [styles.pressable]: props.onLongPress !== undefined }]}
          {...(props.onLongPress ? longPress : {})}
        >
          {content()}
        </a>
      }
    >
      {(selection) => (
        <button
          type="button"
          class={[styles.card, styles.selectable, { [styles.selected]: selection().isSelected }]}
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
