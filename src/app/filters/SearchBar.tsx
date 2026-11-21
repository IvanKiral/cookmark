import type { RecipeSummary } from "~/shared/recipe.ts";
import styles from "./SearchBar.module.css";
import { filterStrings } from "./strings.ts";

type SearchBarProps = {
  recipes: RecipeSummary[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
};

export const SearchBar = (props: SearchBarProps) => {
  const handleInput = (value: string) => {
    props.onSearchChange(value);
  };

  return (
    <div class={styles.searchContainer}>
      <div class={styles.inputWrapper}>
        <span class={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
        <input
          type="search"
          placeholder={filterStrings.searchPlaceholder}
          value={props.searchQuery}
          onInput={(e) => handleInput(e.currentTarget.value)}
          class={styles.searchInput}
        />
        {props.searchQuery && (
          <button onClick={() => handleInput("")} class={styles.clearButton} type="button">
            <span class="material-symbols-outlined">close</span>
          </button>
        )}
      </div>
    </div>
  );
};
