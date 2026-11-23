import { type Component, Show } from "solid-js";
import { EditFilterFooter } from "~/app/collections/EditFilterFooter.tsx";
import { SaveSmartFilterButton } from "~/app/collections/SaveSmartFilterButton.tsx";
import { collectionStrings } from "~/app/collections/strings.ts";
import { ActiveFilterChips } from "~/app/filters/ActiveFilterChips.tsx";
import { withoutFilterValue } from "~/app/filters/activeFilters.ts";
import { FilterPanel } from "~/app/filters/FilterPanel.tsx";
import { filterStrings } from "~/app/filters/strings.ts";
import buttonStyles from "~/app/ui/button.module.css";
import type { ListPage } from "./createListPage.ts";
import styles from "./ListPage.module.css";

// Desktop: the filters panel under the toolbar (also where a smart filter is
// edited), or the row of active filters when it is closed.
export const ListFilters: Component<{ page: ListPage }> = (props) => {
  const params = props.page.params;
  const edit = props.page.filterEdit;

  return (
    <>
      <Show when={props.page.filterPanel.isOpen()}>
        <section class={styles.filterPanel} aria-label={filterStrings.drawer.title}>
          <Show when={edit.collection()}>
            {(collection) => (
              <p class={styles.editBanner}>
                <span class="material-symbols-outlined" aria-hidden="true">
                  tune
                </span>
                {collectionStrings.smart.editingBanner(collection().name)}
              </p>
            )}
          </Show>
          <FilterPanel
            variant="toolbar"
            filters={edit.draft() ?? params.filters()}
            authorOptions={props.page.authorOptions()}
            onFilterChange={edit.draft() ? edit.setDraft : params.setFilter}
          />
          <Show
            when={edit.draft()}
            fallback={
              <div class={styles.filterPanelFooter}>
                <button
                  type="button"
                  class={`${buttonStyles.button} ${buttonStyles.secondary}`}
                  onClick={params.clearFilters}
                >
                  {filterStrings.drawer.clearAll}
                </button>
                <button
                  type="button"
                  class={`${buttonStyles.button} ${buttonStyles.primary}`}
                  onClick={() => props.page.filterPanel.setIsOpen(false)}
                >
                  {filterStrings.drawer.showResults(props.page.filteredRecipes().length)}
                </button>
              </div>
            }
          >
            <EditFilterFooter
              countLabel={collectionStrings.smart.preview(edit.matches().length)}
              canUpdate={edit.canUpdate()}
              onCancel={edit.end}
              onUpdate={edit.update}
            />
          </Show>
        </section>
      </Show>
      <Show when={!props.page.filterPanel.isOpen() && props.page.activeFilterCount() > 0}>
        <div class={styles.activeFilters}>
          <ActiveFilterChips
            filters={params.filters()}
            onRemove={(key, value) =>
              params.setFilter(key, withoutFilterValue(params.filters(), key, value))
            }
            onClearAll={params.clearFilters}
            trailing={
              <SaveSmartFilterButton onClick={() => props.page.saveDialog.setIsOpen(true)} />
            }
          />
        </div>
      </Show>
    </>
  );
};
