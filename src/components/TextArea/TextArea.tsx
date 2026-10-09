import type { Component } from "solid-js";
import FormField from "~/components/FormField/FormField.tsx";
import styles from "~/styles/formField.module.css";

type TextAreaProps = {
  label: string;
  value: string;
  onInput: (value: string) => void;
  hint?: string;
  error?: string;
  maxLength?: number;
  rows?: number;
};

const TextArea: Component<TextAreaProps> = (props) => (
  <FormField label={props.label} hint={props.hint} error={props.error}>
    {(control) => (
      <textarea
        {...control}
        class={`${styles.input} ${styles.textarea}`}
        value={props.value}
        maxLength={props.maxLength}
        rows={props.rows ?? 4}
        onInput={(event) => props.onInput(event.currentTarget.value)}
      />
    )}
  </FormField>
);

export default TextArea;
