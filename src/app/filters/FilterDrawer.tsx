import { Drawer } from "@kobalte/core/drawer";
import { type Component, createEffect, Show } from "solid-js";
import { collectionStrings } from "~/app/collections/strings.ts";
import buttonStyles from "~/app/ui/button.module.css";
import { createReturnFocus } from "~/app/ui/createReturnFocus.ts";
import type { AuthorOption } from "./deriveAuthors.ts";
import styles from "./FilterDrawer.module.css";
import { FilterPanel } from "./FilterPanel.tsx";
import { countActiveFilters, type RecipeFilterKey, type RecipeFilters } from "./recipeFilters.ts";
import { filterStrings } from "./strings.ts";

type FilterDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: RecipeFilters;
  authorOptions: ReadonlyArray<AuthorOption>;
  onFilterChange: <K extends RecipeFilterKey>(key: K, values: RecipeFilters[K]) => void;
  onClearAll: () => void;
  // Recipes matching the current search and filters, shown on the close button.
  resultCount: number;
  // Shown in the footer once a filter is active.
  onSaveSmartFilter?: () => void;
  // Editing a smart filter: the drawer works on a draft and its footer offers Cancel and Update.
  edit?: FilterDrawerEdit;
};

export type FilterDrawerEdit = {
  name: string;
  matchCount: number;
  canUpdate: boolean;
  onCancel: () => void;
  onUpdate: () => void;
};

export const FilterDrawer: Component<FilterDrawerProps> = (props) => {
  const hasAnyFilter = (): boolean => countActiveFilters(props.filters) > 0;
  createReturnFocus(() => props.open);
  let closeButtonRef: HTMLButtonElement | undefined;

  // Kobalte 2.0.0-alpha.5's drawer neither moves focus into itself nor closes
  // on Escape or a click outside (its dialog does all three), so the drawer
  // does it here and on the overlay. Remove once Kobalte's drawer handles it.
  createEffect(
    () => props.open,
    (isOpen) => {
      if (!isOpen) {
        return;
      }
      const frame = requestAnimationFrame(() => closeButtonRef?.focus({ preventScroll: true }));
      const handleKeyDown = (event: KeyboardEvent): void => {
        if (event.key === "Escape") {
          props.onOpenChange(false);
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        cancelAnimationFrame(frame);
        document.removeEventListener("keydown", handleKeyDown);
      };
    },
  );

  return (
    <Drawer open={props.open} onOpenChange={props.onOpenChange} side="left">
      <Drawer.Portal>
        <Drawer.Overlay class={styles.overlay} onClick={() => props.onOpenChange(false)} />
        <Drawer.Content class={styles.content}>
          <div class={styles.header}>
            <div>
              <Drawer.Title class={styles.title}>
                {props.edit
                  ? collectionStrings.smart.editTitle(props.edit.name)
                  : filterStrings.drawer.title}
              </Drawer.Title>
              <Show when={props.edit}>
                <Drawer.Description class={styles.subtitle}>
                  {collectionStrings.smart.editSubtitle}
                </Drawer.Description>
              </Show>
            </div>
            <Drawer.CloseButton
              ref={closeButtonRef}
              class={styles.closeButton}
              aria-label={filterStrings.closeDrawer}
            >
              <span class="material-symbols-outlined">close</span>
            </Drawer.CloseButton>
          </div>

          <div class={styles.sections}>
            <FilterPanel
              variant="drawer"
              filters={props.filters}
              authorOptions={props.authorOptions}
              onFilterChange={props.onFilterChange}
            />
          </div>

          {/* Always visible, so the result count updates while filtering and
              there's an obvious way back to the recipes. */}
          <Show
            when={!props.edit}
            fallback={
              <div class={`${styles.footer} ${styles.editFooter}`}>
                <span class={styles.matchCount}>
                  {collectionStrings.smart.matchNow(props.edit?.matchCount ?? 0)}
                </span>
                <div class={styles.footerButtons}>
                  <button
                    type="button"
                    class={`${buttonStyles.button} ${buttonStyles.secondary}`}
                    onClick={() => props.edit?.onCancel()}
                  >
                    {collectionStrings.smart.cancel}
                  </button>
                  <button
                    type="button"
                    class={`${buttonStyles.button} ${buttonStyles.primary} ${styles.showButton}`}
                    disabled={!props.edit?.canUpdate}
                    onClick={() => props.edit?.onUpdate()}
                  >
                    {collectionStrings.smart.update}
                  </button>
                </div>
              </div>
            }
          >
            <Show when={hasAnyFilter() && props.onSaveSmartFilter}>
              {(onSave) => (
                <button type="button" class={styles.saveButton} onClick={() => onSave()()}>
                  <span class="material-symbols-outlined" aria-hidden="true">
                    collections_bookmark
                  </span>
                  {collectionStrings.smart.saveButton}
                </button>
              )}
            </Show>
            <div class={styles.footer}>
              {hasAnyFilter() && (
                <button
                  type="button"
                  class={`${buttonStyles.button} ${buttonStyles.secondary}`}
                  onClick={props.onClearAll}
                >
                  {filterStrings.drawer.clearAll}
                </button>
              )}
              <button
                type="button"
                class={`${buttonStyles.button} ${buttonStyles.primary} ${styles.showButton}`}
                onClick={() => props.onOpenChange(false)}
              >
                {filterStrings.drawer.showResults(props.resultCount)}
              </button>
            </div>
          </Show>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer>
  );
};
