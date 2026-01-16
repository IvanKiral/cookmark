import { useT } from "~/lib/i18nContext";
import type { Recipe } from "~/types/Recipe";
import styles from "./SearchBar.module.css";

type SearchBarProps = {
  recipes: Recipe[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
};

const SearchBar = (props: SearchBarProps) => {
  const t = useT();

  const handleInput = (value: string) => {
    props.onSearchChange(value);
  };

  return (
    <div class={styles.searchContainer}>
      <div class={styles.inputWrapper}>
        <span class={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
        <input
          type="search"
          placeholder={t.search.placeholder}
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

export default SearchBar;
