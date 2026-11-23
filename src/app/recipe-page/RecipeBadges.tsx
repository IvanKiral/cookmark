import { type Component, Show } from "solid-js";
import { RecipeFlagBadge } from "~/app/verdicts/RecipeFlagBadge.tsx";
import { recipeVerdictLabels } from "~/app/verdicts/verdictDisplay.ts";
import type { RecipeVerdict } from "~/shared/verdicts.ts";
import styles from "./RecipeMore.module.css";
import { recipePageStrings } from "./strings.ts";

type RecipeBadgesProps = {
  verdict: RecipeVerdict | undefined;
  isShouldDeleteShown: boolean;
  // Set for admins on phone: the verdict badge opens the More sheet.
  onVerdictClick?: () => void;
};

export const RecipeBadges: Component<RecipeBadgesProps> = (props) => (
  <>
    <Show when={props.verdict}>
      {(verdict) => (
        <Show when={props.onVerdictClick} fallback={<RecipeFlagBadge kind={verdict()} />}>
          {(onVerdictClick) => (
            <button
              type="button"
              class={styles.badgeButton}
              aria-label={recipePageStrings.more.changeVerdict(recipeVerdictLabels[verdict()])}
              aria-haspopup="dialog"
              onClick={() => onVerdictClick()()}
            >
              <RecipeFlagBadge kind={verdict()} />
              <span class={`material-symbols-outlined ${styles.badgeChevron}`} aria-hidden="true">
                expand_more
              </span>
            </button>
          )}
        </Show>
      )}
    </Show>
    <Show when={props.isShouldDeleteShown}>
      <RecipeFlagBadge kind="should-delete" />
    </Show>
  </>
);
