import { type Component, createSignal, Show } from "solid-js";
import { ariaBoolean } from "~/app/ui/ariaBoolean.ts";
import { BottomSheet } from "~/app/ui/BottomSheet.tsx";
import buttonStyles from "~/app/ui/button.module.css";
import styles from "./NewCollectionSheet.module.css";
import { collectionStrings } from "./strings.ts";

type NewCollectionSheetProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  // Resolves with an error message, or undefined once created.
  onCreate: (name: string) => Promise<string | undefined>;
};

const strings = collectionStrings.create;

// Phone: name a new manual collection. Not optimistic: Create waits for the server.
export const NewCollectionSheet: Component<NewCollectionSheetProps> = (props) => {
  const [name, setName] = createSignal("");
  const [error, setError] = createSignal<string | undefined>(undefined);
  const [isPending, setIsPending] = createSignal(false);

  const reset = (): void => {
    setName("");
    setError(undefined);
    setIsPending(false);
  };

  const handleOpenChange = (isOpen: boolean): void => {
    if (!isOpen) {
      reset();
    }
    props.onOpenChange(isOpen);
  };

  const handleSubmit = async (event: SubmitEvent): Promise<void> => {
    event.preventDefault();
    if (name().trim() === "" || isPending()) {
      return;
    }
    setIsPending(true);
    const message = await props.onCreate(name());
    setIsPending(false);
    setError(message);
    if (!message) {
      reset();
    }
  };

  return (
    <BottomSheet
      isOpen={props.isOpen}
      onOpenChange={handleOpenChange}
      title={strings.title}
      subtitle={strings.description}
      closeLabel={collectionStrings.sheet.close}
    >
      <form class={styles.form} onSubmit={handleSubmit}>
        <label class={styles.label} for="new-collection-name">
          {strings.name}
        </label>
        <input
          id="new-collection-name"
          type="text"
          class={[styles.input, { [styles.invalid]: error() !== undefined }]}
          placeholder={strings.placeholder}
          value={name()}
          aria-invalid={ariaBoolean(error() !== undefined)}
          aria-describedby={error() ? "new-collection-error" : undefined}
          enterkeyhint="done"
          onInput={(event) => {
            setName(event.currentTarget.value);
            setError(undefined);
          }}
        />
        <Show when={error()}>
          <span id="new-collection-error" class={styles.error}>
            {error()}
          </span>
        </Show>
        <div class={styles.actions}>
          <button
            type="button"
            class={`${buttonStyles.button} ${buttonStyles.secondary}`}
            onClick={() => handleOpenChange(false)}
          >
            {strings.cancel}
          </button>
          <button
            type="submit"
            class={`${buttonStyles.button} ${buttonStyles.primary}`}
            disabled={name().trim() === "" || isPending()}
          >
            {isPending() ? strings.creating : strings.create}
          </button>
        </div>
      </form>
    </BottomSheet>
  );
};
