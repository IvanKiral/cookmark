import { createSignal, onCleanup, onMount } from "solid-js";
import { DEFAULT_SORT, type SortValue } from "~/constants/sortOptions.ts";
import { strings } from "~/constants/strings.ts";
import styles from "./SortDropdown.module.css";

type SortDropdownProps = {
  value: SortValue;
  onSortChange: (value: SortValue) => void;
};

const SortDropdown = (props: SortDropdownProps) => {
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

  onMount(() => {
    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleDocumentKeyDown);

    onCleanup(() => {
      document.removeEventListener("click", handleDocumentClick);
      document.removeEventListener("keydown", handleDocumentKeyDown);
    });
  });

  const sortOptions = [
    { value: "date-desc", label: strings.sort.dateDesc, shortLabel: strings.sort.shortDateDesc },
    { value: "date-asc", label: strings.sort.dateAsc, shortLabel: strings.sort.shortDateAsc },
    { value: "name-asc", label: strings.sort.nameAsc, shortLabel: strings.sort.shortNameAsc },
    { value: "name-desc", label: strings.sort.nameDesc, shortLabel: strings.sort.shortNameDesc },
    { value: "time-asc", label: strings.sort.timeAsc, shortLabel: strings.sort.shortTimeAsc },
    { value: "time-desc", label: strings.sort.timeDesc, shortLabel: strings.sort.shortTimeDesc },
    {
      value: "difficulty-easy",
      label: strings.sort.difficultyEasy,
      shortLabel: strings.sort.shortDifficultyEasy,
    },
    {
      value: "difficulty-hard",
      label: strings.sort.difficultyHard,
      shortLabel: strings.sort.shortDifficultyHard,
    },
  ] as const;

  const buttonLabel = () => {
    if (props.value === DEFAULT_SORT) {
      return strings.sort.label;
    }
    const activeOption = sortOptions.find((option) => option.value === props.value);
    return activeOption ? strings.sort.activeLabel(activeOption.shortLabel) : strings.sort.label;
  };

  const handleOptionClick = (value: SortValue) => {
    props.onSortChange(value);
    setIsOpen(false);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen());
  };

  return (
    <div class={styles.dropdown} ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        class={styles.dropdownButton}
        aria-haspopup="true"
        aria-expanded={isOpen()}
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
