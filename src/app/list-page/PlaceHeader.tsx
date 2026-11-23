import { type Component, Show } from "solid-js";
import { CollectionHeaderCard } from "~/app/collections/CollectionHeaderCard.tsx";
import { CollectionMenu } from "~/app/collections/CollectionMenu.tsx";
import { InlineNameInput } from "~/app/collections/InlineNameInput.tsx";
import { PlaceActions } from "~/app/collections/PlaceActions.tsx";
import { collectionStrings } from "~/app/collections/strings.ts";
import buttonStyles from "~/app/ui/button.module.css";
import type { ListPage } from "./createListPage.ts";
import styles from "./ListPage.module.css";

// The open place above the list: a header card on phones (collections only),
// the title with its actions on desktop.
export const PlaceHeader: Component<{ page: ListPage }> = (props) => {
  const actions = props.page.collectionActions;

  return (
    <>
      <Show when={props.page.placeCollection()}>
        {(collection) => (
          <div class={styles.phoneOnly}>
            <CollectionHeaderCard
              collection={collection()}
              meta={props.page.placeMeta()}
              isRenaming={props.page.isRenamingPlace()}
              renameError={actions.renameError()}
              onRenameCommit={(name) => actions.commitRename(collection(), name)}
              onRenameCancel={actions.cancelRename}
              onOpenMenu={() => props.page.collectionMenu.setIsOpen(true)}
              actions={
                <PlaceActions
                  collection={collection()}
                  canReorder={props.page.canReorder()}
                  onReorder={() => props.page.setIsReordering(true)}
                  onEditFilter={() => props.page.startEditFilter(collection())}
                />
              }
            />
          </div>
        )}
      </Show>
      <div class={styles.placeTitle}>
        <div class={styles.placeTitleText}>
          <Show
            when={props.page.isRenamingPlace() && props.page.placeCollection()}
            fallback={
              <h2 class={styles.placeName}>
                {props.page.isReordering()
                  ? collectionStrings.reorder.desktopHint
                  : props.page.placeTitle()}
              </h2>
            }
          >
            {(collection) => (
              <InlineNameInput
                class={styles.placeNameInput}
                initialValue={collection().name}
                label={collectionStrings.header.renameLabel}
                error={actions.renameError()}
                onCommit={(name) => actions.commitRename(collection(), name)}
                onCancel={actions.cancelRename}
              />
            )}
          </Show>
          <p class={styles.placeSubtitle}>{props.page.placeSubtitle()}</p>
        </div>
        <Show when={props.page.isReordering()}>
          <div class={styles.placeActions}>
            <button
              type="button"
              class={`${buttonStyles.button} ${buttonStyles.primary}`}
              onClick={() => props.page.setIsReordering(false)}
            >
              {collectionStrings.reorder.done}
            </button>
          </div>
        </Show>
        <Show
          when={
            !(props.page.isReordering() || props.page.pickCollection()) &&
            props.page.placeCollection()
          }
        >
          {(collection) => (
            <PlaceActions
              collection={collection()}
              canReorder={props.page.canReorder()}
              onReorder={() => props.page.setIsReordering(true)}
              onEditFilter={() => props.page.startEditFilter(collection())}
              onAddRecipes={() => props.page.startPicking(collection())}
              menu={
                <CollectionMenu
                  collection={collection()}
                  onRename={() => actions.startRename(collection(), "title")}
                  onDelete={() => actions.requestDelete(collection())}
                />
              }
            />
          )}
        </Show>
      </div>
    </>
  );
};
