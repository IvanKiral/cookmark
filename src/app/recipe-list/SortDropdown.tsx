import { createSignal, onSettled } from "solid-js";
import { ariaBoolean } from "~/app/ui/ariaBoolean.ts";
import styles from "./SortDropdown.module.css";
import { DEFAULT_SORT, type SortValue } from "./sortOptions.ts";
import { recipeListStrings } from "./strings.ts";

type SortDropdownProps = {
  value: SortValue;
  onSortChange: (value: SortValue) => void;
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

  const sortOptions = [
    {
      value: "date-desc",
      label: recipeListStrings.sort.dateDesc,
      shortLabel: recipeListStrings.sort.shortDateDesc,
    },
    {
      value: "date-asc",
      label: recipeListStrings.sort.dateAsc,
      shortLabel: recipeListStrings.sort.shortDateAsc,
    },
    {
      value: "name-asc",
      label: recipeListStrings.sort.nameAsc,
      shortLabel: recipeListStrings.sort.shortNameAsc,
    },
    {
      value: "name-desc",
      label: recipeListStrings.sort.nameDesc,
      shortLabel: recipeListStrings.sort.shortNameDesc,
    },
    {
      value: "time-asc",
      label: recipeListStrings.sort.timeAsc,
      shortLabel: recipeListStrings.sort.shortTimeAsc,
    },
    {
      value: "time-desc",
      label: recipeListStrings.sort.timeDesc,
      shortLabel: recipeListStrings.sort.shortTimeDesc,
    },
    {
      value: "difficulty-easy",
      label: recipeListStrings.sort.difficultyEasy,
      shortLabel: recipeListStrings.sort.shortDifficultyEasy,
    },
    {
      value: "difficulty-hard",
      label: recipeListStrings.sort.difficultyHard,
      shortLabel: recipeListStrings.sort.shortDifficultyHard,
    },
  ] as const;

  const buttonLabel = () => {
    if (props.value === DEFAULT_SORT) {
      return recipeListStrings.sort.label;
    }
    const activeOption = sortOptions.find((option) => option.value === props.value);
    return activeOption
      ? recipeListStrings.sort.activeLabel(activeOption.shortLabel)
      : recipeListStrings.sort.label;
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
