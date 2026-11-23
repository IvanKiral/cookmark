import { type Component, createSignal, flush, Show } from "solid-js";
import styles from "./ScalableAmount.module.css";
import { formatAmount, parseTypedAmount } from "./scaling.ts";

type ScalableAmountProps = {
  value: number;
  // Shown after the number in the button, e.g. "g"; empty for none.
  unit: string;
  // Shown after the input, e.g. "g" or "pcs".
  inputUnit: string;
  buttonLabel: string;
  inputLabel: string;
  isAnchor: boolean;
  step: number;
  onStart: () => void;
  // 0 when the typed text is empty or not a positive number.
  onChange: (value: number) => void;
  onCancel: () => void;
  class?: string;
};

const roundStep = (value: number): number => Math.round(value * 10) / 10;

// An amount that turns into an input when activated. Typing scales live; Enter
// or blur closes the input, Esc restores the value from before this edit and
// ArrowUp/ArrowDown step by `step` (never below one step).
export const ScalableAmount: Component<ScalableAmountProps> = (props) => {
  const [isEditing, setIsEditing] = createSignal(false);
  const [text, setText] = createSignal("");
  let inputRef: HTMLInputElement | undefined;

  const handleOpen = (): void => {
    props.onStart();
    setText(formatAmount(props.value));
    setIsEditing(true);
    flush();
    inputRef?.focus();
    inputRef?.select();
  };

  const handleInput = (event: InputEvent & { currentTarget: HTMLInputElement }): void => {
    setText(event.currentTarget.value);
    props.onChange(parseTypedAmount(event.currentTarget.value) ?? 0);
  };

  const stepBy = (direction: 1 | -1): void => {
    const current = parseTypedAmount(text()) ?? props.value;
    const next = Math.max(props.step, roundStep(current + direction * props.step));
    setText(formatAmount(next));
    props.onChange(next);
  };

  const handleKeyDown = (event: KeyboardEvent & { currentTarget: HTMLInputElement }): void => {
    if (event.key === "Enter") {
      event.preventDefault();
      event.currentTarget.blur();
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      props.onCancel();
      setIsEditing(false);
      return;
    }
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      stepBy(event.key === "ArrowUp" ? 1 : -1);
    }
  };

  return (
    <Show
      when={isEditing()}
      fallback={
        <button
          type="button"
          class={`${styles.button} ${props.isAnchor ? styles.anchor : ""} ${props.class ?? ""}`}
          aria-label={props.buttonLabel}
          onClick={handleOpen}
        >
          <span class={styles.number}>
            {formatAmount(props.value)}
            {props.unit ? ` ${props.unit}` : ""}
          </span>
          <span class={`material-symbols-outlined ${styles.pen}`} aria-hidden="true">
            edit
          </span>
        </button>
      }
    >
      <label class={`${styles.editor} ${props.class ?? ""}`}>
        <input
          ref={inputRef}
          type="text"
          inputmode="decimal"
          enterkeyhint="done"
          class={styles.input}
          value={text()}
          aria-label={props.inputLabel}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onBlur={() => setIsEditing(false)}
        />
        <span class={styles.inputUnit}>{props.inputUnit}</span>
      </label>
    </Show>
  );
};
