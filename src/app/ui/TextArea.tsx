import type { Component } from "solid-js";
import { FormField } from "./FormField.tsx";
import styles from "./formField.module.css";

type TextAreaProps = {
  label: string;
  isLabelHidden?: boolean;
  value: string;
  onInput: (value: string) => void;
  hint?: string;
  error?: string;
  maxLength?: number;
  rows?: number;
};

export const TextArea: Component<TextAreaProps> = (props) => (
  <FormField
    label={props.label}
    isLabelHidden={props.isLabelHidden}
    hint={props.hint}
    error={props.error}
  >
    {(control) => (
      <textarea
        {...control}
        class={`${styles.input} ${styles.textarea}`}
        value={props.value}
        maxlength={props.maxLength}
        rows={props.rows ?? 4}
        onInput={(event) => props.onInput(event.currentTarget.value)}
      />
    )}
  </FormField>
);
