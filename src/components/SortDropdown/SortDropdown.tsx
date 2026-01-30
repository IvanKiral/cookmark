import { createSignal } from "solid-js";
import type { SortValue } from "~/constants/sortOptions";
import { strings } from "~/constants/strings";
import styles from "./SortDropdown.module.css";

type SortDropdownProps = {
  value: SortValue;
  onSortChange: (value: SortValue) => void;
};

const SortDropdown = (props: SortDropdownProps) => {
  const [isOpen, setIsOpen] = createSignal(false);

  const sortOptions = [
    { value: "date-desc", label: strings.sort.dateDesc },
    { value: "date-asc", label: strings.sort.dateAsc },
    { value: "name-asc", label: strings.sort.nameAsc },
    { value: "name-desc", label: strings.sort.nameDesc },
    { value: "time-asc", label: strings.sort.timeAsc },
    { value: "time-desc", label: strings.sort.timeDesc },
    { value: "difficulty-easy", label: strings.sort.difficultyEasy },
    { value: "difficulty-hard", label: strings.sort.difficultyHard },
  ] as const;

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
        <span class={styles.label}>{strings.sort.label}</span>
        <span
          class={`material-symbols-outlined ${styles.icon} ${isOpen() ? styles.iconRotated : ""}`}
        >
          expand_more
        </span>
      </button>

      {isOpen() && (
        <div class={styles.dropdownMenu}>
          {sortOptions.map((option) => (
            <button
              type="button"
              class={`${styles.dropdownItem} ${option.value === props.value ? styles.dropdownItemActive : ""}`}
              onClick={() => handleOptionClick(option.value as SortValue)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortDropdown;
