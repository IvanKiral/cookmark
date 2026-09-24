import "photoswipe/style.css";
import type PhotoSwipe from "photoswipe";
import { type Component, onCleanup } from "solid-js";
import RecipeMediaSection from "~/components/RecipeMediaSection/RecipeMediaSection.tsx";
import { strings } from "~/constants/strings.ts";
import styles from "./RecipeImage.module.css";

type RecipeImageProps = {
  src: string;
  title: string;
};

const RecipeImage: Component<RecipeImageProps> = (props) => {
  let imageRef: HTMLImageElement | undefined;
  let lightbox: PhotoSwipe | undefined;

  // PhotoSwipe is loaded on first open so it stays out of the page bundle. It
  // needs the real dimensions up front, which the already rendered <img> provides.
  const handleOpen = async (): Promise<void> => {
    if (!imageRef || imageRef.naturalWidth === 0) {
      return;
    }

    const { default: PhotoSwipeModule } = await import("photoswipe");
    lightbox = new PhotoSwipeModule({
      dataSource: [
        {
          src: props.src,
          width: imageRef.naturalWidth,
          height: imageRef.naturalHeight,
          alt: props.title,
          element: imageRef,
        },
      ],
      index: 0,
      showHideAnimationType: "zoom",
      bgOpacity: 0.95,
    });
    lightbox.init();
  };

  onCleanup(() => lightbox?.destroy());

  return (
    <RecipeMediaSection title={strings.recipe.originalRecipe}>
      <div class={styles.imageContainer}>
        <button
          type="button"
          class={styles.trigger}
          onClick={handleOpen}
          aria-label={`${strings.recipe.zoomImage}: ${props.title}`}
        >
          <img
            ref={imageRef}
            class={styles.image}
            src={props.src}
            alt={props.title}
            loading="lazy"
          />
          <span class={styles.hint} aria-hidden="true">
            <span class="material-symbols-outlined">zoom_in</span>
            {strings.recipe.zoomImage}
          </span>
        </button>
      </div>
    </RecipeMediaSection>
  );
};

export default RecipeImage;
