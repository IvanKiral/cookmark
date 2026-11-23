import { type Component, createSignal, Show } from "solid-js";
import buttonStyles from "~/app/ui/button.module.css";
import { showToast } from "~/app/ui/Toast.tsx";
import type { Collection } from "~/shared/collections.ts";
import { AddSelectionSheet } from "./AddSelectionSheet.tsx";
import { useCollections } from "./CollectionsContext.tsx";
import { createNamedCollection } from "./collectionNames.ts";
import type { Selection } from "./createSelection.ts";
import styles from "./ListSelection.module.css";
import { SelectionBar } from "./SelectionBar.tsx";
import { collectionStrings } from "./strings.ts";

type ListSelectionProps = {
  selection: Selection;
  // The open collection or smart filter.
  placeCollection: Collection | undefined;
  // Number of recipes in the current view, for Select all.
  viewCount: number;
  librarySlugs: ReadonlySet<string>;
};

const strings = collectionStrings.select;

// Select mode's bar and actions: add the selected recipes to collections,
// remove them from the open manual collection, or (pick mode) add them to it.
export const ListSelection: Component<ListSelectionProps> = (props) => {
  const collectionsContext = useCollections();
  const [isAddSheetOpen, setIsAddSheetOpen] = createSignal(false);

  const count = (): number => props.selection.selectedSlugs().length;
  const pickCollection = (): Collection | undefined => {
    const mode = props.selection.mode();
    return mode?.kind === "pick"
      ? collectionsContext.collections().find((collection) => collection.id === mode.collectionId)
      : undefined;
  };
  const manualPlace = (): Collection | undefined =>
    props.placeCollection?.kind === "manual" ? props.placeCollection : undefined;

  // The open manual collection is left out: its recipes are already in it.
  const addTargets = (): ReadonlyArray<Collection> =>
    collectionsContext
      .collections()
      .filter((collection) => collection.kind === "manual" && collection.id !== manualPlace()?.id);

  const context = (): string | undefined => {
    const picking = pickCollection();
    if (picking) {
      return strings.picking(picking.name);
    }
    const manual = manualPlace();
    return manual ? strings.inCollection(manual.name) : undefined;
  };

  const handleCreate = (name: string): Promise<Collection | string> =>
    createNamedCollection(collectionsContext, { name, kind: "manual" });

  const handleAdd = async (ids: ReadonlyArray<string>): Promise<void> => {
    const slugs = props.selection.selectedSlugs();
    props.selection.selectNone();
    const saved = await collectionsContext.addRecipes(ids, slugs);
    if (saved.length !== ids.length) {
      return;
    }
    const first = collectionsContext.collections().find((collection) => collection.id === ids[0]);
    showToast(
      ids.length === 1
        ? collectionStrings.addTo.addedOne(slugs.length, first?.name ?? "")
        : collectionStrings.addTo.addedMany(slugs.length, ids.length),
    );
  };

  const handleRemove = async (): Promise<void> => {
    const manual = manualPlace();
    if (!manual) {
      return;
    }
    const slugs = props.selection.selectedSlugs();
    props.selection.selectNone();
    const isSaved = await collectionsContext.removeRecipes(manual.id, slugs);
    if (isSaved) {
      showToast(strings.removed(slugs.length, manual.name));
    }
  };

  const handlePickAdd = async (): Promise<void> => {
    const picking = pickCollection();
    if (!picking) {
      return;
    }
    const slugs = props.selection.selectedSlugs();
    props.selection.stop();
    const saved = await collectionsContext.addRecipes([picking.id], slugs);
    if (saved.length === 1) {
      showToast(collectionStrings.addTo.addedOne(slugs.length, picking.name));
    }
  };

  return (
    <>
      <SelectionBar
        count={count()}
        isAllSelected={props.selection.isAllSelected()}
        canSelectAll={props.viewCount > 0}
        onSelectAll={props.selection.selectAll}
        onSelectNone={props.selection.selectNone}
        onCancel={props.selection.stop}
        context={context()}
        actions={
          <Show
            when={pickCollection()}
            fallback={
              <>
                <Show when={manualPlace()}>
                  <button
                    type="button"
                    class={`${buttonStyles.button} ${buttonStyles.danger} ${styles.action}`}
                    disabled={count() === 0}
                    onClick={handleRemove}
                  >
                    {strings.remove}
                  </button>
                </Show>
                <button
                  type="button"
                  class={`${buttonStyles.button} ${buttonStyles.primary} ${styles.action} ${styles.primaryAction}`}
                  disabled={count() === 0}
                  onClick={() => setIsAddSheetOpen(true)}
                >
                  {count() === 0
                    ? collectionStrings.addTo.addToCollection
                    : collectionStrings.addTo.addCount(count())}
                </button>
              </>
            }
          >
            {(picking) => (
              <button
                type="button"
                class={`${buttonStyles.button} ${buttonStyles.primary} ${styles.action} ${styles.primaryAction}`}
                disabled={count() === 0}
                onClick={handlePickAdd}
              >
                {count() === 0
                  ? strings.addToPicked(picking().name)
                  : strings.addCountToPicked(count(), picking().name)}
              </button>
            )}
          </Show>
        }
      />
      <AddSelectionSheet
        isOpen={isAddSheetOpen()}
        onOpenChange={setIsAddSheetOpen}
        collections={addTargets()}
        librarySlugs={props.librarySlugs}
        onCreate={handleCreate}
        onAdd={handleAdd}
      />
    </>
  );
};
