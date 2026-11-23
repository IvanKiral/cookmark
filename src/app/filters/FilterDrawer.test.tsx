import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FilterDrawer } from "./FilterDrawer.tsx";
import { emptyFilters } from "./recipeFilters.ts";

const renderDrawer = (overrides: Partial<Parameters<typeof FilterDrawer>[0]> = {}) => {
  const onOpenChange = vi.fn();
  const onClearAll = vi.fn();
  render(() => (
    <FilterDrawer
      open
      onOpenChange={onOpenChange}
      filters={emptyFilters}
      authorOptions={[]}
      onFilterChange={vi.fn()}
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

    const { onClearAll } = renderDrawer({ filters: { ...emptyFilters, tag: ["Soup"] } });
    fireEvent.click(screen.getByRole("button", { name: "Clear all" }));
    expect(onClearAll).toHaveBeenCalled();
  });
  it("closes on Escape", () => {
    const { onOpenChange } = renderDrawer();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
  it("closes on a click outside the drawer", () => {
    const { onOpenChange } = renderDrawer();

    const overlay = document.querySelector('[class*="overlay"]');
    if (!overlay) {
      throw new Error("overlay not found");
    }
    fireEvent.click(overlay);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("uses the title, subtitle and extra footer action it is given", () => {
    renderDrawer({
      title: "Edit “Soups”",
      subtitle: "New recipes that match are added on their own.",
      footerAction: <button type="button">Extra</button>,
    });
    expect(screen.getByText("Edit “Soups”")).toBeInTheDocument();
    expect(screen.getByText("New recipes that match are added on their own.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Extra" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Show 12 recipes" })).toBeInTheDocument();
  });

  it("replaces its footer when given one", () => {
    renderDrawer({ footer: <button type="button">Update</button> });
    expect(screen.getByRole("button", { name: "Update" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Show 12 recipes/ })).not.toBeInTheDocument();
  });
});
