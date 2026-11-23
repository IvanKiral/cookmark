import { cleanup, fireEvent, render, screen, waitFor, within } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RecipeList } from "~/app/recipe-list/RecipeList.tsx";
import type { Collection } from "~/shared/collections.ts";
import type { RecipeSummary } from "~/shared/recipe.ts";
import { CollectionsProvider, useCollections } from "./CollectionsContext.tsx";
import { createSelection, createSelectModeSignal, type SelectMode } from "./createSelection.ts";
import { ListSelection } from "./ListSelection.tsx";

vi.mock("@solidjs/router", () => ({
  useLocation: () => ({ search: "", state: null }),
}));

vi.mock("~/app/marks/MarksContext.tsx", () => ({
  useMarks: () => ({ isMarked: () => false, toggle: () => {} }),
}));

const recipes: ReadonlyArray<RecipeSummary> = Array.from({ length: 14 }, (_, index) => ({
  url_slug: `recipe-${index + 1}`,
  name: `Recipe ${index + 1}`,
  description: "",
  difficulty: "Easy",
  total_time: 30,
  tags: [],
  ingredients: [],
  image_url: "",
  created_at: "2024-01-01T00:00:00.000Z",
}));

const manual = (id: string, name: string, slugs: ReadonlyArray<string>): Collection => ({
  id,
  name,
  kind: "manual",
  filters: null,
  pinPosition: null,
  slugs,
});

const soups = manual("soups", "Soups", ["recipe-1", "recipe-2"]);
const stews = manual("stews", "Stews", []);

const fetchMock = vi.fn((url: string, init?: RequestInit) =>
  Promise.resolve(
    url === "/api/collections" && (init?.method ?? "GET") === "GET"
      ? Response.json({ collections: [soups, stews] })
      : new Response(null, { status: 204 }),
  ),
);

const renderSelectMode = (options: { place?: Collection; mode?: SelectMode } = {}) => {
  const Harness = () => {
    const collectionsContext = useCollections();
    const selection = createSelection(
      () => recipes,
      createSelectModeSignal(options.mode ?? { kind: "select" }),
    );
    return (
      <>
        <ListSelection
          selection={selection}
          placeCollection={
            options.place
              ? collectionsContext.collections().find((item) => item.id === options.place?.id)
              : undefined
          }
          viewCount={recipes.length}
          librarySlugs={new Set(recipes.map((recipe) => recipe.url_slug))}
        />
        <RecipeList
          recipes={recipes}
          currentPage={1}
          viewMode="card"
          onPageChange={vi.fn()}
          selection={{ isSelected: selection.isSelected, onToggle: selection.toggle }}
        />
      </>
    );
  };
  render(() => (
    <CollectionsProvider>
      <Harness />
    </CollectionsProvider>
  ));
};

const jsonBody = (slugs: ReadonlyArray<string>): RequestInit => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ slugs }),
});

describe("select mode", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("scrollTo", vi.fn());
    vi.stubGlobal("matchMedia", () => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("turns cards into toggles and counts the selection", () => {
    renderSelectMode();
    expect(screen.getByText("Select recipes")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    const first = screen.getByRole("button", { name: "Select Recipe 1" });
    fireEvent.click(first);
    expect(first).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("1 selected")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add 1 to collection" })).toBeEnabled();
  });

  it("disables the actions with nothing selected", () => {
    renderSelectMode();
    expect(screen.getByRole("button", { name: "Add to collection" })).toBeDisabled();
  });

  it("selects every recipe across pages and marks the pages holding them", () => {
    renderSelectMode();
    fireEvent.click(screen.getByRole("button", { name: "Select all" }));
    expect(screen.getByText("14 selected")).toBeInTheDocument();
    const pageTwo = screen.getByRole("button", { name: "Go to page 2" });
    expect(pageTwo.className).toMatch(/marked/);

    fireEvent.click(screen.getByRole("button", { name: "Select none" }));
    expect(screen.getByText("Select recipes")).toBeInTheDocument();
    expect(pageTwo.className).not.toMatch(/marked/);
  });

  it("adds the selection to the chosen collections and clears it", async () => {
    renderSelectMode();
    fireEvent.click(screen.getByRole("button", { name: "Select Recipe 3" }));
    fireEvent.click(screen.getByRole("button", { name: "Select Recipe 4" }));
    fireEvent.click(screen.getByRole("button", { name: "Add 2 to collection" }));

    const sheet = await screen.findByRole("dialog");
    const stewsBox = await within(sheet).findByRole("checkbox", { name: /Stews/ });
    expect(within(sheet).getByRole("button", { name: "Add" })).toBeDisabled();
    fireEvent.click(stewsBox);
    fireEvent.click(within(sheet).getByRole("button", { name: "Add" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/collections/stews/recipes",
        jsonBody(["recipe-3", "recipe-4"]),
      ),
    );
    await waitFor(() => expect(screen.getByText("Select recipes")).toBeInTheDocument());
  });

  it("removes the selection from the open manual collection, which the add list leaves out", async () => {
    renderSelectMode({ place: soups });
    expect(
      await screen.findByText("In Soups. Remove them, or add them to another collection."),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Select Recipe 1" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove" }));
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith("/api/collections/soups/recipes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugs: ["recipe-1"] }),
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Select Recipe 2" }));
    fireEvent.click(screen.getByRole("button", { name: "Add 1 to collection" }));
    const sheet = await screen.findByRole("dialog");
    await within(sheet).findByRole("checkbox", { name: /Stews/ });
    expect(within(sheet).queryByRole("checkbox", { name: /Soups/ })).not.toBeInTheDocument();
  });

  it("adds picked recipes to the collection being filled", async () => {
    renderSelectMode({ place: stews, mode: { kind: "pick", collectionId: "stews" } });
    expect(
      await screen.findByText("Adding to Stews. Recipes already in it are hidden."),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Select Recipe 5" }));
    fireEvent.click(screen.getByRole("button", { name: "Add 1 to Stews" }));
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/collections/stews/recipes",
        jsonBody(["recipe-5"]),
      ),
    );
  });

  it("disables Select all when the view is empty", () => {
    render(() => (
      <CollectionsProvider>
        <ListSelection
          selection={createSelection(() => [], createSelectModeSignal({ kind: "select" }))}
          placeCollection={undefined}
          viewCount={0}
          librarySlugs={new Set()}
        />
      </CollectionsProvider>
    ));
    expect(screen.getByRole("button", { name: "Select all" })).toBeDisabled();
  });

  it("unselects recipes that leave the view, and they stay unselected when they return", async () => {
    const holder: { setView?: (next: ReadonlyArray<RecipeSummary>) => void } = {};
    const Harness = () => {
      const [view, setView] = createSignal<ReadonlyArray<RecipeSummary>>(recipes);
      holder.setView = setView;
      const selection = createSelection(view, createSelectModeSignal({ kind: "select" }));
      return (
        <ListSelection
          selection={selection}
          placeCollection={undefined}
          viewCount={view().length}
          librarySlugs={new Set()}
        />
      );
    };
    render(() => (
      <CollectionsProvider>
        <Harness />
      </CollectionsProvider>
    ));
    fireEvent.click(screen.getByRole("button", { name: "Select all" }));
    expect(screen.getByText("14 selected")).toBeInTheDocument();

    holder.setView?.(recipes.slice(0, 2));
    await waitFor(() => expect(screen.getByText("2 selected")).toBeInTheDocument());
    holder.setView?.(recipes);
    await waitFor(() => expect(screen.getByText("2 selected")).toBeInTheDocument());
  });
});
