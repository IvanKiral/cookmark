import { createEffect } from "solid-js";

// Kobalte only returns focus to its own Trigger component, and these dialogs
// are opened by other buttons, so focus would fall to <body> on close.
// Remembers what had focus when the dialog opened and focuses it again after
// the dialog has closed (two frames, once Kobalte has unmounted its content).
export const createReturnFocus = (isOpen: () => boolean): void => {
  let opener: HTMLElement | undefined;

  createEffect(isOpen, (isOpenNow) => {
    if (isOpenNow) {
      opener = document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
      return;
    }
    const target = opener;
    opener = undefined;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (target?.isConnected) {
          target.focus({ preventScroll: true });
        }
      }),
    );
  });
};
