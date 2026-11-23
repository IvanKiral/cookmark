import { type Component, createSignal } from "solid-js";
import { BottomSheet } from "~/app/ui/BottomSheet.tsx";
import buttonStyles from "~/app/ui/button.module.css";
import type { Collection } from "~/shared/collections.ts";
import { CollectionCheckList } from "./CollectionCheckList.tsx";
import { collectionStrings } from "./strings.ts";

type AddSelectionSheetProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  // Manual collections to offer, alphabetical (the open collection left out).
  collections: ReadonlyArray<Collection>;
  countOf: (collection: Collection) => number;
  // Resolves with the new collection, or an error message.
  onCreate: (name: string) => Promise<Collection | string>;
  onAdd: (collectionIds: ReadonlyArray<string>) => void;
};

const strings = collectionStrings.addTo;

// Select mode: choose collections for the selected recipes, then Add.
export const AddSelectionSheet: Component<AddSelectionSheetProps> = (props) => {
  const [checked, setChecked] = createSignal<ReadonlySet<string>>(new Set());

  const toggle = (collection: Collection): void => {
    const next = new Set(checked());
    if (next.has(collection.id)) {
      next.delete(collection.id);
    } else {
      next.add(collection.id);
    }
    setChecked(next);
  };

  const handleCreate = async (name: string): Promise<string | undefined> => {
    const result = await props.onCreate(name);
    if (typeof result === "string") {
      return result;
    }
    setChecked(new Set([...checked(), result.id]));
    return undefined;
  };

  const handleOpenChange = (isOpen: boolean): void => {
    if (!isOpen) {
      setChecked(new Set<string>());
    }
    props.onOpenChange(isOpen);
  };

  const chosenIds = (): ReadonlyArray<string> =>
    props.collections.map((collection) => collection.id).filter((id) => checked().has(id));

  return (
    <BottomSheet
      isOpen={props.isOpen}
      onOpenChange={handleOpenChange}
      title={strings.title}
      closeLabel={collectionStrings.sheet.close}
      footer={
        <button
          type="button"
          class={`${buttonStyles.button} ${buttonStyles.primary}`}
          disabled={chosenIds().length === 0}
          onClick={() => {
            props.onAdd(chosenIds());
            handleOpenChange(false);
          }}
        >
          {strings.add}
        </button>
      }
    >
      <CollectionCheckList
        collections={props.collections}
        isChecked={(collection) => checked().has(collection.id)}
        onToggle={toggle}
        countOf={props.countOf}
        onCreate={handleCreate}
      />
    </BottomSheet>
  );
};
