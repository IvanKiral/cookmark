import {
  type Accessor,
  createContext,
  createSignal,
  onMount,
  type ParentComponent,
  useContext,
} from "solid-js";

type FavoritesContextValue = {
  favorites: Accessor<ReadonlySet<string>>;
  isFavorite: (slug: string) => boolean;
  toggle: (slug: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue>();

export const FavoritesProvider: ParentComponent = (props) => {
  const [favorites, setFavorites] = createSignal<ReadonlySet<string>>(new Set());

  // Runs on the client after hydration — favourites are per-user runtime data.
  onMount(async () => {
    try {
      const response = await fetch("/api/favorites");
      if (response.ok) {
        const data = (await response.json()) as { slugs?: ReadonlyArray<string> };
        setFavorites(new Set(data.slugs ?? []));
      }
    } catch {
      // Leave favourites empty if the fetch fails.
    }
  });

  const isFavorite = (slug: string): boolean => favorites().has(slug);

  const toggle = (slug: string): void => {
    const wasFavorite = favorites().has(slug);

    const apply = (add: boolean) => {
      const next = new Set(favorites());
      if (add) {
        next.add(slug);
      } else {
        next.delete(slug);
      }
      setFavorites(next);
    };

    // Optimistic update, reverted if the request fails.
    apply(!wasFavorite);
    fetch(`/api/favorites/${slug}`, { method: wasFavorite ? "DELETE" : "PUT" })
      .then((response) => {
        if (!response.ok) {
          apply(wasFavorite);
        }
      })
      .catch(() => apply(wasFavorite));
  };

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggle }}>
      {props.children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextValue => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};
