import { cleanup, fireEvent, render, screen, within } from "@solidjs/testing-library";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Collection } from "~/shared/collections.ts";
import { CollectionChips } from "./CollectionChips.tsx";
import { CollectionsSheet } from "./CollectionsSheet.tsx";
import { sortByPin } from "./collectionIcons.ts";

const collection = (overrides: Partial<Collection>): Collection => ({
  id: "id",
  name: "Name",
  kind: "manual",
  filters: null,
  pinPosition: null,
  slugs: [],
  ...overrides,
});

const sunday = collection({ id: "sunday", name: "Sunday lunch", pinPosition: 2, slugs: ["a"] });
const quick = collection({
  id: "quick",
  name: "Quick dinners",
  kind: "smart",
  pinPosition: 1,
  filters: { difficulty: [], time: ["under30"], tag: [], author: [], recommended: [] },
});
const soups = collection({ id: "soups", name: "Soups", slugs: ["a", "b"] });
const stews = collection({ id: "stews", name: "Stews" });

describe("<CollectionChips />", () => {
  afterEach(() => {
    cleanup();
  });

  const chipNames = (): ReadonlyArray<string> =>
    within(screen.getByRole("group", { name: "Collections" }))
      .getAllByRole("button")
      .map((button) => button.textContent ?? "");

  it("shows All, the marks, pinned collections in pin order and the Collections chip", () => {
    render(() => (
      <CollectionChips
        place={{ kind: "all" }}
        pinned={sortByPin([sunday, quick, soups])}
        temporary={undefined}
        onSelectPlace={vi.fn()}
        onOpenSheet={vi.fn()}
      />
    ));
    expect(chipNames()).toEqual([
      "All",
      "Favourites",
      "To try",
      "tuneQuick dinners",
      "Sunday lunch",
      "collections_bookmarkCollections",
    ]);
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "true");
  });

  it("shows an open unpinned collection as a selected chip that closes back to All", () => {
    const onSelectPlace = vi.fn();
    render(() => (
      <CollectionChips
        place={{ kind: "collection", id: "soups" }}
        pinned={[]}
        temporary={soups}
        onSelectPlace={onSelectPlace}
        onOpenSheet={vi.fn()}
      />
    ));
    expect(screen.getByText("Soups")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(screen.getByRole("button", { name: "Close Soups" }));
    expect(onSelectPlace).toHaveBeenCalledWith({ kind: "all" });
  });

  it("selects a place and opens the sheet", () => {
    const onSelectPlace = vi.fn();
    const onOpenSheet = vi.fn();
    render(() => (
      <CollectionChips
        place={{ kind: "all" }}
        pinned={[sunday]}
        temporary={undefined}
        onSelectPlace={onSelectPlace}
        onOpenSheet={onOpenSheet}
      />
    ));
    fireEvent.click(screen.getByRole("button", { name: "To try" }));
    expect(onSelectPlace).toHaveBeenCalledWith({ kind: "mark", mark: "to-try" });
    fireEvent.click(screen.getByRole("button", { name: "Sunday lunch" }));
    expect(onSelectPlace).toHaveBeenCalledWith({ kind: "collection", id: "sunday" });
    fireEvent.click(screen.getByRole("button", { name: /Collections/ }));
    expect(onOpenSheet).toHaveBeenCalled();
  });
});

describe("<CollectionsSheet />", () => {
  beforeEach(() => {
    // Kobalte's dialog restores the scroll position on close.
    vi.stubGlobal("scrollTo", vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  const renderSheet = (
    collections: ReadonlyArray<Collection>,
    handlers: { onTogglePin?: () => void; onOpenCollection?: () => void } = {},
  ) =>
    render(() => (
      <CollectionsSheet
        isOpen
        onOpenChange={vi.fn()}
        collections={collections}
        countOf={(item) => item.slugs.length}
        onOpenCollection={handlers.onOpenCollection ?? vi.fn()}
        onTogglePin={handlers.onTogglePin ?? vi.fn()}
        onNewCollection={vi.fn()}
        onNewSmartFilter={vi.fn()}
      />
    ));

  it("lists collections with counts and filters them by name", async () => {
    renderSheet([quick, soups, sunday]);
    expect(await screen.findByText("Smart filter, 0 recipes")).toBeInTheDocument();
    expect(screen.getByText("2 recipes")).toBeInTheDocument();
    expect(screen.getByText("2 of 3 pinned to the top bar")).toBeInTheDocument();

    fireEvent.input(screen.getByRole("searchbox", { name: "Search collections" }), {
      target: { value: "SOU" },
    });
    expect(screen.getByText("Soups")).toBeInTheDocument();
    expect(screen.queryByText("Sunday lunch")).not.toBeInTheDocument();
  });

  it("pins and unpins, and disables pinning once three are pinned", async () => {
    const onTogglePin = vi.fn();
    const third = collection({ id: "third", name: "Third", pinPosition: 3 });
    renderSheet([quick, soups, sunday, third, stews], { onTogglePin });

    expect(await screen.findByText("Top bar is full, unpin another first")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pin Soups" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Pin Stews" })).toBeDisabled();
    const unpin = screen.getByRole("button", { name: "Unpin Sunday lunch" });
    expect(unpin).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(unpin);
    expect(onTogglePin).toHaveBeenCalledWith(sunday);
  });

  it("opens a collection from its row", async () => {
    const onOpenCollection = vi.fn();
    renderSheet([soups], { onOpenCollection });
    fireEvent.click(await screen.findByRole("button", { name: /^Soups/ }));
    expect(onOpenCollection).toHaveBeenCalledWith(soups);
  });
});
