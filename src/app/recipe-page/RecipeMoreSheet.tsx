import { useLocation } from "@solidjs/router";
import type { JSX } from "@solidjs/web";
import { type Component, For, Show } from "solid-js";
import type { RecipeAdminActions } from "~/app/admin/createRecipeAdminActions.ts";
import { adminStrings } from "~/app/admin/strings.ts";
import { ariaBoolean } from "~/app/ui/ariaBoolean.ts";
import { BottomSheet } from "~/app/ui/BottomSheet.tsx";
import { toLinkState } from "~/app/ui/linkState.ts";
import { recipeVerdictIcons, recipeVerdictLabels } from "~/app/verdicts/verdictDisplay.ts";
import { type RecipeVerdict, recipeVerdictValues } from "~/shared/verdicts.ts";
import styles from "./RecipeMore.module.css";
import { recipePageStrings } from "./strings.ts";

type RecipeMoreSheetProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  slug: string;
  title: string;
  isAdmin: boolean;
  admin: RecipeAdminActions;
  // The "Add to collection" row, for everyone.
  collectionsRow?: JSX.Element;
};

const strings = recipePageStrings.more;

export const verdictIconClasses: Record<RecipeVerdict, string> = {
  "chef-kiss": styles.chefKiss,
  "chef-approved": styles.chefApproved,
  "chef-ok": styles.chefOk,
  "chef-flop": styles.chefFlop,
};

// The phone More sheet of the recipe page.
export const RecipeMoreSheet: Component<RecipeMoreSheetProps> = (props) => {
  const location = useLocation();
  const close = (): void => props.onOpenChange(false);

  const handleVerdict = (verdict: RecipeVerdict | undefined): void => {
    const isConfirming = props.admin.chooseVerdict(verdict);
    if (isConfirming) {
      close();
    }
  };

  const handleShouldDelete = (): void => {
    close();
    props.admin.toggleShouldDelete();
  };

  return (
    <BottomSheet
      isOpen={props.isOpen}
      onOpenChange={props.onOpenChange}
      kicker={strings.kicker}
      title={props.title}
      closeLabel={strings.close}
    >
      {props.collectionsRow}
      <Show when={props.isAdmin}>
        <Show when={props.collectionsRow}>
          <div class={styles.divider} />
        </Show>
        <span class={styles.sectionLabel}>{strings.adminOnly}</span>
        <h3 class={styles.sectionLabel}>{strings.chefsVerdict}</h3>
        <div class={styles.verdictGrid}>
          <For each={recipeVerdictValues}>
            {(verdict) => (
              <button
                type="button"
                class={[
                  styles.verdictOption,
                  { [styles.verdictSelected]: props.admin.verdict() === verdict },
                ]}
                aria-pressed={ariaBoolean(props.admin.verdict() === verdict)}
                disabled={props.admin.isSaving()}
                onClick={() => handleVerdict(verdict)}
              >
                <span
                  class={`material-symbols-outlined ${styles.filledIcon} ${verdictIconClasses[verdict]}`}
                  aria-hidden="true"
                >
                  {recipeVerdictIcons[verdict]}
                </span>
                <span class={styles.verdictLabel}>{recipeVerdictLabels[verdict]}</span>
                <Show when={props.admin.verdict() === verdict}>
                  <span class={`material-symbols-outlined ${styles.check}`} aria-hidden="true">
                    check
                  </span>
                </Show>
              </button>
            )}
          </For>
        </div>
        <Show when={props.admin.verdict()}>
          <button
            type="button"
            class={styles.clearVerdict}
            disabled={props.admin.isSaving()}
            onClick={() => handleVerdict(undefined)}
          >
            {adminStrings.verdict.clear}
          </button>
        </Show>
        <div class={styles.divider} />
        <a
          href={`/recipe/${props.slug}/edit`}
          state={toLinkState(location.state)}
          class={styles.row}
          onClick={close}
        >
          <span class="material-symbols-outlined" aria-hidden="true">
            edit
          </span>
          <span class={styles.rowLabel}>{strings.editRecipe}</span>
          <span class={`material-symbols-outlined ${styles.chevron}`} aria-hidden="true">
            chevron_right
          </span>
        </a>
        <button
          type="button"
          class={`${styles.row} ${props.admin.isShouldDelete() ? "" : styles.danger}`}
          disabled={props.admin.isSaving()}
          onClick={handleShouldDelete}
        >
          <span class="material-symbols-outlined" aria-hidden="true">
            delete
          </span>
          <span class={styles.rowLabel}>
            {props.admin.isShouldDelete() ? strings.removeDeleteMark : strings.markToDelete}
          </span>
        </button>
      </Show>
    </BottomSheet>
  );
};
