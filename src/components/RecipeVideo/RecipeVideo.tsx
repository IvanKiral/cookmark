import type { Component } from "solid-js";
import styles from "./RecipeVideo.module.css";

type RecipeVideoProps = {
  src: string;
  title: string;
};

const RecipeVideo: Component<RecipeVideoProps> = (props) => (
  <div class={styles.wrapper}>
    <div class={styles.header}>
      <span class={styles.headerTitle}>Video Tutorial</span>
      <div class={styles.headerLine} />
    </div>
    <div class={styles.videoContainer}>
      {/* biome-ignore lint/a11y/useMediaCaption: captions not always available for recipe videos */}
      <video
        class={styles.video}
        src={props.src}
        controls
        preload="metadata"
        aria-label={`Video for ${props.title}`}
      />
    </div>
  </div>
);

export default RecipeVideo;
