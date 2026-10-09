import { type Component, createUniqueId, type JSX, Show } from "solid-js";
import styles from "~/styles/formField.module.css";

// Spread onto the control so the label, hint and error are announced with it.
export type FormControlProps = {
  id: string;
  "aria-describedby": string | undefined;
  "aria-invalid": boolean;
};

type FormFieldProps = {
  label: string;
  hint?: string;
  error?: string;
  children: (control: FormControlProps) => JSX.Element;
};

const FormField: Component<FormFieldProps> = (props) => {
  const id = createUniqueId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  // Getters keep the attributes reactive after the control spreads them.
  const control: FormControlProps = {
    id,
    get "aria-describedby"() {
      const ids = [props.hint ? hintId : undefined, props.error ? errorId : undefined];
      return ids.filter(Boolean).join(" ") || undefined;
    },
    get "aria-invalid"() {
      return Boolean(props.error);
    },
  };

  return (
    <div class={styles.field}>
      <label for={id} class={styles.label}>
        {props.label}
      </label>
      {props.children(control)}
      <Show when={props.hint}>
        <p id={hintId} class={styles.hint}>
          {props.hint}
        </p>
      </Show>
      <Show when={props.error}>
        <p id={errorId} class={styles.error}>
          {props.error}
        </p>
      </Show>
    </div>
  );
};

export default FormField;
