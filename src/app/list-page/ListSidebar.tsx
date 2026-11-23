import { type Component, createSignal, Show } from "solid-js";
import { InlineNameInput } from "~/app/collections/InlineNameInput.tsx";
import { LibrarySidebar } from "~/app/collections/LibrarySidebar.tsx";
import { collectionStrings } from "~/app/collections/strings.ts";
import type { ListPage } from "./createListPage.ts";
import styles from "./ListPage.module.css";

// Desktop: the library sidebar with its inline create and double-click rename.
export const ListSidebar: Component<{ page: ListPage }> = (props) => {
  const actions = props.page.collectionActions;
  const [isCreating, setIsCreating] = createSignal(false);
  const [createError, setCreateError] = createSignal<string | undefined>(undefined);

  const create = async (name: string): Promise<boolean> => {
    const error = await actions.create(name);
    setCreateError(error);
    if (!error) {
      setIsCreating(false);
    }
    return !error;
  };

  const cancelCreate = (): void => {
    setIsCreating(false);
    setCreateError(undefined);
  };

  return (
    <LibrarySidebar
      place={props.page.place()}
      collections={props.page.collectionsContext.collections()}
      countOf={props.page.countOf}
      onSelectPlace={props.page.selectPlace}
      headingAction={
        <button
          type="button"
          class={styles.sidebarAdd}
          aria-label={collectionStrings.create.newCollectionButton}
          onClick={() => setIsCreating(true)}
        >
          <span class="material-symbols-outlined" aria-hidden="true">
            add
          </span>
        </button>
      }
      onRenameCollection={(collection) => actions.startRename(collection, "sidebar")}
      renamingId={actions.renamingIdOn("sidebar")}
      renderRename={(collection) => (
        <InlineNameInput
          initialValue={collection.name}
          label={collectionStrings.header.renameSidebar(collection.name)}
          icon={collection.kind === "smart" ? "tune" : "collections_bookmark"}
          error={actions.renameError()}
          onCommit={(name) => actions.commitRename(collection, name)}
          onCancel={actions.cancelRename}
        />
      )}
      footer={
        <Show when={isCreating()}>
          <InlineNameInput
            initialValue=""
            label={collectionStrings.create.inlineLabel}
            placeholder={collectionStrings.create.inlinePlaceholder}
            icon="collections_bookmark"
            hint={collectionStrings.create.inlineHint}
            error={createError()}
            onCommit={create}
            onCancel={cancelCreate}
          />
        </Show>
      }
    />
  );
};
