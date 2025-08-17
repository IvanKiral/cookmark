import { useT } from "~/lib/i18nContext";
import type { Recipe } from "~/types/Recipe";
import styles from "./SearchBar.module.css";

type SearchBarProps = {
  recipes: Recipe[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
};

export default function SearchBar(props: SearchBarProps) {
  const t = useT();

  const handleInput = (value: string) => {
    props.onSearchChange(value);
  };

  return (
    <div class={styles.searchContainer}>
      <div class={styles.inputWrapper}>
        <input
          type="search"
          placeholder={t.search.placeholder}
          value={props.searchQuery}
          onInput={(e) => handleInput(e.currentTarget.value)}
          class={styles.searchInput}
        />
        <div class={styles.searchIcon}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <title>Search icon</title>
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        {props.searchQuery && (
          <button onClick={() => handleInput("")} class={styles.clearButton} type="button">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <title>Clear search icon</title>
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
