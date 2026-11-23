import { type Component, Show } from "solid-js";
import { BottomSheet } from "~/app/ui/BottomSheet.tsx";
import { type Collection, MAX_PINS } from "~/shared/collections.ts";
import styles from "./CollectionMenu.module.css";
import { collectionStrings } from "./strings.ts";

type CollectionMenuSheetProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  collection: Collection;
  pinnedCount: number;
  // Manual collections only.
  onAddRecipes: () => void;
  // Smart filters only.
  onEditFilter: () => void;
  onRename: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
};

const strings = collectionStrings.menu;

type RowProps = {
  icon: string;
  label: string;
  hint?: string;
  isDanger?: boolean;
  isDisabled?: boolean;
  onSelect: () => void;
};

const MenuRow: Component<RowProps> = (props) => (
  <button
    type="button"
    class={[styles.row, { [styles.danger]: props.isDanger }]}
    disabled={props.isDisabled}
    onClick={() => props.onSelect()}
  >
    <span class={`material-symbols-outlined ${styles.rowIcon}`} aria-hidden="true">
      {props.icon}
    </span>
    <span class={styles.rowText}>
      <span>{props.label}</span>
      <Show when={props.hint}>
        <span class={styles.rowHint}>{props.hint}</span>
      </Show>
    </span>
  </button>
);

// Phone: what can be done with the open collection or smart filter.
export const CollectionMenuSheet: Component<CollectionMenuSheetProps> = (props) => {
  const isSmart = (): boolean => props.collection.kind === "smart";
  const isPinned = (): boolean => props.collection.pinPosition !== null;
  const isPinDisabled = (): boolean => !isPinned() && props.pinnedCount >= MAX_PINS;

  const pinHint = (): string => {
    if (isPinned()) {
      return strings.staysUnder;
    }
    return isPinDisabled() ? strings.pinsFull : strings.pinnedCount(props.pinnedCount);
  };

  const run = (handler: () => void) => (): void => {
    props.onOpenChange(false);
    handler();
  };

  return (
    <BottomSheet
      isOpen={props.isOpen}
      onOpenChange={props.onOpenChange}
      kicker={isSmart() ? strings.smartKicker : strings.collectionKicker}
      title={props.collection.name}
      closeLabel={collectionStrings.sheet.close}
    >
      <Show
        when={isSmart()}
        fallback={
          <MenuRow icon="add" label={strings.addRecipes} onSelect={run(props.onAddRecipes)} />
        }
      >
        <MenuRow icon="tune" label={strings.editFilter} onSelect={run(props.onEditFilter)} />
      </Show>
      <MenuRow icon="edit" label={strings.rename} onSelect={run(props.onRename)} />
      <MenuRow
        icon="push_pin"
        label={isPinned() ? strings.unpin : strings.pin}
        hint={pinHint()}
        isDisabled={isPinDisabled()}
        onSelect={run(props.onTogglePin)}
      />
      <div class={styles.divider} />
      <MenuRow
        icon="delete"
        label={isSmart() ? collectionStrings.menu.deleteSmartFilter : strings.deleteCollection}
        isDanger
        onSelect={run(props.onDelete)}
      />
    </BottomSheet>
  );
};
