import { createSignal, createMemo } from "solid-js";
import Fuse from "fuse.js";
import type { Recipe } from "~/types/Recipe";

type SearchBarProps = {
  recipes: Recipe[];
  onSearchResults: (results: Recipe[]) => void;
};

export default function SearchBar(props: SearchBarProps) {
  const [searchQuery, setSearchQuery] = createSignal("");

  const fuse = createMemo(() => {
    return new Fuse(props.recipes, {
      keys: [
        { name: "name", weight: 0.7 },
        { name: "difficulty", weight: 0.2 },
        { name: "time", weight: 0.1 }
      ],
      threshold: 0.3,
      includeScore: true,
      minMatchCharLength: 2
    });
  });

  const searchResults = createMemo(() => {
    const query = searchQuery().trim();
    if (!query) return props.recipes;
    
    const results = fuse().search(query);
    return results.map(result => result.item);
  });

  const handleInput = (value: string) => {
    setSearchQuery(value);
    props.onSearchResults(searchResults());
  };

  return (
    <div class="w-full max-w-md mx-auto mb-8">
      <div class="relative">
        <input
          type="search"
          placeholder="Search recipes..."
          value={searchQuery()}
          onInput={(e) => handleInput(e.currentTarget.value)}
          class="w-full px-4 py-3 pl-12 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <div class="absolute inset-y-0 left-0 flex items-center pl-4">
          <svg
            class="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
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
            class="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div class="mt-2 text-sm text-gray-600">
          {searchResults().length === 0 
            ? "No recipes found" 
            : `${searchResults().length} recipe${searchResults().length === 1 ? "" : "s"} found`
          }
        </div>
      )}
    </div>
  );
}