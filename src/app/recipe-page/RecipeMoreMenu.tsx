import { DropdownMenu } from "@kobalte/core/dropdown-menu";
import { useLocation, useNavigate } from "@solidjs/router";
import { type Component, For, Show } from "solid-js";
import type { RecipeAdminActions } from "~/app/admin/createRecipeAdminActions.ts";
import { adminStrings } from "~/app/admin/strings.ts";
import { collectionStrings } from "~/app/collections/strings.ts";
import { createAfterMenuClose } from "~/app/ui/createAfterMenuClose.ts";
import iconButtonStyles from "~/app/ui/iconToggleButton.module.css";
import { recipeVerdictIcons, recipeVerdictLabels } from "~/app/verdicts/verdictDisplay.ts";
import { isRecipeVerdict, recipeVerdictValues } from "~/shared/verdicts.ts";
import styles from "./RecipeMore.module.css";
import { verdictIconClasses } from "./RecipeMoreSheet.tsx";
import { recipePageStrings } from "./strings.ts";

type RecipeMoreMenuProps = {
  slug: string;
  isAdmin: boolean;
  admin: RecipeAdminActions;
  // "In Soups, For guests" under "Add to collection", which everyone gets.
  collectionsSummary: string;
  // Called once the menu has closed, so the popover it opens keeps the focus.
  onAddToCollection: () => void;
};

const strings = recipePageStrings.more;

// The desktop More dropdown of the recipe page: the verdicts are items of
// their own, not a submenu.
export const RecipeMoreMenu: Component<RecipeMoreMenuProps> = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  // The popover opens once the menu has closed, so it keeps the focus.
  const afterClose = createAfterMenuClose();

  return (
    <DropdownMenu placement="bottom-end" gutter={6}>
      <DropdownMenu.Trigger
        class={`${iconButtonStyles.button} ${styles.moreButton}`}
        aria-label={strings.label}
      >
        <span class="material-symbols-outlined" aria-hidden="true">
          more_horiz
        </span>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content class={styles.menu} onCloseAutoFocus={afterClose.onCloseAutoFocus}>
          <DropdownMenu.Item
            class={`${styles.menuItem} ${styles.tallItem}`}
            onSelect={() => afterClose.schedule(props.onAddToCollection)}
          >
            <span class="material-symbols-outlined" aria-hidden="true">
              collections_bookmark
            </span>
            <span class={styles.rowText}>
              <span>{collectionStrings.addTo.rowTitle}</span>
              <span class={styles.rowSubtitle}>{props.collectionsSummary}</span>
            </span>
            <span class={`material-symbols-outlined ${styles.chevron}`} aria-hidden="true">
              chevron_right
            </span>
          </DropdownMenu.Item>
          <Show when={props.isAdmin}>
            <DropdownMenu.Separator class={styles.menuSeparator} />
            <DropdownMenu.Group>
              <DropdownMenu.GroupLabel class={styles.menuLabel}>
                {strings.adminOnly}
              </DropdownMenu.GroupLabel>
              <DropdownMenu.RadioGroup
                value={props.admin.verdict() ?? ""}
                onChange={(value) => {
                  if (isRecipeVerdict(value)) {
                    props.admin.chooseVerdict(value);
                  }
                }}
              >
                <For each={recipeVerdictValues}>
                  {(verdict) => (
                    <DropdownMenu.RadioItem
                      value={verdict}
                      class={styles.menuItem}
                      disabled={props.admin.isSaving()}
                    >
                      <span
                        class={`material-symbols-outlined ${styles.filledIcon} ${verdictIconClasses[verdict]}`}
                        aria-hidden="true"
                      >
                        {recipeVerdictIcons[verdict]}
                      </span>
                      <span class={styles.rowLabel}>{recipeVerdictLabels[verdict]}</span>
                      <DropdownMenu.ItemIndicator class={styles.menuCheck}>
                        <span class="material-symbols-outlined" aria-hidden="true">
                          check
                        </span>
                      </DropdownMenu.ItemIndicator>
                    </DropdownMenu.RadioItem>
                  )}
                </For>
              </DropdownMenu.RadioGroup>
              <Show when={props.admin.verdict()}>
                <DropdownMenu.Item
                  class={styles.menuItem}
                  disabled={props.admin.isSaving()}
                  onSelect={() => props.admin.chooseVerdict(undefined)}
                >
                  <span class="material-symbols-outlined" aria-hidden="true">
                    close
                  </span>
                  <span class={styles.rowLabel}>{adminStrings.verdict.clear}</span>
                </DropdownMenu.Item>
              </Show>
              <DropdownMenu.Separator class={styles.menuSeparator} />
              <DropdownMenu.Item
                class={styles.menuItem}
                onSelect={() => navigate(`/recipe/${props.slug}/edit`, { state: location.state })}
              >
                <span class="material-symbols-outlined" aria-hidden="true">
                  edit
                </span>
                <span class={styles.rowLabel}>{strings.editRecipe}</span>
              </DropdownMenu.Item>
              <DropdownMenu.Item
                class={`${styles.menuItem} ${props.admin.isShouldDelete() ? "" : styles.danger}`}
                disabled={props.admin.isSaving()}
                onSelect={() => props.admin.toggleShouldDelete()}
              >
                <span class="material-symbols-outlined" aria-hidden="true">
                  delete
                </span>
                <span class={styles.rowLabel}>
                  {props.admin.isShouldDelete() ? strings.removeDeleteMark : strings.markToDelete}
                </span>
              </DropdownMenu.Item>
            </DropdownMenu.Group>
          </Show>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu>
  );
};
