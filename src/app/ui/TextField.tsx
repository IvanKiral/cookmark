import type { Component } from "solid-js";
import { FormField } from "./FormField.tsx";
import styles from "./formField.module.css";

type TextFieldProps = {
  label: string;
  isLabelHidden?: boolean;
  value: string;
  onInput: (value: string) => void;
  hint?: string;
  error?: string;
  maxLength?: number;
  placeholder?: string;
  isRequired?: boolean;
};

export const TextField: Component<TextFieldProps> = (props) => (
  <FormField
    label={props.label}
    isLabelHidden={props.isLabelHidden}
    hint={props.hint}
    error={props.error}
  >
    {(control) => (
      <input
        {...control}
        type="text"
        class={styles.input}
        value={props.value}
        maxlength={props.maxLength}
        placeholder={props.placeholder}
        required={props.isRequired}
        onInput={(event) => props.onInput(event.currentTarget.value)}
      />
    )}
  </FormField>
);
