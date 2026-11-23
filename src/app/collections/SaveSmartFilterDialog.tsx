import { Dialog } from "@kobalte/core/dialog";
import { type Component, createEffect, createSignal, For, Show } from "solid-js";
import { listActiveFilters } from "~/app/filters/activeFilters.ts";
import type { RecipeFilters } from "~/app/filters/recipeFilters.ts";
import { ariaBoolean } from "~/app/ui/ariaBoolean.ts";
import buttonStyles from "~/app/ui/button.module.css";
import { createReturnFocus } from "~/app/ui/createReturnFocus.ts";
import { MAX_COLLECTION_NAME_LENGTH } from "~/shared/collections.ts";
import { describeSmartFilters } from "./places.ts";
import styles from "./SaveSmartFilterDialog.module.css";
import { collectionStrings } from "./strings.ts";

type SaveSmartFilterDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  filters: RecipeFilters;
  // Phone only: the pin box. Unchecked and disabled when the top bar is full.
  isPinShown: boolean;
  isPinsFull: boolean;
  // Resolves with an error message, or undefined once saved.
  onSave: (name: string, isPinned: boolean) => Promise<string | undefined>;
};

const strings = collectionStrings.smart;

// Name the current filters and keep them as a smart filter. Only filter
// values are saved, never the search text.
export const SaveSmartFilterDialog: Component<SaveSmartFilterDialogProps> = (props) => {
  const [name, setName] = createSignal("");
  const [isPinned, setIsPinned] = createSignal(true);
  const [error, setError] = createSignal<string | undefined>(undefined);
  const [isPending, setIsPending] = createSignal(false);
  createReturnFocus(() => props.isOpen);

  // Each opening starts from the description of the filters, cut to the name limit.
  createEffect(
    () => props.isOpen,
    (isOpen) => {
      if (!isOpen) {
        return;
      }
      setName(describeSmartFilters(props.filters).slice(0, MAX_COLLECTION_NAME_LENGTH).trim());
      setIsPinned(!props.isPinsFull);
      setError(undefined);
      setIsPending(false);
    },
  );

  const handleSubmit = async (event: SubmitEvent): Promise<void> => {
    event.preventDefault();
    if (isPending()) {
      return;
    }
    setIsPending(true);
    const message = await props.onSave(name(), props.isPinShown && isPinned());
    setIsPending(false);
    setError(message);
  };

  return (
    <Dialog open={props.isOpen} onOpenChange={props.onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay class={styles.backdrop} />
        <div class={styles.positioner}>
          <Dialog.Content class={styles.content} role="dialog">
            <Dialog.Title class={styles.title}>{strings.saveTitle}</Dialog.Title>
            <Dialog.Description class={styles.description}>
              {strings.saveDescription}
            </Dialog.Description>
            <form class={styles.form} onSubmit={handleSubmit}>
              <label class={styles.label} for="smart-filter-name">
                {collectionStrings.create.name}
              </label>
              <input
                id="smart-filter-name"
                type="text"
                class={[styles.input, { [styles.invalid]: error() !== undefined }]}
                value={name()}
                aria-invalid={ariaBoolean(error() !== undefined)}
                aria-describedby={error() ? "smart-filter-error" : undefined}
                onInput={(event) => {
                  setName(event.currentTarget.value);
                  setError(undefined);
                }}
              />
              <Show when={error()}>
                <span id="smart-filter-error" class={styles.error}>
                  {error()}
                </span>
              </Show>
              <span class={styles.label}>{strings.filtersLabel}</span>
              <div class={styles.chips}>
                <For each={listActiveFilters(props.filters)}>
                  {(filter) => <span class={styles.chip}>{filter.label}</span>}
                </For>
              </div>
              <Show when={props.isPinShown}>
                <label class={styles.pin}>
                  <input
                    type="checkbox"
                    checked={isPinned() && !props.isPinsFull}
                    disabled={props.isPinsFull}
                    onChange={(event) => setIsPinned(event.currentTarget.checked)}
                  />
                  {strings.pinToTopBar}
                </label>
              </Show>
              <div class={styles.actions}>
                <button
                  type="button"
                  class={`${buttonStyles.button} ${buttonStyles.secondary}`}
                  onClick={() => props.onOpenChange(false)}
                >
                  {strings.cancel}
                </button>
                <button
                  type="submit"
                  class={`${buttonStyles.button} ${buttonStyles.primary}`}
                  disabled={name().trim() === "" || isPending()}
                >
                  {isPending() ? strings.saving : strings.save}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog>
  );
};
