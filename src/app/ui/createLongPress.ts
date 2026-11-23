const LONG_PRESS_MS = 500;
// More movement than this is a scroll or a drag, not a press.
const MOVE_TOLERANCE_PX = 10;
// The click that ends a long press comes right after the finger lifts.
const CLICK_AFTER_PRESS_MS = 1000;

// The press may swap the element (a link becomes a select toggle), so the
// click that ends it lands on the new element: swallow it on the document.
const swallowNextClick = (): void => {
  const swallow = (event: MouseEvent): void => {
    event.preventDefault();
    event.stopPropagation();
  };
  document.addEventListener("click", swallow, { capture: true, once: true });
  setTimeout(
    () => document.removeEventListener("click", swallow, { capture: true }),
    CLICK_AFTER_PRESS_MS,
  );
};

export type LongPressHandlers = {
  onPointerDown: (event: PointerEvent) => void;
  onPointerMove: (event: PointerEvent) => void;
  onPointerUp: () => void;
  onPointerCancel: () => void;
  onPointerLeave: () => void;
  onClick: (event: MouseEvent) => void;
  onContextMenu: (event: MouseEvent) => void;
};

// Touch and pen only: a press held for 500ms without moving calls
// `onLongPress`, and the click that follows it is swallowed so the link
// underneath does not open. Scrolling cancels it (the browser sends
// pointercancel, or the finger moves).
export const createLongPress = (onLongPress: () => void): LongPressHandlers => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let start: { x: number; y: number } | undefined;
  let wasTriggered = false;

  const cancel = (): void => {
    clearTimeout(timer);
    timer = undefined;
    start = undefined;
  };

  return {
    onPointerDown: (event) => {
      if (event.pointerType === "mouse") {
        return;
      }
      cancel();
      wasTriggered = false;
      start = { x: event.clientX, y: event.clientY };
      timer = setTimeout(() => {
        wasTriggered = true;
        start = undefined;
        swallowNextClick();
        onLongPress();
      }, LONG_PRESS_MS);
    },
    onPointerMove: (event) => {
      if (!start) {
        return;
      }
      const distance = Math.hypot(event.clientX - start.x, event.clientY - start.y);
      if (distance > MOVE_TOLERANCE_PX) {
        cancel();
      }
    },
    onPointerUp: cancel,
    onPointerCancel: cancel,
    onPointerLeave: cancel,
    onClick: (event) => {
      if (!wasTriggered) {
        return;
      }
      wasTriggered = false;
      event.preventDefault();
      event.stopPropagation();
    },
    onContextMenu: (event) => {
      if (timer !== undefined || wasTriggered) {
        event.preventDefault();
      }
    },
  };
};
