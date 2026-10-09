import type { Component } from "solid-js";
import FormField from "~/components/FormField/FormField.tsx";
import styles from "~/styles/formField.module.css";

type TextFieldProps = {
  label: string;
  value: string;
  onInput: (value: string) => void;
  hint?: string;
  error?: string;
  maxLength?: number;
  isRequired?: boolean;
};

const TextField: Component<TextFieldProps> = (props) => (
  <FormField label={props.label} hint={props.hint} error={props.error}>
    {(control) => (
      <input
        {...control}
        type="text"
        class={styles.input}
        value={props.value}
        maxLength={props.maxLength}
        required={props.isRequired}
        onInput={(event) => props.onInput(event.currentTarget.value)}
      />
    )}
  </FormField>
);

export default TextField;
