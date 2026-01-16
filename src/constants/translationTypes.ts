import type { DifficultyTranslationKey } from "./difficultyOptions.js";
import type { TagTranslationKey } from "./tagOptions.js";
import type { TimeTranslationKey } from "./timeOptions.js";

export type FilterTranslations = Record<DifficultyTranslationKey | TimeTranslationKey, string> & {
  difficulty: string;
  time: string;
  tags: string;
};

export type TagTranslations = Record<TagTranslationKey, string>;

// Complete translation structure with typed filter sections
export type TypedTranslations = {
  app: {
    title: string;
  };
  search: {
    placeholder: string;
    noResults: string;
    resultsCount: (count: number) => string;
  };
  filters: FilterTranslations;
  sort: {
    label: string;
    nameAsc: string;
    nameDesc: string;
    timeAsc: string;
    timeDesc: string;
    difficultyEasy: string;
    difficultyHard: string;
  };
  recipe: {
    prep: string;
    cook: string;
    total: string;
    servings: string;
    cuisine: string;
    ingredients: string;
    instructions: string;
    viewSource: string;
  };
  tags: TagTranslations;
  filterDrawer: {
    title: string;
    clearAll: string;
    filtersButton: string;
  };
  recipeList: {
    name: string;
    difficulty: string;
    time: string;
  };
  languageSwitcher: {
    switchToEnglish: string;
    switchToSlovak: string;
  };
  pagination: {
    previous: string;
    next: string;
    goToPage: (page: number) => string;
    pageInfo: (current: number, total: number) => string;
  };
};
