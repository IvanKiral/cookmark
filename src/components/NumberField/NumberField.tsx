import type { Component } from "solid-js";
import FormField from "~/components/FormField/FormField.tsx";
import styles from "~/styles/formField.module.css";

type NumberFieldProps = {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  hint?: string;
  error?: string;
  max?: number;
};

// Whole numbers from 0 up. An empty field is null. Out-of-range or fractional
// values are passed through so the form's validation can explain the problem.
const NumberField: Component<NumberFieldProps> = (props) => (
  <FormField label={props.label} hint={props.hint} error={props.error}>
    {(control) => (
      <input
        {...control}
        type="number"
        inputMode="numeric"
        min={0}
        max={props.max}
        step={1}
        class={`${styles.input} ${styles.number}`}
        value={props.value ?? ""}
        onInput={(event) => {
          const raw = event.currentTarget.value;
          props.onChange(raw === "" ? null : Number(raw));
        }}
      />
    )}
  </FormField>
);

export default NumberField;
