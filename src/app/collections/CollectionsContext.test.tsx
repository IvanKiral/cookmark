import { cleanup, render, screen, waitFor } from "@solidjs/testing-library";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Collection } from "~/shared/collections.ts";
import { CollectionChips } from "./CollectionChips.tsx";
import {
  type CollectionsContextValue,
  CollectionsProvider,
  useCollections,
} from "./CollectionsContext.tsx";
import { sortByPin } from "./collectionIcons.ts";
import { parsePlaceParam } from "./places.ts";

const { api, showToast } = vi.hoisted(() => ({
  api: {
    fetchCollections: vi.fn(),
    createCollection: vi.fn(),
    updateCollection: vi.fn(),
    deleteCollection: vi.fn(),
    addCollectionRecipes: vi.fn(),
    removeCollectionRecipes: vi.fn(),
    reorderCollectionRecipes: vi.fn(),
  },
  showToast: vi.fn(),
}));

vi.mock("~/app/api/collectionsApi.ts", () => api);
vi.mock("~/app/ui/Toast.tsx", () => ({ showToast }));

const manual = (id: string, name: string, slugs: ReadonlyArray<string>): Collection => ({
  id,
  name,
  kind: "manual",
  filters: null,
  pinPosition: null,
  slugs,
});

const soups = manual("soups", "Soups", ["a"]);
const stews = manual("stews", "Stews", []);

const ok = { isOk: true } as const;
const failure = (status: number, error?: string) => ({ isOk: false, status, error });

// Renders the provider and hands its value to the test.
const renderProvider = async (): Promise<CollectionsContextValue> => {
  const holder: { value?: CollectionsContextValue } = {};
  const Capture = () => {
    holder.value = useCollections();
    return null;
  };
  render(() => (
    <CollectionsProvider>
      <Capture />
    </CollectionsProvider>
  ));
  await waitFor(() => expect(api.fetchCollections).toHaveBeenCalled());
  const value = holder.value;
  if (!value) {
    throw new Error("The provider did not render");
  }
  await waitFor(() => expect(value.collections().length).toBeGreaterThan(0));
  return value;
};

const slugsOf = (context: CollectionsContextValue, id: string): ReadonlyArray<string> | undefined =>
  context.collections().find((collection) => collection.id === id)?.slugs;

describe("CollectionsProvider", () => {
  beforeEach(() => {
    api.fetchCollections.mockResolvedValue([soups, stews]);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("rolls a failed save back and shows the failure toast", async () => {
    const context = await renderProvider();
    api.updateCollection.mockResolvedValue(failure(500));
    const isSaved = await context.update("soups", {
      name: "Broths",
      filters: null,
      isPinned: false,
    });
    expect(isSaved).toBe(false);
    expect(context.collections().map((collection) => collection.name)).toEqual(["Soups", "Stews"]);
    expect(showToast).toHaveBeenCalledWith("Couldn't save. Try again.");
    expect(api.fetchCollections).toHaveBeenCalledTimes(1);
  });

  it("keeps a successful save", async () => {
    const context = await renderProvider();
    api.updateCollection.mockResolvedValue({
      isOk: true,
      collection: { ...soups, name: "Broths" },
    });
    expect(await context.update("soups", { name: "Broths", filters: null, isPinned: false })).toBe(
      true,
    );
    await waitFor(() =>
      expect(context.collections().map((collection) => collection.name)).toEqual([
        "Broths",
        "Stews",
      ]),
    );
    expect(showToast).not.toHaveBeenCalled();
  });

  it("reloads the collections after a 404, since another tab changed them", async () => {
    const context = await renderProvider();
    api.deleteCollection.mockResolvedValue(failure(404));
    api.fetchCollections.mockResolvedValue([stews]);
    expect(await context.remove("soups")).toBe(false);
    expect(api.fetchCollections).toHaveBeenCalledTimes(2);
    await waitFor(() =>
      expect(context.collections().map((collection) => collection.id)).toEqual(["stews"]),
    );
  });

  it("reloads after order-mismatch and rolls the order back", async () => {
    api.fetchCollections.mockResolvedValue([manual("soups", "Soups", ["a", "b"]), stews]);
    const context = await renderProvider();
    api.reorderCollectionRecipes.mockResolvedValue(failure(400, "order-mismatch"));
    expect(await context.reorder("soups", ["b", "a"])).toBe(false);
    expect(showToast).toHaveBeenCalledWith("Couldn't save. Try again.");
    expect(api.fetchCollections).toHaveBeenCalledTimes(2);
    expect(slugsOf(context, "soups")).toEqual(["a", "b"]);
  });

  it("rolls back only the collections whose add failed, with one toast", async () => {
    const context = await renderProvider();
    api.addCollectionRecipes.mockImplementation(async (id: string) =>
      id === "stews" ? failure(500) : ok,
    );
    const saved = await context.addRecipes(["soups", "stews"], ["b"]);
    expect(saved).toEqual(["soups"]);
    expect(slugsOf(context, "soups")).toEqual(["a", "b"]);
    expect(slugsOf(context, "stews")).toEqual([]);
    expect(showToast).toHaveBeenCalledTimes(1);
    expect(api.fetchCollections).toHaveBeenCalledTimes(1);
  });

  it("reloads once when any of several adds hit a deleted collection", async () => {
    const context = await renderProvider();
    api.addCollectionRecipes.mockImplementation(async (id: string) =>
      id === "stews" ? failure(404) : failure(500),
    );
    await context.addRecipes(["soups", "stews"], ["b"]);
    expect(showToast).toHaveBeenCalledTimes(1);
    expect(api.fetchCollections).toHaveBeenCalledTimes(2);
  });
});

describe("a failed collections load", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("leaves no collections, and the list keeps All, Favourites and To try", async () => {
    api.fetchCollections.mockResolvedValue(undefined);
    const holder: { value?: CollectionsContextValue } = {};
    const Chips = () => {
      const context = useCollections();
      holder.value = context;
      return (
        <CollectionChips
          place={parsePlaceParam("soups", context.collections())}
          pinned={sortByPin(context.collections())}
          temporary={undefined}
          onSelectPlace={vi.fn()}
          onOpenSheet={vi.fn()}
        />
      );
    };
    render(() => (
      <CollectionsProvider>
        <Chips />
      </CollectionsProvider>
    ));
    await waitFor(() => expect(api.fetchCollections).toHaveBeenCalled());
    expect(holder.value?.collections()).toEqual([]);
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Favourites" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "To try" })).toBeInTheDocument();
  });
});
