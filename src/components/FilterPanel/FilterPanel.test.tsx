import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { afterEach, describe, expect, it, vi } from "vitest";
import FilterPanel from "./FilterPanel.tsx";

const renderPanel = (overrides: Partial<Parameters<typeof FilterPanel>[0]> = {}) =>
  render(() => (
    <FilterPanel
      difficultyFilter={[]}
      timeFilter={[]}
      tagFilter={[]}
      authorFilter={[]}
      authorOptions={[{ value: "ana", label: "@ana" }]}
      markFilter={[]}
      recommendedFilter={[]}
      onDifficultyChange={vi.fn()}
      onTimeChange={vi.fn()}
      onTagChange={vi.fn()}
      onAuthorChange={vi.fn()}
      onMarkChange={vi.fn()}
      onRecommendedChange={vi.fn()}
      {...overrides}
    />
  ));

const readSections = (container: HTMLElement) =>
  [...container.querySelectorAll("details")].map((section) => ({
    title: section.querySelector("summary span")?.textContent,
    isOpen: section.open,
    count: section.querySelector("summary span + span:not([aria-hidden])")?.textContent,
  }));

describe("<FilterPanel />", () => {
  afterEach(() => {
    cleanup();
  });

  it("lists time third from last, then difficulty and author, all expanded", () => {
    const { container } = renderPanel();

    expect(readSections(container).map((section) => section.title)).toEqual([
      "My recipes",
      "Recommended",
      "Meal",
      "Protein",
      "Type",
      "Method",
      "Diet",
      "Time",
      "Difficulty",
      "Author",
    ]);
    expect(readSections(container).every((section) => section.isOpen)).toBe(true);
  });

  it("collapses and expands a section from its heading", () => {
    const { container } = renderPanel();
    const meal = [...container.querySelectorAll("details")].find((section) =>
      section.querySelector("summary")?.textContent?.includes("Meal"),
    );

    meal?.querySelector("summary")?.click();
    expect(meal?.open).toBe(false);
    meal?.querySelector("summary")?.click();
    expect(meal?.open).toBe(true);
  });

  it("shows how many options each section has selected", () => {
    const { container } = renderPanel({
      tagFilter: ["Dinner", "Snack", "Beef"],
      timeFilter: ["under30"],
    });

    const counts = Object.fromEntries(
      readSections(container).map((section) => [section.title, section.count]),
    );
    expect(counts).toMatchObject({ Meal: "2", Protein: "1", Time: "1", Diet: undefined });
  });

  it("shows options as chips in the drawer layout, still grouped by section", () => {
    const onTagChange = vi.fn();
    const { container } = renderPanel({ layout: "chips", tagFilter: ["Beef"], onTagChange });

    expect(readSections(container).map((section) => section.title)).toContain("Meal");
    const beef = screen.getByRole("checkbox", { name: "Beef" });
    expect(beef).toBeChecked();
    expect(beef.closest("label")?.className).toMatch(/chipSelected/);
    expect(screen.getByRole("checkbox", { name: "Pork" }).closest("label")?.className).toMatch(
      /chip/,
    );

    fireEvent.click(screen.getByRole("checkbox", { name: "Dinner" }));
    expect(onTagChange).toHaveBeenCalledWith(["Beef", "Dinner"]);
  });

  it("keeps authors as a list that scrolls on its own only in the sidebar", () => {
    const { container: sidebar } = renderPanel();
    const author = (root: HTMLElement) =>
      screen.getAllByRole("checkbox", { name: "@ana" }).find((box) => root.contains(box));
    expect(author(sidebar)?.closest("label")?.parentElement?.className).toMatch(/scrollableGroup/);
    cleanup();

    const { container: drawer } = renderPanel({ layout: "chips" });
    expect(author(drawer)?.closest("label")?.parentElement?.className).not.toMatch(
      /scrollableGroup/,
    );
  });

  it("shows the first five authors in the drawer and expands to all", () => {
    const authorOptions = Array.from({ length: 8 }, (_, i) => ({
      value: `cook${i + 1}`,
      label: `@cook${i + 1}`,
    }));
    renderPanel({ layout: "chips", authorOptions, authorFilter: ["cook7"] });

    const authorBoxes = () => screen.getAllByRole("checkbox", { name: /^@cook/ });
    // The selected author always shows, first, plus the next four.
    expect(authorBoxes().map((box) => box.closest("label")?.textContent)).toEqual([
      "@cook7",
      "@cook1",
      "@cook2",
      "@cook3",
      "@cook4",
    ]);

    fireEvent.click(screen.getByRole("button", { name: "Show all 8 authors" }));
    expect(authorBoxes()).toHaveLength(8);
    fireEvent.click(screen.getByRole("button", { name: "Show fewer" }));
    expect(authorBoxes()).toHaveLength(5);
  });

  it("shows every matching author while searching", () => {
    const authorOptions = Array.from({ length: 8 }, (_, i) => ({
      value: `cook${i + 1}`,
      label: `@cook${i + 1}`,
    }));
    renderPanel({ layout: "chips", authorOptions });

    fireEvent.input(screen.getByRole("searchbox"), { target: { value: "cook" } });

    expect(screen.getAllByRole("checkbox", { name: /^@cook/ })).toHaveLength(8);
    expect(screen.queryByRole("button", { name: /Show all/ })).not.toBeInTheDocument();
  });
});
