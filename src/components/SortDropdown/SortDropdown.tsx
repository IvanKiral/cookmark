import { createSignal } from "solid-js";
import type { SortValue } from "~/constants/sortOptions";
import { useT } from "~/lib/i18nContext";
import styles from "./SortDropdown.module.css";

type SortDropdownProps = {
  value: SortValue;
  onSortChange: (value: SortValue) => void;
};

const SortDropdown = (props: SortDropdownProps) => {
  const t = useT();
  const [isOpen, setIsOpen] = createSignal(false);

  const sortOptions = [
    { value: "name-asc", label: t.sort.nameAsc },
    { value: "name-desc", label: t.sort.nameDesc },
    { value: "time-asc", label: t.sort.timeAsc },
    { value: "time-desc", label: t.sort.timeDesc },
    { value: "difficulty-easy", label: t.sort.difficultyEasy },
    { value: "difficulty-hard", label: t.sort.difficultyHard },
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
        <span class={styles.label}>{t.sort.label}</span>
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
