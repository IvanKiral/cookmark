import type { Component } from "solid-js";
import { strings } from "~/app/strings.ts";
import { RecipeMediaSection } from "./RecipeMediaSection.tsx";
import styles from "./RecipeVideo.module.css";

type RecipeVideoProps = {
  src: string;
  title: string;
};

export const RecipeVideo: Component<RecipeVideoProps> = (props) => (
  <RecipeMediaSection title={strings.recipe.videoTutorial}>
    <div class={styles.videoContainer}>
      {/* biome-ignore lint/a11y/useMediaCaption: captions not always available for recipe videos */}
      <video
        class={styles.video}
        src={props.src}
        controls
        playsinline
        preload="metadata"
        aria-label={`Video for ${props.title}`}
      />
    </div>
  </RecipeMediaSection>
);
