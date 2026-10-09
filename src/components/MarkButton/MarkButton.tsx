import type { Component } from "solid-js";
import type { Mark } from "~/constants/markOptions.ts";
import { strings } from "~/constants/strings.ts";
import { useMarks } from "~/contexts/MarksContext.tsx";
import styles from "./MarkButton.module.css";

type MarkButtonProps = {
  mark: Mark;
  slug: string;
  name: string;
};

type MarkAppearance = {
  icon: string;
  activeClass: string;
  addLabel: (name: string) => string;
  removeLabel: (name: string) => string;
};

// The active state fills the icon via CSS (font-variation-settings).
const appearances: Record<Mark, MarkAppearance> = {
  favorite: {
    icon: "favorite",
    activeClass: styles.favoriteActive,
    addLabel: strings.marks.addFavorite,
    removeLabel: strings.marks.removeFavorite,
  },
  "to-try": {
    icon: "bookmark",
    activeClass: styles.toTryActive,
    addLabel: strings.marks.addToTry,
    removeLabel: strings.marks.removeToTry,
  },
};

const MarkButton: Component<MarkButtonProps> = (props) => {
  const { isMarked, toggle } = useMarks();
  const isActive = () => isMarked(props.mark, props.slug);
  const appearance = () => appearances[props.mark];

  // Cards are links, so prevent the click from navigating.
  const handleClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    toggle(props.mark, props.slug);
  };

  return (
    <button
      type="button"
      class={styles.button}
      classList={{ [styles.active]: isActive(), [appearance().activeClass]: isActive() }}
      aria-pressed={isActive()}
      aria-label={
        isActive() ? appearance().removeLabel(props.name) : appearance().addLabel(props.name)
      }
      onClick={handleClick}
    >
      <span class="material-symbols-outlined" aria-hidden="true">
        {appearance().icon}
      </span>
    </button>
  );
};

export default MarkButton;
