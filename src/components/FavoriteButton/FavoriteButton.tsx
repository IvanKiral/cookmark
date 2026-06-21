import type { Component } from "solid-js";
import { strings } from "~/constants/strings.ts";
import { useFavorites } from "~/contexts/FavoritesContext.tsx";
import styles from "./FavoriteButton.module.css";

type FavoriteButtonProps = {
  slug: string;
  name: string;
};

const FavoriteButton: Component<FavoriteButtonProps> = (props) => {
  const { isFavorite, toggle } = useFavorites();
  const active = () => isFavorite(props.slug);

  // Cards are links, so prevent the click from navigating.
  const handleClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    toggle(props.slug);
  };

  return (
    <button
      type="button"
      class={styles.button}
      classList={{ [styles.active]: active() }}
      aria-pressed={active()}
      aria-label={
        active() ? strings.favorites.remove(props.name) : strings.favorites.add(props.name)
      }
      onClick={handleClick}
    >
      <span class="material-symbols-outlined" aria-hidden="true">
        {active() ? "favorite" : "favorite_border"}
      </span>
    </button>
  );
};

export default FavoriteButton;
