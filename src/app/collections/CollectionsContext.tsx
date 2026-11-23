import {
  type Accessor,
  action,
  createContext,
  createOptimistic,
  createSignal,
  onSettled,
  type ParentComponent,
  useContext,
} from "solid-js";
import {
  addCollectionRecipes,
  type CollectionSaveResult,
  type CollectionUpdateInput,
  type CollectionWriteResult,
  createCollection,
  deleteCollection,
  fetchCollections,
  type NewCollectionInput,
  removeCollectionRecipes,
  reorderCollectionRecipes,
  updateCollection,
} from "~/app/api/collectionsApi.ts";
import { showToast } from "~/app/ui/Toast.tsx";
import type { Collection } from "~/shared/collections.ts";
import { collectionStrings } from "./strings.ts";

type Collections = ReadonlyArray<Collection>;

type CollectionsContextValue = {
  // What the UI shows: the saved collections plus changes still being saved.
  collections: Accessor<Collections>;
  isLoaded: Accessor<boolean>;
  reload: () => Promise<void>;
  // Not optimistic: resolves once the server has created it.
  create: (input: NewCollectionInput) => Promise<CollectionWriteResult>;
  update: (id: string, input: CollectionUpdateInput) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  // One request per collection; resolves with the ids that were saved.
  addRecipes: (
    ids: ReadonlyArray<string>,
    slugs: ReadonlyArray<string>,
  ) => Promise<ReadonlyArray<string>>;
  removeRecipes: (id: string, slugs: ReadonlyArray<string>) => Promise<boolean>;
  reorder: (id: string, slugs: ReadonlyArray<string>) => Promise<boolean>;
};

const CollectionsContext = createContext<CollectionsContextValue>();

const sortByName = (collections: Collections): Collections =>
  [...collections].sort((a, b) => a.name.localeCompare(b.name));

const withCollection = (collections: Collections, collection: Collection): Collections =>
  sortByName([...collections.filter((item) => item.id !== collection.id), collection]);

const mapCollection = (
  collections: Collections,
  id: string,
  change: (collection: Collection) => Collection,
): Collections => collections.map((item) => (item.id === id ? change(item) : item));

const appendSlugs = (collection: Collection, slugs: ReadonlyArray<string>): Collection => ({
  ...collection,
  slugs: [...collection.slugs, ...slugs.filter((slug) => !collection.slugs.includes(slug))],
});

const withoutSlugs = (collection: Collection, slugs: ReadonlyArray<string>): Collection => ({
  ...collection,
  slugs: collection.slugs.filter((slug) => !slugs.includes(slug)),
});

// The lowest free pin, as the server picks it; it confirms the real one.
const nextPinPosition = (collections: Collections): Collection["pinPosition"] =>
  ([1, 2, 3] as const).find((position) =>
    collections.every((item) => item.pinPosition !== position),
  ) ?? null;

const applyUpdate = (
  collections: Collections,
  id: string,
  input: CollectionUpdateInput,
): Collections =>
  sortByName(
    mapCollection(collections, id, (collection) => ({
      ...collection,
      name: input.name.trim(),
      filters: input.filters ?? collection.filters,
      pinPosition: input.isPinned ? (collection.pinPosition ?? nextPinPosition(collections)) : null,
    })),
  );

// Another tab may have changed the collections (deleted one, added a recipe).
const shouldReload = (result: CollectionSaveResult | CollectionWriteResult): boolean =>
  !result.isOk && (result.status === 404 || result.error === "order-mismatch");

export const CollectionsProvider: ParentComponent = (props) => {
  // What the server has saved.
  const [savedCollections, setSavedCollections] = createSignal<Collections>([]);
  const [isLoaded, setIsLoaded] = createSignal(false);
  const [collections, setCollections] = createOptimistic(() => savedCollections());

  const reload = async (): Promise<void> => {
    const loaded = await fetchCollections();
    // A failed load keeps what the list has; the first one leaves it empty.
    if (loaded) {
      setSavedCollections(sortByName(loaded));
    }
    setIsLoaded(true);
  };

  // Runs on the client after hydration, because collections are per-user data.
  onSettled(() => {
    reload();
  });

  // Ends optimistic changes: on success the saved list takes them over, on
  // failure the optimistic values fall back on their own. One toast for any
  // number of failures, and a reload when another tab changed something.
  const finishAll = async (
    results: ReadonlyArray<CollectionSaveResult | CollectionWriteResult>,
  ): Promise<boolean> => {
    if (results.every((result) => result.isOk)) {
      return true;
    }
    showToast(collectionStrings.errors.couldNotSave);
    if (results.some(shouldReload)) {
      await reload();
    }
    return false;
  };

  const finish = (result: CollectionSaveResult | CollectionWriteResult): Promise<boolean> =>
    finishAll([result]);

  const create = async (input: NewCollectionInput): Promise<CollectionWriteResult> => {
    const result = await createCollection(input);
    if (result.isOk) {
      setSavedCollections((current) => withCollection(current, result.collection));
    }
    return result;
  };

  const saveUpdate = action(async function* (id: string, input: CollectionUpdateInput) {
    setCollections((current) => applyUpdate(current, id, input));
    const result = await updateCollection(id, input);
    yield;
    if (result.isOk) {
      setSavedCollections((current) => withCollection(current, result.collection));
    }
    return result;
  });

  const saveRemove = action(async function* (id: string) {
    setCollections((current) => current.filter((item) => item.id !== id));
    const result = await deleteCollection(id);
    yield;
    if (result.isOk) {
      setSavedCollections((current) => current.filter((item) => item.id !== id));
    }
    return result;
  });

  const saveAdd = action(async function* (id: string, slugs: ReadonlyArray<string>) {
    setCollections((current) => mapCollection(current, id, (item) => appendSlugs(item, slugs)));
    const result = await addCollectionRecipes(id, slugs);
    yield;
    if (result.isOk) {
      setSavedCollections((current) =>
        mapCollection(current, id, (item) => appendSlugs(item, slugs)),
      );
    }
    return result;
  });

  const saveRemoveRecipes = action(async function* (id: string, slugs: ReadonlyArray<string>) {
    setCollections((current) => mapCollection(current, id, (item) => withoutSlugs(item, slugs)));
    const result = await removeCollectionRecipes(id, slugs);
    yield;
    if (result.isOk) {
      setSavedCollections((current) =>
        mapCollection(current, id, (item) => withoutSlugs(item, slugs)),
      );
    }
    return result;
  });

  const saveReorder = action(async function* (id: string, slugs: ReadonlyArray<string>) {
    setCollections((current) => mapCollection(current, id, (item) => ({ ...item, slugs })));
    const result = await reorderCollectionRecipes(id, slugs);
    yield;
    if (result.isOk) {
      setSavedCollections((current) => mapCollection(current, id, (item) => ({ ...item, slugs })));
    }
    return result;
  });

  // Only failed collections roll back; one failure toast covers them all.
  const addRecipes = async (
    ids: ReadonlyArray<string>,
    slugs: ReadonlyArray<string>,
  ): Promise<ReadonlyArray<string>> => {
    const results = await Promise.all(ids.map((id) => saveAdd(id, slugs)));
    await finishAll(results);
    return ids.filter((_, index) => results[index]?.isOk);
  };

  const value: CollectionsContextValue = {
    collections,
    isLoaded,
    reload,
    create,
    update: async (id, input) => finish(await saveUpdate(id, input)),
    remove: async (id) => finish(await saveRemove(id)),
    addRecipes,
    removeRecipes: async (id, slugs) => finish(await saveRemoveRecipes(id, slugs)),
    reorder: async (id, slugs) => finish(await saveReorder(id, slugs)),
  };

  return <CollectionsContext value={value}>{props.children}</CollectionsContext>;
};

export const useCollections = (): CollectionsContextValue => useContext(CollectionsContext);
