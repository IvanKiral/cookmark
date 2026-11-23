// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createLongPress } from "./createLongPress.ts";

const pointer = (type: string, x = 0, y = 0): PointerEvent =>
  ({ pointerType: type, clientX: x, clientY: y }) as PointerEvent;

const click = (): MouseEvent =>
  ({ preventDefault: vi.fn(), stopPropagation: vi.fn() }) as unknown as MouseEvent;

describe("createLongPress", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("fires after 500ms of touch and swallows the click that follows", () => {
    const onLongPress = vi.fn();
    const press = createLongPress(onLongPress);
    press.onPointerDown(pointer("touch"));
    vi.advanceTimersByTime(499);
    expect(onLongPress).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onLongPress).toHaveBeenCalledTimes(1);

    press.onPointerUp();
    const event = click();
    press.onClick(event);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it("swallows the click on whatever element replaced the pressed one", () => {
    const onToggle = vi.fn();
    const button = document.createElement("button");
    button.addEventListener("click", onToggle);
    document.body.append(button);
    const press = createLongPress(vi.fn());
    press.onPointerDown(pointer("touch"));
    vi.advanceTimersByTime(500);
    button.click();
    expect(onToggle).not.toHaveBeenCalled();
    button.click();
    expect(onToggle).toHaveBeenCalledTimes(1);
    button.remove();
  });

  it("lets a short tap through as a normal click", () => {
    const onLongPress = vi.fn();
    const press = createLongPress(onLongPress);
    press.onPointerDown(pointer("touch"));
    vi.advanceTimersByTime(200);
    press.onPointerUp();
    vi.advanceTimersByTime(500);
    const event = click();
    press.onClick(event);
    expect(onLongPress).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it("is cancelled by scrolling and ignores the mouse", () => {
    const onLongPress = vi.fn();
    const press = createLongPress(onLongPress);
    press.onPointerDown(pointer("touch", 0, 0));
    press.onPointerMove(pointer("touch", 0, 20));
    vi.advanceTimersByTime(600);
    press.onPointerDown(pointer("touch"));
    press.onPointerCancel();
    vi.advanceTimersByTime(600);
    press.onPointerDown(pointer("mouse"));
    vi.advanceTimersByTime(600);
    expect(onLongPress).not.toHaveBeenCalled();
  });
});
