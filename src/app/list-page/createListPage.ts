import { type Accessor, createEffect, createMemo, createSignal } from "solid-js";
import { getRecipesList } from "~/app/api/recipeQueries.ts";
import {
  type CollectionsContextValue,
  useCollections,
} from "~/app/collections/CollectionsContext.tsx";
import { canReorderPlace } from "~/app/collections/canReorder.ts";
import { sortByPin } from "~/app/collections/collectionIcons.ts";
import { createNamedCollection } from "~/app/collections/collectionNames.ts";
import {
  type CollectionActions,
  createCollectionActions,
} from "~/app/collections/createCollectionActions.ts";
import {
  createSelection,
  createSelectModeSignal,
  type Selection,
} from "~/app/collections/createSelection.ts";
import {
  createSmartFilterEdit,
  type SmartFilterEdit,
} from "~/app/collections/createSmartFilterEdit.ts";
import {
  findPlaceCollection,
  type Place,
  parsePlaceParam,
  recipesInPlace,
  serializePlace,
} from "~/app/collections/places.ts";
import { placeMetaOf, placeSubtitleOf, placeTitleOf } from "~/app/collections/placeText.ts";
import { collectionStrings } from "~/app/collections/strings.ts";
import {
  type AuthorOption,
  buildAuthorOptions,
  deriveAuthors,
} from "~/app/filters/deriveAuthors.ts";
import { countActiveFilters, filterRecipes } from "~/app/filters/recipeFilters.ts";
import { createRecipeSearch } from "~/app/filters/recipeSearch.ts";
import { type RecipeListParams, useRecipeListParams } from "~/app/filters/useRecipeListParams.ts";
import { useMarks } from "~/app/marks/MarksContext.tsx";
import { resolveListSort, sortParamFor } from "~/app/recipe-list/listSort.ts";
import { DEFAULT_SORT, type ListSort, YOUR_ORDER } from "~/app/recipe-list/sortOptions.ts";
import { sortRecipes } from "~/app/recipe-list/sortRecipes.ts";
import type { ViewMode } from "~/app/recipe-list/ViewToggle.tsx";
import { createMediaQuery } from "~/app/ui/createMediaQuery.ts";
import { showToast } from "~/app/ui/Toast.tsx";
import type { Collection } from "~/shared/collections.ts";
import type { RecipeSummary } from "~/shared/recipe.ts";

const DESKTOP_QUERY = "(min-width: 1024px)";

// The open/closed state of the page's drawers, panels, sheets and dialogs.
type Toggle = {
  isOpen: Accessor<boolean>;
  setIsOpen: (isOpen: boolean) => void;
};

const createToggle = (): Toggle => {
  const [isOpen, setIsOpen] = createSignal(false);
  return { isOpen, setIsOpen };
};

export type ListPage = {
  recipes: Accessor<RecipeSummary[]>;
  librarySlugs: Accessor<ReadonlySet<string>>;
  authorOptions: Accessor<ReadonlyArray<AuthorOption>>;
  params: RecipeListParams;
  collectionsContext: CollectionsContextValue;
  collectionActions: CollectionActions;
  isDesktop: Accessor<boolean>;
  viewMode: Accessor<ViewMode>;
  setViewMode: (mode: ViewMode) => void;

  // Places
  place: Accessor<Place>;
  placeCollection: Accessor<Collection | undefined>;
  placeRecipes: Accessor<ReadonlyArray<RecipeSummary>>;
  countOf: (place: Place) => number;
  pinned: Accessor<ReadonlyArray<Collection>>;
  pinnedCount: Accessor<number>;
  // The open collection when it is not pinned (the phone's temporary chip).
  temporaryChip: Accessor<Collection | undefined>;
  selectPlace: (place: Place) => void;
  openCollection: (collection: Collection) => void;
  togglePin: (collection: Collection) => void;
  placeTitle: Accessor<string>;
  placeMeta: Accessor<string>;
  placeSubtitle: Accessor<string>;
  isRenamingPlace: Accessor<boolean>;

  // The list
  isManualPlace: Accessor<boolean>;
  sort: Accessor<ListSort>;
  setSort: (sort: ListSort) => void;
  activeFilterCount: Accessor<number>;
  filteredRecipes: Accessor<ReadonlyArray<RecipeSummary>>;
  // Desktop, while a smart filter is edited: the list previews the draft.
  isPreviewingFilter: Accessor<boolean>;

  // Select mode
  selection: Selection;
  isSelecting: Accessor<boolean>;
  pickCollection: Accessor<Collection | undefined>;
  pickableRecipes: Accessor<ReadonlyArray<RecipeSummary>>;
  startPicking: (collection: Collection) => void;

  // Reorder
  canReorder: Accessor<boolean>;
  isReordering: Accessor<boolean>;
  setIsReordering: (isOn: boolean) => void;

  // Filters and smart filters
  filterDrawer: Toggle;
  filterPanel: Toggle;
  saveDialog: Toggle;
  filterEdit: SmartFilterEdit;
  handleFiltersClick: () => void;
  startEditFilter: (collection: Collection) => void;
  saveSmartFilter: (name: string, isPinned: boolean) => Promise<string | undefined>;
  openNewSmartFilter: () => void;

  // Collections
  collectionsSheet: Toggle;
  newCollectionSheet: Toggle;
  collectionMenu: Toggle;
  createFromSheet: (name: string) => Promise<string | undefined>;
};

// Everything the list page knows and does: the recipes of the open place
// narrowed by search and filters, and the select, reorder and smart filter
// edit modes on top. The page's components read it; the route only puts them together.
export const createListPage = (): ListPage => {
  const recipes = createMemo(() => getRecipesList());
  const authorValues = createMemo(() => deriveAuthors(recipes()));
  const authorOptions = createMemo(() => buildAuthorOptions(recipes()));
  const params = useRecipeListParams(authorValues);
  const marks = useMarks();
  const collectionsContext = useCollections();
  const collections = collectionsContext.collections;
  const isDesktop = createMediaQuery(DESKTOP_QUERY);
  const filterDrawer = createToggle();
  const filterPanel = createToggle();
  const saveDialog = createToggle();
  const collectionsSheet = createToggle();
  const newCollectionSheet = createToggle();
  const collectionMenu = createToggle();
  // Defined below: every place change also leaves select mode and reorder.
  const collectionActions = createCollectionActions({
    openFresh: (param) => openPlaceFresh(param),
  });
  // View mode is intentionally ephemeral: every page load starts in card view.
  const [viewMode, setViewMode] = createSignal<ViewMode>("card");

  const place = createMemo(() => parsePlaceParam(params.placeParam(), collections()));
  const placeCollection = createMemo(() => findPlaceCollection(place(), collections()));

  const recipesOf = (target: Place): ReadonlyArray<RecipeSummary> =>
    recipesInPlace(recipes(), target, marks.isMarked, collections());
  const countOf = (target: Place): number => recipesOf(target).length;

  const selectMode = createSelectModeSignal();
  const isSelecting = (): boolean => selectMode[0]() !== undefined;

  // Pick mode: the library recipes not yet in the collection being filled.
  const pickCollection = createMemo((): Collection | undefined => {
    const mode = selectMode[0]();
    return mode?.kind === "pick"
      ? collections().find((collection) => collection.id === mode.collectionId)
      : undefined;
  });
  const pickableRecipes = createMemo((): ReadonlyArray<RecipeSummary> => {
    const picking = pickCollection();
    return picking ? recipes().filter((recipe) => !picking.slugs.includes(recipe.url_slug)) : [];
  });

  const isManualPlace = (): boolean =>
    placeCollection()?.kind === "manual" && pickCollection() === undefined;

  // Inside a manual collection no sort param means "Your order"; elsewhere the usual default.
  const sort = createMemo((): ListSort => resolveListSort(params.sortParam(), isManualPlace()));
  const setSort = (next: ListSort): void => {
    params.setSortParam(sortParamFor(next, isManualPlace()));
  };

  const search = createMemo(() => createRecipeSearch(recipes()));
  const librarySlugs = createMemo(() => new Set(recipes().map((recipe) => recipe.url_slug)));
  const placeRecipes = createMemo(() => recipesOf(place()));

  const filterEdit = createSmartFilterEdit(recipes, () => {
    filterPanel.setIsOpen(false);
    filterDrawer.setIsOpen(false);
  });
  const isPreviewingFilter = (): boolean => filterEdit.draft() !== undefined && isDesktop();

  const filteredRecipes = createMemo(() => {
    // Desktop previews what the edited smart filter would hold.
    if (isPreviewingFilter()) {
      return sortRecipes(filterEdit.matches(), DEFAULT_SORT);
    }
    const matching = new Set(search()(params.searchQuery()).map((recipe) => recipe.url_slug));
    const base = pickCollection() ? pickableRecipes() : placeRecipes();
    const inPlace = base.filter((recipe) => matching.has(recipe.url_slug));
    const filtered = filterRecipes(inPlace, params.filters());
    const currentSort = sort();
    return currentSort === YOUR_ORDER ? filtered : sortRecipes(filtered, currentSort);
  });

  const selection = createSelection(() => filteredRecipes(), selectMode);

  const pinnedCount = (): number =>
    collections().filter((collection) => collection.pinPosition !== null).length;

  const isRenamingPlace = (): boolean => {
    const collection = placeCollection();
    return collection !== undefined && collectionActions.isRenaming(collection, "title");
  };

  const activeFilterCount = createMemo(() => countActiveFilters(params.filters()));

  const pinned = createMemo(() => sortByPin(collections()));
  const temporaryChip = createMemo(() => {
    const collection = placeCollection();
    return collection && collection.pinPosition === null ? collection : undefined;
  });

  const [isReorderOn, setIsReordering] = createSignal(false);

  const leaveModes = (): void => {
    selection.stop();
    setIsReordering(false);
  };

  const selectPlace = (next: Place): void => {
    leaveModes();
    params.setPlace(serializePlace(next));
  };

  // Opens a place with no filters or search (a new collection or smart filter,
  // or All after a delete).
  const openPlaceFresh = (param: string | undefined): void => {
    leaveModes();
    params.openPlaceFresh(param);
  };

  // Only a manual collection with more than one recipe, no filters or search,
  // in its own order.
  const canReorder = (): boolean =>
    canReorderPlace({
      isManualCollection: isManualPlace(),
      isSelecting: isSelecting(),
      activeFilterCount: activeFilterCount(),
      searchQuery: params.searchQuery(),
      sort: sort(),
      recipeCount: placeRecipes().length,
    });

  const isReordering = (): boolean => isReorderOn() && canReorder();

  // Reorder ends as soon as it is no longer possible, so it never reopens by itself.
  createEffect(canReorder, (isPossible) => {
    if (!isPossible) {
      setIsReordering(false);
    }
  });

  // Desktop: Esc leaves select mode (dialogs handle their own Esc first).
  createEffect(isSelecting, (isOn) => {
    if (!isOn) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape" && !event.defaultPrevented && isDesktop()) {
        selection.stop();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  });

  const startEditFilter = (collection: Collection): void => {
    filterEdit.start(collection);
    if (isDesktop()) {
      filterPanel.setIsOpen(true);
      return;
    }
    filterDrawer.setIsOpen(true);
  };

  const saveSmartFilter = async (name: string, isPinned: boolean): Promise<string | undefined> => {
    const created = await createNamedCollection(collectionsContext, {
      name,
      kind: "smart",
      filters: params.filters(),
      isPinned,
    });
    if (typeof created === "string") {
      return created;
    }
    saveDialog.setIsOpen(false);
    filterDrawer.setIsOpen(false);
    filterPanel.setIsOpen(false);
    openPlaceFresh(created.id);
    showToast(collectionStrings.smart.saved(created.name));
    return undefined;
  };

  return {
    recipes,
    librarySlugs,
    authorOptions,
    params,
    collectionsContext,
    collectionActions,
    isDesktop,
    viewMode,
    setViewMode,
    place,
    placeCollection,
    placeRecipes,
    countOf,
    pinned,
    pinnedCount,
    temporaryChip,
    selectPlace,
    openCollection: (collection) => {
      collectionsSheet.setIsOpen(false);
      selectPlace({ kind: "collection", id: collection.id });
    },
    togglePin: (collection) => {
      const shouldPin = collection.pinPosition === null;
      collectionsContext.update(collection.id, {
        name: collection.name,
        filters: collection.filters,
        isPinned: shouldPin,
      });
    },
    placeTitle: () => placeTitleOf(place(), placeCollection(), pickCollection()),
    placeMeta: () => placeMetaOf(placeCollection(), filteredRecipes().length),
    placeSubtitle: () =>
      placeSubtitleOf({
        collection: placeCollection(),
        count: filteredRecipes().length,
        pickableCount: pickCollection() ? pickableRecipes().length : undefined,
        isRenaming: isRenamingPlace(),
      }),
    isRenamingPlace,
    isManualPlace,
    sort,
    setSort,
    activeFilterCount,
    filteredRecipes,
    isPreviewingFilter,
    selection,
    isSelecting,
    pickCollection,
    pickableRecipes,
    startPicking: (collection) => {
      selection.start({ kind: "pick", collectionId: collection.id });
    },
    canReorder,
    isReordering,
    setIsReordering,
    filterDrawer,
    filterPanel,
    saveDialog,
    filterEdit,
    handleFiltersClick: () => {
      if (filterEdit.draft()) {
        filterEdit.end();
        return;
      }
      if (isDesktop()) {
        filterPanel.setIsOpen(!filterPanel.isOpen());
        return;
      }
      filterDrawer.setIsOpen(true);
    },
    startEditFilter,
    saveSmartFilter,
    openNewSmartFilter: () => {
      collectionsSheet.setIsOpen(false);
      filterDrawer.setIsOpen(true);
    },
    collectionsSheet,
    newCollectionSheet,
    collectionMenu,
    createFromSheet: async (name) => {
      const error = await collectionActions.create(name);
      if (!error) {
        newCollectionSheet.setIsOpen(false);
      }
      return error;
    },
  };
};
