import { createSignal } from "solid-js";
import styles from "./SortDropdown.module.css";
import { SORT_OPTIONS, type SortValue } from "~/constants/sortOptions";

type SortDropdownProps = {
  value: SortValue;
  onSortChange: (value: SortValue) => void;
};

export default function SortDropdown(props: SortDropdownProps) {
  const [isOpen, setIsOpen] = createSignal(false);

  const selectedOption = () =>
    SORT_OPTIONS.find((option) => option.value === props.value) ||
    SORT_OPTIONS[0];

  const handleOptionClick = (value: SortValue) => {
    props.onSortChange(value);
    setIsOpen(false);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen());
  };

  return (
    <div class={styles.dropdown}>
      <button
        type="button"
        onClick={handleToggle}
        class={styles.dropdownButton}
        aria-haspopup="true"
        aria-expanded={isOpen()}
      >
        <span class={styles.label}>Sort by</span>
        <span class={styles.selectedValue}>{selectedOption().label}</span>
        <svg
          class={`${styles.chevron} ${isOpen() ? styles.chevronUp : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen() && (
        <div class={styles.dropdownMenu}>
          {SORT_OPTIONS.map((option) => (
            <button
              type="button"
              class={`${styles.dropdownItem} ${
                option.value === props.value ? styles.dropdownItemActive : ""
              }`}
              onClick={() => handleOptionClick(option.value as SortValue)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
