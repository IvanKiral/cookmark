import { cleanup, render, waitFor } from "@solidjs/testing-library";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Collection } from "~/shared/collections.ts";
import type { RecipeSummary } from "~/shared/recipe.ts";
import { CollectionsProvider, useCollections } from "./CollectionsContext.tsx";
import { type CollectionReorder, createCollectionReorder } from "./createCollectionReorder.ts";

const { api, sortable } = vi.hoisted(() => ({
  api: {
    fetchCollections: vi.fn(),
    reorderCollectionRecipes: vi.fn(),
  },
  // What the drag glue was given, so the test can drop without dnd-kit.
  sortable: { onReorder: undefined as ((next: ReadonlyArray<string>) => void) | undefined },
}));

vi.mock("~/app/api/collectionsApi.ts", () => api);
vi.mock("~/app/ui/Toast.tsx", () => ({ showToast: vi.fn() }));
vi.mock("~/app/ui/createSortableList.ts", () => ({
  createSortableList: (_items: unknown, onReorder: (next: ReadonlyArray<string>) => void) => {
    sortable.onReorder = onReorder;
    return { register: vi.fn() };
  },
}));

const recipe = (slug: string): RecipeSummary => ({
  url_slug: slug,
  name: slug,
  description: "",
  difficulty: "Easy",
  total_time: 10,
  tags: [],
  ingredients: [],
  image_url: "",
  created_at: "2024-01-01T00:00:00.000Z",
});

// "gone" left the library; it is not shown but stays in the collection.
const stored: Collection = {
  id: "sunday",
  name: "Sunday",
  kind: "manual",
  filters: null,
  pinPosition: null,
  slugs: ["a", "gone", "b", "c"],
};

describe("createCollectionReorder", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("shows only library recipes and saves the new order plus the missing ones", async () => {
    api.fetchCollections.mockResolvedValue([stored]);
    api.reorderCollectionRecipes.mockResolvedValue({ isOk: true });
    const holder: { reorder?: CollectionReorder } = {};
    const Harness = () => {
      const context = useCollections();
      holder.reorder = createCollectionReorder(
        () => context.collections()[0] ?? stored,
        () => [recipe("a"), recipe("b"), recipe("c")],
      );
      return null;
    };
    render(() => (
      <CollectionsProvider>
        <Harness />
      </CollectionsProvider>
    ));
    await waitFor(() =>
      expect(holder.reorder?.recipes().map((item) => item.url_slug)).toEqual(["a", "b", "c"]),
    );

    sortable.onReorder?.(["c", "a", "b"]);
    await waitFor(() =>
      expect(holder.reorder?.recipes().map((item) => item.url_slug)).toEqual(["c", "a", "b"]),
    );
    await waitFor(() =>
      expect(api.reorderCollectionRecipes).toHaveBeenCalledWith("sunday", ["c", "a", "b", "gone"]),
    );
  });
});
