import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import FilterDrawer from "./FilterDrawer.tsx";

const renderDrawer = (overrides: Partial<Parameters<typeof FilterDrawer>[0]> = {}) => {
  const onOpenChange = vi.fn();
  const onClearAll = vi.fn();
  render(() => (
    <FilterDrawer
      open
      onOpenChange={onOpenChange}
      difficultyFilter={[]}
      timeFilter={[]}
      tagFilter={[]}
      authorFilter={[]}
      authorOptions={[]}
      markFilter={[]}
      recommendedFilter={[]}
      onDifficultyChange={vi.fn()}
      onTimeChange={vi.fn()}
      onTagChange={vi.fn()}
      onAuthorChange={vi.fn()}
      onMarkChange={vi.fn()}
      onRecommendedChange={vi.fn()}
      onClearAll={onClearAll}
      resultCount={12}
      {...overrides}
    />
  ));
  return { onOpenChange, onClearAll };
};

// The drawer library measures itself with ResizeObserver and restores the
// scroll position with scrollTo, neither of which jsdom implements.
// It's created with `new`, so the stub has to be a class.
const FakeResizeObserver = class {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
};

describe("<FilterDrawer />", () => {
  beforeEach(() => {
    vi.stubGlobal("ResizeObserver", FakeResizeObserver);
    vi.stubGlobal("scrollTo", vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("closes from the button that shows how many recipes match", () => {
    const { onOpenChange } = renderDrawer();

    fireEvent.click(screen.getByRole("button", { name: "Show 12 recipes" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("uses the singular for one recipe", () => {
    renderDrawer({ resultCount: 1 });
    expect(screen.getByRole("button", { name: "Show 1 recipe" })).toBeInTheDocument();
  });

  it("offers Clear all only when a filter is active", () => {
    renderDrawer();
    expect(screen.queryByRole("button", { name: "Clear all" })).not.toBeInTheDocument();
    cleanup();

    const { onClearAll } = renderDrawer({ tagFilter: ["Soup"] });
    fireEvent.click(screen.getByRole("button", { name: "Clear all" }));
    expect(onClearAll).toHaveBeenCalled();
  });
});
