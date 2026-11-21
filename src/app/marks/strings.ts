export const markStrings = {
  sectionTitle: "My recipes",
  favorites: "Favourites",
  toTry: "To try",
  addFavorite: (name: string) => `Add ${name} to favourites`,
  removeFavorite: (name: string) => `Remove ${name} from favourites`,
  addToTry: (name: string) => `Add ${name} to To try`,
  removeToTry: (name: string) => `Remove ${name} from To try`,
} as const;
