import type { Component } from "solid-js";
import { RecipeMediaSection } from "./RecipeMediaSection.tsx";
import styles from "./RecipeVideo.module.css";
import { recipePageStrings } from "./strings.ts";

type RecipeVideoProps = {
  src: string;
  title: string;
};

export const RecipeVideo: Component<RecipeVideoProps> = (props) => (
  <RecipeMediaSection title={recipePageStrings.videoTutorial}>
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
