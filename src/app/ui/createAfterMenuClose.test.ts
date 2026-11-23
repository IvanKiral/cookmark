import { describe, expect, it, vi } from "vitest";
import { createAfterMenuClose } from "./createAfterMenuClose.ts";

const closeEvent = (): Event => ({ preventDefault: vi.fn() }) as unknown as Event;

describe("createAfterMenuClose", () => {
  it("runs a scheduled action once, instead of the focus return", () => {
    const afterClose = createAfterMenuClose();
    const action = vi.fn();
    afterClose.schedule(action);
    const event = closeEvent();
    afterClose.onCloseAutoFocus(event);
    expect(action).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).toHaveBeenCalled();

    const next = closeEvent();
    afterClose.onCloseAutoFocus(next);
    expect(action).toHaveBeenCalledTimes(1);
    expect(next.preventDefault).not.toHaveBeenCalled();
  });
});
