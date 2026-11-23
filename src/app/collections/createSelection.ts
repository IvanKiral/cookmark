import { type Accessor, createEffect, createSignal, type Signal } from "solid-js";
import type { RecipeSummary } from "~/shared/recipe.ts";

// "select" picks from the current view; "pick" adds library recipes to one collection.
export type SelectMode = { kind: "select" } | { kind: "pick"; collectionId: string };

export type Selection = {
  mode: Accessor<SelectMode | undefined>;
  // Only recipes still in the view, in view order: search or filter changes unselect the rest.
  selectedSlugs: Accessor<ReadonlyArray<string>>;
  isSelected: (slug: string) => boolean;
  toggle: (slug: string) => void;
  isAllSelected: Accessor<boolean>;
  // Every recipe of the view, across pages.
  selectAll: () => void;
  selectNone: () => void;
  start: (mode: SelectMode, slug?: string) => void;
  stop: () => void;
};

// The mode signal comes from the caller, because the view usually depends on it
// (pick mode shows other recipes) and must exist before the selection does.
export const createSelectModeSignal = (initialMode?: SelectMode): Signal<SelectMode | undefined> =>
  createSignal<SelectMode | undefined>(initialMode);

export const createSelection = (
  view: Accessor<ReadonlyArray<RecipeSummary>>,
  [mode, setMode]: Signal<SelectMode | undefined>,
): Selection => {
  const [chosen, setChosen] = createSignal<ReadonlySet<string>>(new Set());

  // Plain functions, not memos: the view depends on the mode, so it is read lazily.
  const selectedSlugs = (): ReadonlyArray<string> =>
    view()
      .map((recipe) => recipe.url_slug)
      .filter((slug) => chosen().has(slug));

  // Recipes that leave the view (search or filters changed) are unselected for
  // good, so they do not come back selected when the view widens again.
  createEffect(
    () => view().map((recipe) => recipe.url_slug),
    (slugs) => {
      const inView = new Set(slugs);
      const current = chosen();
      if ([...current].some((slug) => !inView.has(slug))) {
        setChosen(new Set([...current].filter((slug) => inView.has(slug))));
      }
    },
  );

  const isInView = (slug: string): boolean => view().some((recipe) => recipe.url_slug === slug);

  const toggle = (slug: string): void => {
    const next = new Set(chosen());
    if (next.has(slug)) {
      next.delete(slug);
    } else {
      next.add(slug);
    }
    setChosen(next);
  };

  return {
    mode,
    selectedSlugs,
    isSelected: (slug) => mode() !== undefined && chosen().has(slug) && isInView(slug),
    toggle,
    isAllSelected: () => view().length > 0 && selectedSlugs().length === view().length,
    selectAll: () => setChosen(new Set(view().map((recipe) => recipe.url_slug))),
    selectNone: () => setChosen(new Set<string>()),
    start: (nextMode, slug) => {
      setMode(nextMode);
      setChosen(new Set(slug ? [slug] : []));
    },
    stop: () => {
      setMode(undefined);
      setChosen(new Set<string>());
    },
  };
};
