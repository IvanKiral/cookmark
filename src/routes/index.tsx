import type { JSX } from "@solidjs/web";
import { createEffect, createMemo, createSignal, Loading, lazy, Show } from "solid-js";
import { getRecipesList } from "~/app/api/recipeQueries.ts";
import { CollectionChips } from "~/app/collections/CollectionChips.tsx";
import { CollectionHeaderCard } from "~/app/collections/CollectionHeaderCard.tsx";
import { CollectionMenu } from "~/app/collections/CollectionMenu.tsx";
import { CollectionMenuSheet } from "~/app/collections/CollectionMenuSheet.tsx";
import { useCollections } from "~/app/collections/CollectionsContext.tsx";
import { CollectionsSheet } from "~/app/collections/CollectionsSheet.tsx";
import { canReorderPlace } from "~/app/collections/canReorder.ts";
import { sortByPin } from "~/app/collections/collectionIcons.ts";
import { createNamedCollection } from "~/app/collections/collectionNames.ts";
import { createCollectionActions } from "~/app/collections/createCollectionActions.ts";
import { createSelection, createSelectModeSignal } from "~/app/collections/createSelection.ts";
import { createSmartFilterEdit } from "~/app/collections/createSmartFilterEdit.ts";
import { EditFilterFooter } from "~/app/collections/EditFilterFooter.tsx";
import { InlineNameInput } from "~/app/collections/InlineNameInput.tsx";
import { LibrarySidebar } from "~/app/collections/LibrarySidebar.tsx";
import { ListSelection } from "~/app/collections/ListSelection.tsx";
import { NewCollectionSheet } from "~/app/collections/NewCollectionSheet.tsx";
import { PlaceActions } from "~/app/collections/PlaceActions.tsx";
import { PlaceEmptyState } from "~/app/collections/PlaceEmptyState.tsx";
import {
  describeSmartFilters,
  findPlaceCollection,
  type Place,
  parsePlaceParam,
  recipesInPlace,
  serializePlace,
} from "~/app/collections/places.ts";
import { SaveSmartFilterButton } from "~/app/collections/SaveSmartFilterButton.tsx";
import { SaveSmartFilterDialog } from "~/app/collections/SaveSmartFilterDialog.tsx";
import { collectionStrings } from "~/app/collections/strings.ts";
import { ActiveFilterChips } from "~/app/filters/ActiveFilterChips.tsx";
import { withoutFilterValue } from "~/app/filters/activeFilters.ts";
import { buildAuthorOptions, deriveAuthors } from "~/app/filters/deriveAuthors.ts";
import { FilterDrawer } from "~/app/filters/FilterDrawer.tsx";
import { FilterPanel } from "~/app/filters/FilterPanel.tsx";
import { countActiveFilters, filterRecipes } from "~/app/filters/recipeFilters.ts";
import { createRecipeSearch } from "~/app/filters/recipeSearch.ts";
import { SearchBar } from "~/app/filters/SearchBar.tsx";
import { filterStrings } from "~/app/filters/strings.ts";
import { useRecipeListParams } from "~/app/filters/useRecipeListParams.ts";
import { useMarks } from "~/app/marks/MarksContext.tsx";
import {
  defaultListSort,
  listSortOptions,
  resolveListSort,
  sortParamFor,
} from "~/app/recipe-list/listSort.ts";
import { RecipeList } from "~/app/recipe-list/RecipeList.tsx";
import { SortDropdown } from "~/app/recipe-list/SortDropdown.tsx";
import { DEFAULT_SORT, type ListSort, YOUR_ORDER } from "~/app/recipe-list/sortOptions.ts";
import { sortRecipes } from "~/app/recipe-list/sortRecipes.ts";
import { recipeListStrings } from "~/app/recipe-list/strings.ts";
import { type ViewMode, ViewToggle } from "~/app/recipe-list/ViewToggle.tsx";
import { ariaBoolean } from "~/app/ui/ariaBoolean.ts";
import buttonStyles from "~/app/ui/button.module.css";
import { ConfirmDialog } from "~/app/ui/ConfirmDialog.tsx";
import { createMediaQuery } from "~/app/ui/createMediaQuery.ts";
import { showToast } from "~/app/ui/Toast.tsx";
import type { Collection } from "~/shared/collections.ts";
import { MAX_PINS } from "~/shared/collections.ts";
import type { RecipeSummary } from "~/shared/recipe.ts";
import styles from "./index.module.css";

const DESKTOP_QUERY = "(min-width: 1024px)";

// Loaded only when reordering starts, so dnd-kit stays out of the list's bundle.
const CollectionReorderView = lazy(() => import("~/app/collections/CollectionReorderView.tsx"), {
  export: "CollectionReorderView",
});
const ReorderGrid = lazy(() => import("~/app/collections/ReorderGrid.tsx"), {
  export: "ReorderGrid",
});

const Home = () => {
  const recipes = createMemo(() => getRecipesList());
  const authorValues = createMemo(() => deriveAuthors(recipes()));
  const authorOptions = createMemo(() => buildAuthorOptions(recipes()));
  const params = useRecipeListParams(authorValues);
  const marks = useMarks();
  const collectionsContext = useCollections();
  const collections = collectionsContext.collections;
  const isDesktop = createMediaQuery(DESKTOP_QUERY);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = createSignal(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = createSignal(false);
  const [isCollectionsSheetOpen, setIsCollectionsSheetOpen] = createSignal(false);
  const [isNewCollectionOpen, setIsNewCollectionOpen] = createSignal(false);
  const [isCollectionMenuOpen, setIsCollectionMenuOpen] = createSignal(false);
  const [isCreatingInSidebar, setIsCreatingInSidebar] = createSignal(false);
  const [sidebarCreateError, setSidebarCreateError] = createSignal<string | undefined>(undefined);
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
  const countOfCollection = (collection: Collection): number =>
    countOf({ kind: "collection", id: collection.id });

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

  const [isSaveDialogOpen, setIsSaveDialogOpen] = createSignal(false);
  const filterEdit = createSmartFilterEdit(recipes, () => {
    setIsFilterPanelOpen(false);
    setIsFilterDrawerOpen(false);
  });

  const filteredRecipes = createMemo(() => {
    // Desktop previews what the edited smart filter would hold.
    if (filterEdit.draft() && isDesktop()) {
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

  const createFromSheet = async (name: string): Promise<string | undefined> => {
    const error = await collectionActions.create(name);
    if (!error) {
      setIsNewCollectionOpen(false);
    }
    return error;
  };

  const createFromSidebar = async (name: string): Promise<boolean> => {
    const error = await collectionActions.create(name);
    setSidebarCreateError(error);
    if (!error) {
      setIsCreatingInSidebar(false);
    }
    return !error;
  };

  const cancelSidebarCreate = (): void => {
    setIsCreatingInSidebar(false);
    setSidebarCreateError(undefined);
  };

  const activeFilterCount = createMemo(() => countActiveFilters(params.filters()));

  const pinned = createMemo(() => sortByPin(collections()));
  const temporaryChip = createMemo(() => {
    const collection = placeCollection();
    return collection && collection.pinPosition === null ? collection : undefined;
  });

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

  const [isReorderOn, setIsReordering] = createSignal(false);

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

  const startPicking = (collection: Collection): void => {
    selection.start({ kind: "pick", collectionId: collection.id });
  };

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

  const openCollection = (collection: Collection): void => {
    setIsCollectionsSheetOpen(false);
    selectPlace({ kind: "collection", id: collection.id });
  };

  const togglePin = (collection: Collection): void => {
    const shouldPin = collection.pinPosition === null;
    collectionsContext.update(collection.id, {
      name: collection.name,
      filters: collection.filters,
      isPinned: shouldPin,
    });
  };

  const startEditFilter = (collection: Collection): void => {
    filterEdit.start(collection);
    if (isDesktop()) {
      setIsFilterPanelOpen(true);
      return;
    }
    setIsFilterDrawerOpen(true);
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
    setIsSaveDialogOpen(false);
    setIsFilterDrawerOpen(false);
    setIsFilterPanelOpen(false);
    openPlaceFresh(created.id);
    showToast(collectionStrings.smart.saved(created.name));
    return undefined;
  };

  const handleFiltersClick = (): void => {
    if (filterEdit.draft()) {
      filterEdit.end();
      return;
    }
    if (isDesktop()) {
      setIsFilterPanelOpen(!isFilterPanelOpen());
      return;
    }
    setIsFilterDrawerOpen(true);
  };

  const openNewSmartFilter = (): void => {
    setIsCollectionsSheetOpen(false);
    setIsFilterDrawerOpen(true);
  };

  const placeTitle = (): string => {
    const picking = pickCollection();
    if (picking) {
      return collectionStrings.select.pickTitle(picking.name);
    }
    const current = place();
    if (current.kind === "all") {
      return collectionStrings.places.allRecipes;
    }
    if (current.kind === "mark") {
      return current.mark === "favorite"
        ? collectionStrings.places.favorites
        : collectionStrings.places.toTry;
    }
    return placeCollection()?.name ?? "";
  };

  const placeSubtitle = (): string => {
    if (pickCollection()) {
      return collectionStrings.select.pickSubtitle(pickableRecipes().length);
    }
    return isRenamingPlace() ? collectionStrings.header.renameHint : placeMeta();
  };

  const placeMeta = (): string => {
    const count = filteredRecipes().length;
    const collection = placeCollection();
    if (collection?.kind === "manual") {
      return collectionStrings.header.manualMeta(count);
    }
    if (collection?.kind === "smart") {
      return collectionStrings.header.smartMeta(
        collection.filters ? describeSmartFilters(collection.filters) : "",
        count,
      );
    }
    return collectionStrings.recipeCount(count);
  };

  // The dashed card of an empty collection or a smart filter that matches
  // nothing; filters hiding every recipe get the usual no-results state instead.
  const placeEmptyState = (): JSX.Element | undefined => {
    const collection = placeCollection();
    const isPreviewing = filterEdit.draft() !== undefined && isDesktop();
    if (!collection || placeRecipes().length > 0 || pickCollection() || isPreviewing) {
      return undefined;
    }
    if (collection.kind === "manual") {
      return (
        <PlaceEmptyState
          icon="collections_bookmark"
          title={collectionStrings.empty.title}
          body={
            <>
              <span class={styles.phoneOnly}>{collectionStrings.empty.phoneBody}</span>
              <span class={styles.desktopOnly}>{collectionStrings.empty.desktopBody}</span>
            </>
          }
          action={
            <button
              type="button"
              class={`${buttonStyles.button} ${buttonStyles.primary} ${styles.iconButton}`}
              onClick={() => startPicking(collection)}
            >
              <span class="material-symbols-outlined" aria-hidden="true">
                add
              </span>
              {collectionStrings.empty.addRecipes}
            </button>
          }
        />
      );
    }
    return (
      <PlaceEmptyState
        icon="tune"
        title={collectionStrings.empty.smartTitle}
        body={
          collection.filters
            ? collectionStrings.empty.smartBody(describeSmartFilters(collection.filters))
            : collectionStrings.empty.smartNoFilters
        }
        action={
          <button
            type="button"
            class={`${buttonStyles.button} ${buttonStyles.secondary} ${styles.iconButton}`}
            onClick={() => startEditFilter(collection)}
          >
            <span class="material-symbols-outlined" aria-hidden="true">
              tune
            </span>
            {collectionStrings.header.editFilter}
          </button>
        }
      />
    );
  };

  return (
    <main class={[styles.main, { [styles.selecting]: isSelecting() }]}>
      <header class={styles.header}>
        <div class={styles.headerContent}>
          <h1 class={styles.title}>{recipeListStrings.title}</h1>
          <p class={styles.subtitle}>{recipeListStrings.subtitle}</p>
        </div>
      </header>
      <div class={styles.container}>
        <div class={styles.layout}>
          <div class={styles.sidebar}>
            <LibrarySidebar
              place={place()}
              collections={collections()}
              countOf={countOf}
              onSelectPlace={selectPlace}
              headingAction={
                <button
                  type="button"
                  class={styles.sidebarAdd}
                  aria-label={collectionStrings.create.newCollectionButton}
                  onClick={() => setIsCreatingInSidebar(true)}
                >
                  <span class="material-symbols-outlined" aria-hidden="true">
                    add
                  </span>
                </button>
              }
              onRenameCollection={(collection) =>
                collectionActions.startRename(collection, "sidebar")
              }
              renamingId={collectionActions.renamingIdOn("sidebar")}
              renderRename={(collection) => (
                <InlineNameInput
                  initialValue={collection.name}
                  label={collectionStrings.header.renameSidebar(collection.name)}
                  icon={collection.kind === "smart" ? "tune" : "collections_bookmark"}
                  error={collectionActions.renameError()}
                  onCommit={(name) => collectionActions.commitRename(collection, name)}
                  onCancel={collectionActions.cancelRename}
                />
              )}
              footer={
                <Show when={isCreatingInSidebar()}>
                  <InlineNameInput
                    initialValue=""
                    label={collectionStrings.create.inlineLabel}
                    placeholder={collectionStrings.create.inlinePlaceholder}
                    icon="collections_bookmark"
                    hint={collectionStrings.create.inlineHint}
                    error={sidebarCreateError()}
                    onCommit={createFromSidebar}
                    onCancel={cancelSidebarCreate}
                  />
                </Show>
              }
            />
          </div>
          <div class={styles.controls}>
            <div class={styles.searchWrapper}>
              <SearchBar
                recipes={recipes()}
                searchQuery={params.searchQuery()}
                onSearchChange={params.setSearchQuery}
              />
            </div>
            <div class={styles.chipsRow}>
              <CollectionChips
                place={place()}
                pinned={pinned()}
                temporary={temporaryChip()}
                onSelectPlace={selectPlace}
                onOpenSheet={() => setIsCollectionsSheetOpen(true)}
              />
            </div>
            <button
              type="button"
              class={`${styles.filtersButton} ${activeFilterCount() > 0 ? styles.filtersButtonActive : ""}`}
              aria-expanded={isDesktop() ? ariaBoolean(isFilterPanelOpen()) : undefined}
              onClick={handleFiltersClick}
            >
              <span class="material-symbols-outlined" aria-hidden="true">
                tune
              </span>
              {filterStrings.drawer.filtersButton}
              <Show when={activeFilterCount() > 0}>
                <span class={styles.filterCount}>{activeFilterCount()}</span>
              </Show>
            </button>
            <Show when={activeFilterCount() > 0}>
              <button type="button" class={styles.clearFiltersButton} onClick={params.clearFilters}>
                <span class="material-symbols-outlined">close</span>
                {filterStrings.drawer.clearAll}
              </button>
            </Show>
            <SortDropdown
              value={sort()}
              options={listSortOptions(isManualPlace())}
              defaultValue={defaultListSort(isManualPlace())}
              defaultLabel={
                isManualPlace() ? collectionStrings.sort.yourOrder : recipeListStrings.sort.label
              }
              onSortChange={setSort}
            />
            <button
              type="button"
              class={`${styles.filtersButton} ${styles.selectButton}`}
              aria-label={collectionStrings.select.enter}
              onClick={() => selection.start({ kind: "select" })}
            >
              <span class="material-symbols-outlined" aria-hidden="true">
                checklist
              </span>
              <span class={styles.selectLabel}>{collectionStrings.select.enterShort}</span>
            </button>
            <ViewToggle value={viewMode()} onChange={setViewMode} />
          </div>
          <div class={styles.mainContent}>
            <Show when={isSelecting()}>
              <div class={styles.selectionBar}>
                <ListSelection
                  selection={selection}
                  placeCollection={placeCollection()}
                  viewCount={filteredRecipes().length}
                  librarySlugs={librarySlugs()}
                />
              </div>
            </Show>
            <Show when={isFilterPanelOpen()}>
              <section class={styles.filterPanel} aria-label={filterStrings.drawer.title}>
                <Show when={filterEdit.collection()}>
                  {(collection) => (
                    <p class={styles.editBanner}>
                      <span class="material-symbols-outlined" aria-hidden="true">
                        tune
                      </span>
                      {collectionStrings.smart.editingBanner(collection().name)}
                    </p>
                  )}
                </Show>
                <FilterPanel
                  variant="toolbar"
                  filters={filterEdit.draft() ?? params.filters()}
                  authorOptions={authorOptions()}
                  onFilterChange={filterEdit.draft() ? filterEdit.setDraft : params.setFilter}
                />
                <Show
                  when={filterEdit.draft()}
                  fallback={
                    <div class={styles.filterPanelFooter}>
                      <button
                        type="button"
                        class={`${buttonStyles.button} ${buttonStyles.secondary}`}
                        onClick={params.clearFilters}
                      >
                        {filterStrings.drawer.clearAll}
                      </button>
                      <button
                        type="button"
                        class={`${buttonStyles.button} ${buttonStyles.primary}`}
                        onClick={() => setIsFilterPanelOpen(false)}
                      >
                        {filterStrings.drawer.showResults(filteredRecipes().length)}
                      </button>
                    </div>
                  }
                >
                  <EditFilterFooter
                    countLabel={collectionStrings.smart.preview(filterEdit.matches().length)}
                    canUpdate={filterEdit.canUpdate()}
                    onCancel={filterEdit.end}
                    onUpdate={filterEdit.update}
                  />
                </Show>
              </section>
            </Show>
            <Show when={!isFilterPanelOpen() && activeFilterCount() > 0}>
              <div class={styles.activeFilters}>
                <ActiveFilterChips
                  filters={params.filters()}
                  onRemove={(key, value) =>
                    params.setFilter(key, withoutFilterValue(params.filters(), key, value))
                  }
                  onClearAll={params.clearFilters}
                  trailing={<SaveSmartFilterButton onClick={() => setIsSaveDialogOpen(true)} />}
                />
              </div>
            </Show>
            <Show when={placeCollection()}>
              {(collection) => (
                <div class={styles.phoneOnly}>
                  <CollectionHeaderCard
                    collection={collection()}
                    meta={placeMeta()}
                    isRenaming={isRenamingPlace()}
                    renameError={collectionActions.renameError()}
                    onRenameCommit={(name) => collectionActions.commitRename(collection(), name)}
                    onRenameCancel={collectionActions.cancelRename}
                    onOpenMenu={() => setIsCollectionMenuOpen(true)}
                    actions={
                      <PlaceActions
                        collection={collection()}
                        canReorder={canReorder()}
                        onReorder={() => setIsReordering(true)}
                        onEditFilter={() => startEditFilter(collection())}
                      />
                    }
                  />
                </div>
              )}
            </Show>
            <div class={styles.placeTitle}>
              <div class={styles.placeTitleText}>
                <Show
                  when={isRenamingPlace() && placeCollection()}
                  fallback={
                    <h2 class={styles.placeName}>
                      {isReordering() ? collectionStrings.reorder.desktopHint : placeTitle()}
                    </h2>
                  }
                >
                  {(collection) => (
                    <InlineNameInput
                      class={styles.placeNameInput}
                      initialValue={collection().name}
                      label={collectionStrings.header.renameLabel}
                      error={collectionActions.renameError()}
                      onCommit={(name) => collectionActions.commitRename(collection(), name)}
                      onCancel={collectionActions.cancelRename}
                    />
                  )}
                </Show>
                <p class={styles.placeSubtitle}>{placeSubtitle()}</p>
              </div>
              <Show when={isReordering()}>
                <div class={styles.placeActions}>
                  <button
                    type="button"
                    class={`${buttonStyles.button} ${buttonStyles.primary}`}
                    onClick={() => setIsReordering(false)}
                  >
                    {collectionStrings.reorder.done}
                  </button>
                </div>
              </Show>
              <Show when={!(isReordering() || pickCollection()) && placeCollection()}>
                {(collection) => (
                  <PlaceActions
                    collection={collection()}
                    canReorder={canReorder()}
                    onReorder={() => setIsReordering(true)}
                    onEditFilter={() => startEditFilter(collection())}
                    onAddRecipes={() => startPicking(collection())}
                    menu={
                      <CollectionMenu
                        collection={collection()}
                        onRename={() => collectionActions.startRename(collection(), "title")}
                        onDelete={() => collectionActions.requestDelete(collection())}
                      />
                    }
                  />
                )}
              </Show>
            </div>
            <Show
              when={placeEmptyState()}
              fallback={
                <Show
                  when={isDesktop() && isReordering() && placeCollection()}
                  fallback={
                    <Loading>
                      <RecipeList
                        recipes={filteredRecipes()}
                        currentPage={params.page()}
                        viewMode={viewMode()}
                        onPageChange={(details) => params.setPage(details.page)}
                        onResetAll={params.resetAll}
                        selection={
                          isSelecting()
                            ? { isSelected: selection.isSelected, onToggle: selection.toggle }
                            : undefined
                        }
                        onLongPress={(slug) => selection.start({ kind: "select" }, slug)}
                      />
                    </Loading>
                  }
                >
                  {(collection) => (
                    <Loading>
                      <ReorderGrid collection={collection()} library={recipes()} />
                    </Loading>
                  )}
                </Show>
              }
            >
              {(state) => state()}
            </Show>
          </div>
        </div>
      </div>

      <Show when={!isDesktop() && isReordering() && placeCollection()}>
        {(collection) => (
          <Loading>
            <CollectionReorderView
              collection={collection()}
              library={recipes()}
              onDone={() => setIsReordering(false)}
            />
          </Loading>
        )}
      </Show>
      <FilterDrawer
        open={isFilterDrawerOpen()}
        onOpenChange={(isOpen) => {
          if (!isOpen && filterEdit.draft()) {
            filterEdit.end();
            return;
          }
          setIsFilterDrawerOpen(isOpen);
        }}
        filters={filterEdit.draft() ?? params.filters()}
        authorOptions={authorOptions()}
        onFilterChange={filterEdit.draft() ? filterEdit.setDraft : params.setFilter}
        onClearAll={params.clearFilters}
        resultCount={filteredRecipes().length}
        title={
          filterEdit.collection()
            ? collectionStrings.smart.editTitle(filterEdit.collection()?.name ?? "")
            : undefined
        }
        subtitle={filterEdit.collection() ? collectionStrings.smart.editSubtitle : undefined}
        footerAction={
          <Show when={activeFilterCount() > 0}>
            <SaveSmartFilterButton onClick={() => setIsSaveDialogOpen(true)} />
          </Show>
        }
        footer={
          filterEdit.draft() ? (
            <EditFilterFooter
              countLabel={collectionStrings.smart.matchNow(filterEdit.matches().length)}
              canUpdate={filterEdit.canUpdate()}
              onCancel={filterEdit.end}
              onUpdate={filterEdit.update}
            />
          ) : undefined
        }
      />
      <SaveSmartFilterDialog
        isOpen={isSaveDialogOpen()}
        onOpenChange={setIsSaveDialogOpen}
        filters={params.filters()}
        isPinShown={!isDesktop()}
        isPinsFull={pinnedCount() >= MAX_PINS}
        onSave={saveSmartFilter}
      />
      <CollectionsSheet
        isOpen={isCollectionsSheetOpen()}
        onOpenChange={setIsCollectionsSheetOpen}
        collections={collections()}
        countOf={countOfCollection}
        onOpenCollection={openCollection}
        onTogglePin={togglePin}
        onNewCollection={() => {
          setIsCollectionsSheetOpen(false);
          setIsNewCollectionOpen(true);
        }}
        onNewSmartFilter={openNewSmartFilter}
      />
      <NewCollectionSheet
        isOpen={isNewCollectionOpen()}
        onOpenChange={setIsNewCollectionOpen}
        onCreate={createFromSheet}
      />
      <Show when={placeCollection()}>
        {(collection) => (
          <CollectionMenuSheet
            isOpen={isCollectionMenuOpen()}
            onOpenChange={setIsCollectionMenuOpen}
            collection={collection()}
            pinnedCount={pinnedCount()}
            onAddRecipes={() => startPicking(collection())}
            onEditFilter={() => startEditFilter(collection())}
            onRename={() => collectionActions.startRename(collection(), "title")}
            onTogglePin={() => collectionActions.togglePin(collection())}
            onDelete={() => collectionActions.requestDelete(collection())}
          />
        )}
      </Show>
      <ConfirmDialog
        isOpen={collectionActions.deleting() !== undefined}
        title={collectionStrings.remove.title(collectionActions.deleting()?.name ?? "")}
        description={
          collectionActions.deleting()?.kind === "smart"
            ? collectionStrings.remove.smartBody
            : collectionStrings.remove.collectionBody
        }
        confirmLabel={collectionStrings.remove.confirm}
        isDestructive
        onConfirm={() => collectionActions.confirmDelete()}
        onCancel={collectionActions.cancelDelete}
      />
    </main>
  );
};

export default Home;
