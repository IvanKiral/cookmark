import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Collection } from "~/shared/collections.ts";
import type { RecipeSummary } from "~/shared/recipe.ts";
import type { ListPage } from "./createListPage.ts";
import { ListContent } from "./ListContent.tsx";

vi.mock("~/app/recipe-list/RecipeList.tsx", () => ({
  RecipeList: (props: { recipes: ReadonlyArray<RecipeSummary> }) => (
    <p>{`list of ${props.recipes.length}`}</p>
  ),
}));

const collection = (overrides: Partial<Collection>): Collection => ({
  id: "c",
  name: "C",
  kind: "manual",
  filters: null,
  pinPosition: null,
  slugs: [],
  ...overrides,
});

type PageOptions = {
  placeCollection?: Collection;
  placeRecipes?: ReadonlyArray<RecipeSummary>;
  pickCollection?: Collection;
  isPreviewingFilter?: boolean;
};

// Only what ListContent reads.
const fakePage = (options: PageOptions) => {
  const startPicking = vi.fn();
  const startEditFilter = vi.fn();
  const page = {
    placeCollection: () => options.placeCollection,
    placeRecipes: () => options.placeRecipes ?? [],
    pickCollection: () => options.pickCollection,
    isPreviewingFilter: () => options.isPreviewingFilter ?? false,
    isDesktop: () => false,
    isReordering: () => false,
    isSelecting: () => false,
    filteredRecipes: () => [],
    viewMode: () => "card",
    params: { page: () => 1, setPage: vi.fn(), resetAll: vi.fn() },
    selection: { start: vi.fn(), isSelected: () => false, toggle: vi.fn() },
    recipes: () => [],
    startPicking,
    startEditFilter,
  } as unknown as ListPage;
  return { page, startPicking, startEditFilter };
};

describe("<ListContent />", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the list outside collections", () => {
    render(() => <ListContent page={fakePage({}).page} />);
    expect(screen.getByText("list of 0")).toBeInTheDocument();
  });

  it("shows the empty card of a manual collection, whose button starts picking", () => {
    const soups = collection({ name: "Soups" });
    const { page, startPicking } = fakePage({ placeCollection: soups });
    render(() => <ListContent page={page} />);
    expect(screen.getByText("No recipes yet")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Add recipes/ }));
    expect(startPicking).toHaveBeenCalledWith(soups);
  });

  it("shows Nothing matches for a smart filter without filters, with Edit filter", () => {
    const quick = collection({ kind: "smart", name: "Quick" });
    const { page, startEditFilter } = fakePage({ placeCollection: quick });
    render(() => <ListContent page={page} />);
    expect(
      screen.getByText("This smart filter has no filters left. Edit it to pick new ones."),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Edit filter/ }));
    expect(startEditFilter).toHaveBeenCalledWith(quick);
  });

  it("shows the list while picking or previewing an edited filter", () => {
    const soups = collection({ name: "Soups" });
    render(() => (
      <ListContent page={fakePage({ placeCollection: soups, pickCollection: soups }).page} />
    ));
    expect(screen.getByText("list of 0")).toBeInTheDocument();
    cleanup();
    render(() => (
      <ListContent page={fakePage({ placeCollection: soups, isPreviewingFilter: true }).page} />
    ));
    expect(screen.getByText("list of 0")).toBeInTheDocument();
  });
});
