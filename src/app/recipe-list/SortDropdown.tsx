import { createSignal, For, onSettled } from "solid-js";
import { ariaBoolean } from "~/app/ui/ariaBoolean.ts";
import styles from "./SortDropdown.module.css";
import type { ListSort, SortOption } from "./sortOptions.ts";
import { recipeListStrings } from "./strings.ts";

type SortDropdownProps = {
  value: ListSort;
  options: ReadonlyArray<SortOption>;
  // The sort used when none is chosen; the button then reads `defaultLabel`.
  defaultValue: ListSort;
  defaultLabel: string;
  onSortChange: (value: ListSort) => void;
};

export const SortDropdown = (props: SortDropdownProps) => {
  const [isOpen, setIsOpen] = createSignal(false);
  let dropdownRef: HTMLDivElement | undefined;

  const handleDocumentClick = (event: MouseEvent) => {
    if (!isOpen()) {
      return;
    }
    if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  const handleDocumentKeyDown = (event: KeyboardEvent) => {
    if (isOpen() && event.key === "Escape") {
      setIsOpen(false);
    }
  };

  onSettled(() => {
    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleDocumentKeyDown);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
      document.removeEventListener("keydown", handleDocumentKeyDown);
    };
  });

  const buttonLabel = () => {
    if (props.value === props.defaultValue) {
      return props.defaultLabel;
    }
    const activeOption = props.options.find((option) => option.value === props.value);
    return activeOption
      ? recipeListStrings.sort.activeLabel(activeOption.shortLabel)
      : props.defaultLabel;
  };

  const handleOptionClick = (value: ListSort) => {
    props.onSortChange(value);
    setIsOpen(false);
  };

  return (
    <div class={styles.dropdown} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen())}
        class={styles.dropdownButton}
        aria-haspopup="true"
        aria-expanded={ariaBoolean(isOpen())}
      >
        <span class={styles.label}>{buttonLabel()}</span>
        <span
          class={`material-symbols-outlined ${styles.icon} ${isOpen() ? styles.iconRotated : ""}`}
        >
          expand_more
        </span>
      </button>

      {isOpen() && (
        <div class={styles.dropdownMenu}>
          <For each={props.options}>
            {(option) => (
              <button
                type="button"
                class={`${styles.dropdownItem} ${option.value === props.value ? styles.dropdownItemActive : ""}`}
                onClick={() => handleOptionClick(option.value)}
              >
                {option.label}
              </button>
            )}
          </For>
        </div>
      )}
    </div>
  );
};
