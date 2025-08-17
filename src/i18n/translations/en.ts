import { createStore } from "solid-js/store";
import type { TypedTranslations } from "~/constants/translationTypes";

export const enTranslations = createStore<TypedTranslations>({
  app: {
    title: "Cookmark",
  },
  search: {
    placeholder: "Search recipes...",
    noResults: "No recipes found",
    resultsCount: (count: number) => `${count} recipe${count === 1 ? "" : "s"} found`,
  },
  filters: {
    difficulty: "Difficulty",
    time: "Time",
    tags: "Tags",
    all: "All",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    under30: "Under 30 min",
    under60: "Under 1 hour",
    over60: "1+ hours",
  },
  sort: {
    label: "Sort by",
    nameAsc: "Name (A-Z)",
    nameDesc: "Name (Z-A)",
    timeAsc: "Time (shortest first)",
    timeDesc: "Time (longest first)",
    difficultyEasy: "Difficulty (easy first)",
    difficultyHard: "Difficulty (hard first)",
  },
  recipe: {
    prep: "Prep:",
    cook: "Cook:",
    total: "Total:",
    servings: "Servings:",
    cuisine: "Cuisine:",
    ingredients: "Ingredients",
    instructions: "Instructions",
    viewSource: "View Recipe Source",
  },
  tags: {
    all: "All",
    chicken: "Chicken",
    pork: "Pork",
    beef: "Beef",
    fish: "Fish",
    vegan: "Vegan",
    dessert: "Dessert",
    lactoseFree: "Lactose-free",
    lowSugar: "Low-Sugar",
    cake: "Cake",
  },
  languageSwitcher: {
    switchToEnglish: "Switch to English",
    switchToSlovak: "Switch to Slovak",
  },
});
