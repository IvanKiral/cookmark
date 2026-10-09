import { For, Show } from "solid-js";
import styles from "~/styles/formField.module.css";

type TagPickerProps<T extends string> = {
  label: string;
  options: ReadonlyArray<{ value: T; label: string }>;
  selected: ReadonlyArray<T>;
  onToggle: (value: T) => void;
  error?: string;
};

// Checkboxes styled as chips: one tap selects or deselects a tag.
const TagPicker = <T extends string>(props: TagPickerProps<T>) => (
  <fieldset class={styles.field}>
    <legend class={styles.label}>{props.label}</legend>
    <div class={styles.chips}>
      <For each={props.options}>
        {(option) => (
          <label
            class={styles.chip}
            classList={{ [styles.chipSelected]: props.selected.includes(option.value) }}
          >
            <input
              type="checkbox"
              class={styles.visuallyHidden}
              checked={props.selected.includes(option.value)}
              onChange={() => props.onToggle(option.value)}
            />
            {option.label}
          </label>
        )}
      </For>
    </div>
    <Show when={props.error}>
      <p class={styles.error}>{props.error}</p>
    </Show>
  </fieldset>
);

export default TagPicker;
