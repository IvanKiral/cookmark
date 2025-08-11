import Fuse from "fuse.js";
import { createMemo, createSignal } from "solid-js";
import { useT } from "~/lib/i18nContext";
import type { Recipe } from "~/types/Recipe";
import styles from "./SearchBar.module.css";

type SearchBarProps = {
	recipes: Recipe[];
	onSearchResults: (results: Recipe[]) => void;
};

export default function SearchBar(props: SearchBarProps) {
	const t = useT();
	const [searchQuery, setSearchQuery] = createSignal("");

	const fuse = createMemo(() => {
		return new Fuse(props.recipes, {
			keys: [
				{ name: "name", weight: 0.7 },
				{ name: "difficulty", weight: 0.2 },
				{ name: "time", weight: 0.1 },
			],
			threshold: 0.3,
			includeScore: true,
			minMatchCharLength: 2,
		});
	});

	const searchResults = createMemo(() => {
		const query = searchQuery().trim();
		if (!query) {
			return props.recipes;
		}

		const results = fuse().search(query);
		return results.map((result) => result.item);
	});

	const handleInput = (value: string) => {
		setSearchQuery(value);
		props.onSearchResults(searchResults());
	};

	return (
		<div class={styles.searchContainer}>
			<div class={styles.inputWrapper}>
				<input
					type="search"
					placeholder={t.search.placeholder}
					value={searchQuery()}
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
				{searchQuery() && (
					<button
						onClick={() => handleInput("")}
						class={styles.clearButton}
						type="button"
					>
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
			{searchQuery() && (
				<div class={styles.results}>
					{searchResults().length === 0
						? t.search.noResults
						: t.search.resultsCount(searchResults().length)}
				</div>
			)}
		</div>
	);
}
