import type { TypedTranslations } from "~/constants/translationTypes";

export const skTranslations: TypedTranslations = {
  app: {
    title: "Kniha receptov",
  },
  search: {
    placeholder: "Hľadať recepty...",
    noResults: "Neboli nájdené žiadne recepty",
    resultsCount: (count: number) => {
      if (count === 1) {
        return "1 recept nájdený";
      }
      if (count >= 2 && count <= 4) {
        return `${count} recepty nájdené`;
      }
      return `${count} receptov nájdených`;
    },
  },
  filters: {
    difficulty: "Obtiažnosť",
    time: "Čas",
    tags: "Štítky",
    all: "Všetko",
    easy: "Ľahké",
    medium: "Stredné",
    hard: "Ťažké",
    under30: "Do 30 minút",
    under60: "Do 1 hodiny",
    over60: "Viac ako 1 hodina",
  },
  sort: {
    label: "Zoradiť podľa",
    nameAsc: "Názov (A-Z)",
    nameDesc: "Názov (Z-A)",
    timeAsc: "Čas (najkratší prvý)",
    timeDesc: "Čas (najdlhší prvý)",
    difficultyEasy: "Obtiažnosť (ľahké prvé)",
    difficultyHard: "Obtiažnosť (ťažké prvé)",
  },
  recipe: {
    prep: "Príprava:",
    cook: "Varenie:",
    total: "Celkovo:",
    servings: "Porcie:",
    cuisine: "Kuchyňa:",
    ingredients: "Prísady",
    instructions: "Postup",
    viewSource: "Zobraziť zdroj receptu",
  },
  tags: {
    all: "Všetko",
    chicken: "Kura",
    pork: "Bravčové",
    beef: "Hovädzie",
    fish: "Ryba",
    vegan: "Vegánske",
    dessert: "Dezert",
    lactoseFree: "Bez laktózy",
    lowSugar: "Málo cukru",
    cake: "Koláč",
  },
};
