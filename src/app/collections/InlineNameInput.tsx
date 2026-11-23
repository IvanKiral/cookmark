import { type Component, createSignal, onSettled, Show } from "solid-js";
import { ariaBoolean } from "~/app/ui/ariaBoolean.ts";
import styles from "./InlineNameInput.module.css";

type InlineNameInputProps = {
  initialValue: string;
  label: string;
  placeholder?: string;
  icon?: string;
  hint?: string;
  error?: string;
  class?: string;
  // Enter or blur with a name; resolves true when it was accepted and the input can close.
  onCommit: (name: string) => Promise<boolean> | boolean;
  // Esc, or Enter or blur with an empty name.
  onCancel: () => void;
};

// The inline input of the sidebar create and the renames: focused and selected
// on mount. Enter or blur saves, Esc cancels, an empty name cancels.
export const InlineNameInput: Component<InlineNameInputProps> = (props) => {
  const [value, setValue] = createSignal(props.initialValue);
  let inputRef: HTMLInputElement | undefined;
  // Enter commits and the blur that may follow must not commit again.
  let isDone = false;

  // Two frames later, so a menu or sheet that just closed has already returned
  // focus to its trigger; otherwise that would blur (and save) the input at once.
  onSettled(() => {
    const frame = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        inputRef?.focus();
        inputRef?.select();
      }),
    );
    return () => cancelAnimationFrame(frame);
  });

  const commit = async (): Promise<void> => {
    if (isDone) {
      return;
    }
    const name = value().trim();
    if (name === "") {
      isDone = true;
      props.onCancel();
      return;
    }
    isDone = true;
    const isAccepted = await props.onCommit(name);
    isDone = isAccepted;
  };

  const handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === "Enter") {
      event.preventDefault();
      commit();
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      isDone = true;
      props.onCancel();
    }
  };

  return (
    <div class={`${styles.wrapper} ${props.class ?? ""}`}>
      <div class={[styles.field, { [styles.invalid]: props.error !== undefined }]}>
        <Show when={props.icon}>
          <span class={`material-symbols-outlined ${styles.icon}`} aria-hidden="true">
            {props.icon}
          </span>
        </Show>
        <input
          ref={inputRef}
          type="text"
          class={styles.input}
          value={value()}
          placeholder={props.placeholder}
          aria-label={props.label}
          aria-invalid={ariaBoolean(props.error !== undefined)}
          enterkeyhint="done"
          onInput={(event) => setValue(event.currentTarget.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => commit()}
        />
      </div>
      <Show when={props.error ?? props.hint}>
        {(message) => (
          <span class={[styles.hint, { [styles.error]: props.error !== undefined }]}>
            {message()}
          </span>
        )}
      </Show>
    </div>
  );
};
