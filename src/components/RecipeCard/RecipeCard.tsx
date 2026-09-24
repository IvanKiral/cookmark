import { A, useLocation } from "@solidjs/router";
import { type Component, createSignal, onMount, Show } from "solid-js";
import FavoriteButton from "~/components/FavoriteButton/FavoriteButton.tsx";
import styles from "./RecipeCard.module.css";

type RecipeCardProps = {
  urlSlug: string;
  name: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Unknown";
  time: string;
};

const RecipeCard: Component<RecipeCardProps> = (props) => {
  const location = useLocation();
  const [hasImageError, setHasImageError] = createSignal(false);
  let imageRef: HTMLImageElement | undefined;

  // The image is server-rendered, so a 404 can fire its error event before the
  // client hydrates and attaches onError. Re-check once mounted: a finished load
  // with zero intrinsic width means the thumbnail failed.
  onMount(() => {
    if (imageRef?.complete && imageRef.naturalWidth === 0) {
      setHasImageError(true);
    }
  });

  return (
    <A
      href={`/recipe/${props.urlSlug}`}
      state={{ fromSearch: location.search }}
      class={styles.card}
    >
      <div class={styles.thumb}>
        <Show
          when={!hasImageError()}
          fallback={
            <div class={styles.placeholder} aria-hidden="true">
              <span class="material-symbols-outlined">restaurant</span>
            </div>
          }
        >
          <img
            ref={imageRef}
            class={styles.image}
            src={`/thumbnails/${props.urlSlug}`}
            alt={props.name}
            loading="lazy"
            onError={() => setHasImageError(true)}
          />
        </Show>
        <div class={styles.favorite}>
          <FavoriteButton slug={props.urlSlug} name={props.name} />
        </div>
      </div>
      <div class={styles.body}>
        <h3 class={styles.title}>{props.name}</h3>
        <div class={styles.meta}>
          <span class={styles.difficulty} data-level={props.difficulty}>
            {props.difficulty}
          </span>
          <span class={styles.time}>{props.time}</span>
        </div>
      </div>
    </A>
  );
};

export default RecipeCard;
