import { useParams, useSearchParams } from "@solidjs/router";
import Fuse from "fuse.js";
import { createMemo } from "solid-js";
import FilterSidebar from "~/components/FilterSidebar/FilterSidebar";
import LanguageSwitcher from "~/components/LanguageSwitcher/LanguageSwitcher";
import RecipeDrawer from "~/components/RecipeDrawer/RecipeDrawer";
import RecipeList from "~/components/RecipeList/RecipeList";
import SearchBar from "~/components/SearchBar/SearchBar";
import SortDropdown from "~/components/SortDropdown/SortDropdown";
import { type DifficultyFilter, difficultyValues } from "~/constants/difficultyOptions";
import { type SortValue, sortValues } from "~/constants/sortOptions";
import { type TagFilter, tagValues } from "~/constants/tagOptions";
import { type TimeFilter, timeValues } from "~/constants/timeOptions";
import type { Locale } from "~/i18n";
import { I18nProvider, useT } from "~/lib/i18nContext";
import type { Recipe } from "~/types/Recipe";
import { loadRecipes } from "~/utils/loadRecipes";
import styles from "./index.module.css";

function Home() {
  const t = useT();
  const recipes: Recipe[] = loadRecipes();
  const [searchParams, setSearchParams] = useSearchParams();

  // Derive all filters from URL params
  const difficultyFilter = createMemo((): DifficultyFilter => {
    if (!searchParams.difficulty || Array.isArray(searchParams.difficulty)) {
      return null;
    }
    return difficultyValues.includes(searchParams.difficulty)
      ? (searchParams.difficulty as DifficultyFilter)
      : null;
  });

  const timeFilter = createMemo((): TimeFilter => {
    if (!searchParams.time || Array.isArray(searchParams.time)) {
      return null;
    }
    return timeValues.includes(searchParams.time) ? (searchParams.time as TimeFilter) : null;
  });

  const tagFilter = createMemo(() => {
    if (!searchParams.tag || Array.isArray(searchParams.tag)) {
      return null;
    }
    return tagValues.includes(searchParams.tag) ? (searchParams.tag as TagFilter) : null;
  });

  const sortBy = createMemo(() => {
    const value = searchParams.sort as SortValue;

    return sortValues.includes(value) ? value : "name-asc";
  });

  const searchQuery = createMemo(() => searchParams.q || "");

  // Create Fuse instance for search
  const fuse = createMemo(() => {
    return new Fuse(recipes, {
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

  // Create sort comparator function
  const getSortComparator = (sortBy: SortValue) => {
    switch (sortBy) {
      case "name-asc":
        return (a: Recipe, b: Recipe) => a.name.localeCompare(b.name);
      case "name-desc":
        return (a: Recipe, b: Recipe) => b.name.localeCompare(a.name);
      case "time-asc":
        return (a: Recipe, b: Recipe) => a.total_time - b.total_time;
      case "time-desc":
        return (a: Recipe, b: Recipe) => b.total_time - a.total_time;
      case "difficulty-easy": {
        const difficultyOrder = { Easy: 0, Medium: 1, Hard: 2 };
        return (a: Recipe, b: Recipe) =>
          difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      }
      case "difficulty-hard": {
        const difficultyOrderReverse = { Hard: 0, Medium: 1, Easy: 2 };
        return (a: Recipe, b: Recipe) =>
          difficultyOrderReverse[a.difficulty] - difficultyOrderReverse[b.difficulty];
      }
      default:
        return (a: Recipe, b: Recipe) => a.name.localeCompare(b.name);
    }
  };

  // Filtered recipes using functional chaining
  const filteredRecipes = createMemo(() => {
    const query = searchQuery();
    const difficulty = difficultyFilter();
    const time = timeFilter();
    const tag = tagFilter();
    const sort = sortBy();

    const baseRecipes =
      query && typeof query === "string" && query.trim()
        ? fuse()
            .search(query.trim())
            .map((result) => result.item)
        : recipes;

    return baseRecipes
      .filter((recipe) => !difficulty || recipe.difficulty === difficulty)
      .filter((recipe) => {
        if (!time) {
          return true;
        }
        switch (time) {
          case "under30":
            return recipe.total_time < 30;
          case "under60":
            return recipe.total_time < 60;
          case "over60":
            return recipe.total_time >= 60;
          default:
            return true;
        }
      })
      .filter((recipe) => !tag || recipe.tags.includes(tag))
      .sort(getSortComparator(sort));
  });

  // Derive selected recipe from URL
  const selectedRecipeId = createMemo(() => {
    const slug = searchParams.recipe;
    if (!slug) {
      return null;
    }
    const recipe = recipes.find((r) => r.url_slug === slug);
    return recipe?.id ?? null;
  });

  // Drawer is open when recipe is selected
  const isDrawerOpen = createMemo(() => selectedRecipeId() !== null);

  const handleRecipeSelect = (id: string) => {
    const recipe = recipes.find((r) => r.id === id);
    if (recipe) {
      setSearchParams({ ...searchParams, recipe: recipe.url_slug });
    }
  };

  const handleDrawerClose = () => {
    setSearchParams({ ...searchParams, recipe: undefined });
  };

  const handleDifficultyFilter = (difficulty: DifficultyFilter) => {
    setSearchParams({ ...searchParams, difficulty: difficulty ?? undefined });
  };

  const handleTimeFilter = (time: TimeFilter) => {
    setSearchParams({ ...searchParams, time: time ?? undefined });
  };

  const handleTagFilter = (tag: TagFilter) => {
    setSearchParams({ ...searchParams, tag: tag ?? undefined });
  };

  const handleSortChange = (sort: SortValue) => {
    setSearchParams({
      ...searchParams,
      sort: sort !== "name-asc" ? sort : undefined,
    });
  };

  const handleSearchChange = (query: string) => {
    setSearchParams({ ...searchParams, q: query ?? undefined });
  };

  return (
    <main class={styles.main}>
      <header class={styles.header}>
        <div class={styles.headerContent}>
          <h1 class={styles.title}>{t.app.title}</h1>
          <LanguageSwitcher />
        </div>
      </header>
      <div class={styles.container}>
        <div class={styles.layout}>
          <FilterSidebar
            difficultyFilter={difficultyFilter()}
            timeFilter={timeFilter()}
            tagFilter={tagFilter()}
            onFilterChange={handleDifficultyFilter}
            onTimeFilterChange={handleTimeFilter}
            onTagFilterChange={handleTagFilter}
          />
          <div class={styles.mainContent}>
            <div class={styles.searchAndSort}>
              <SearchBar
                recipes={recipes}
                searchQuery={(searchQuery() as string) || ""}
                onSearchChange={handleSearchChange}
              />
              <SortDropdown value={sortBy()} onSortChange={handleSortChange} />
            </div>
            <RecipeList recipes={filteredRecipes()} onRecipeSelect={handleRecipeSelect} />
          </div>
        </div>
      </div>

      <RecipeDrawer
        open={isDrawerOpen()}
        onOpenChange={(open: boolean) => {
          if (!open) {
            handleDrawerClose();
          }
        }}
        recipeId={selectedRecipeId()}
        onClose={handleDrawerClose}
      />
    </main>
  );
}

export default function LangLayout() {
  const params = useParams<{ lang: Locale }>();
  return (
    <I18nProvider locale={params.lang}>
      <Home />
    </I18nProvider>
  );
}
