export type AfterMenuClose = {
  // Runs `action` once the menu has closed, instead of returning focus to its trigger.
  schedule: (action: () => void) => void;
  // For the menu content's onCloseAutoFocus.
  onCloseAutoFocus: (event: Event) => void;
};

// A Kobalte menu returns focus to its trigger after closing. A menu item that
// opens something focused (an inline input, a popover) schedules it here, so it
// starts after that and keeps the focus.
export const createAfterMenuClose = (): AfterMenuClose => {
  const pending: { action?: () => void } = {};

  return {
    schedule: (action) => {
      pending.action = action;
    },
    onCloseAutoFocus: (event) => {
      const action = pending.action;
      if (!action) {
        return;
      }
      pending.action = undefined;
      event.preventDefault();
      action();
    },
  };
};
