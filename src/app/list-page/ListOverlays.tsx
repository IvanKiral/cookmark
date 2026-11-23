import { type Component, Loading, Show } from "solid-js";
import { CollectionMenuSheet } from "~/app/collections/CollectionMenuSheet.tsx";
import { CollectionsSheet } from "~/app/collections/CollectionsSheet.tsx";
import { EditFilterFooter } from "~/app/collections/EditFilterFooter.tsx";
import { NewCollectionSheet } from "~/app/collections/NewCollectionSheet.tsx";
import { SaveSmartFilterButton } from "~/app/collections/SaveSmartFilterButton.tsx";
import { SaveSmartFilterDialog } from "~/app/collections/SaveSmartFilterDialog.tsx";
import { collectionStrings } from "~/app/collections/strings.ts";
import { FilterDrawer } from "~/app/filters/FilterDrawer.tsx";
import { ConfirmDialog } from "~/app/ui/ConfirmDialog.tsx";
import { MAX_PINS } from "~/shared/collections.ts";
import type { ListPage } from "./createListPage.ts";
import { CollectionReorderView } from "./ListContent.tsx";

// Everything that opens over the list: the phone reorder view, the filter
// drawer, the save dialog, the collection sheets and the delete confirmation.
export const ListOverlays: Component<{ page: ListPage }> = (props) => {
  const page = props.page;
  const edit = page.filterEdit;
  const actions = page.collectionActions;

  return (
    <>
      <Show when={!page.isDesktop() && page.isReordering() && page.placeCollection()}>
        {(collection) => (
          <Loading>
            <CollectionReorderView
              collection={collection()}
              library={page.recipes()}
              onDone={() => page.setIsReordering(false)}
            />
          </Loading>
        )}
      </Show>
      <FilterDrawer
        open={page.filterDrawer.isOpen()}
        onOpenChange={(isOpen) => {
          if (!isOpen && edit.draft()) {
            edit.end();
            return;
          }
          page.filterDrawer.setIsOpen(isOpen);
        }}
        filters={edit.draft() ?? page.params.filters()}
        authorOptions={page.authorOptions()}
        onFilterChange={edit.draft() ? edit.setDraft : page.params.setFilter}
        onClearAll={page.params.clearFilters}
        resultCount={page.filteredRecipes().length}
        title={
          edit.collection()
            ? collectionStrings.smart.editTitle(edit.collection()?.name ?? "")
            : undefined
        }
        subtitle={edit.collection() ? collectionStrings.smart.editSubtitle : undefined}
        footerAction={
          <Show when={page.activeFilterCount() > 0}>
            <SaveSmartFilterButton onClick={() => page.saveDialog.setIsOpen(true)} />
          </Show>
        }
        footer={
          edit.draft() ? (
            <EditFilterFooter
              countLabel={collectionStrings.smart.matchNow(edit.matches().length)}
              canUpdate={edit.canUpdate()}
              onCancel={edit.end}
              onUpdate={edit.update}
            />
          ) : undefined
        }
      />
      <SaveSmartFilterDialog
        isOpen={page.saveDialog.isOpen()}
        onOpenChange={page.saveDialog.setIsOpen}
        filters={page.params.filters()}
        isPinShown={!page.isDesktop()}
        isPinsFull={page.pinnedCount() >= MAX_PINS}
        onSave={page.saveSmartFilter}
      />
      <CollectionsSheet
        isOpen={page.collectionsSheet.isOpen()}
        onOpenChange={page.collectionsSheet.setIsOpen}
        collections={page.collectionsContext.collections()}
        countOf={(collection) => page.countOf({ kind: "collection", id: collection.id })}
        onOpenCollection={page.openCollection}
        onTogglePin={page.togglePin}
        onNewCollection={() => {
          page.collectionsSheet.setIsOpen(false);
          page.newCollectionSheet.setIsOpen(true);
        }}
        onNewSmartFilter={page.openNewSmartFilter}
      />
      <NewCollectionSheet
        isOpen={page.newCollectionSheet.isOpen()}
        onOpenChange={page.newCollectionSheet.setIsOpen}
        onCreate={page.createFromSheet}
      />
      <Show when={page.placeCollection()}>
        {(collection) => (
          <CollectionMenuSheet
            isOpen={page.collectionMenu.isOpen()}
            onOpenChange={page.collectionMenu.setIsOpen}
            collection={collection()}
            pinnedCount={page.pinnedCount()}
            onAddRecipes={() => page.startPicking(collection())}
            onEditFilter={() => page.startEditFilter(collection())}
            onRename={() => actions.startRename(collection(), "title")}
            onTogglePin={() => actions.togglePin(collection())}
            onDelete={() => actions.requestDelete(collection())}
          />
        )}
      </Show>
      <ConfirmDialog
        isOpen={actions.deleting() !== undefined}
        title={collectionStrings.remove.title(actions.deleting()?.name ?? "")}
        description={
          actions.deleting()?.kind === "smart"
            ? collectionStrings.remove.smartBody
            : collectionStrings.remove.collectionBody
        }
        confirmLabel={collectionStrings.remove.confirm}
        isDestructive
        onConfirm={() => actions.confirmDelete()}
        onCancel={actions.cancelDelete}
      />
    </>
  );
};
