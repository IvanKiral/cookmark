import { type Accessor, createSignal } from "solid-js";
import { showToast } from "~/app/ui/Toast.tsx";
import type { Collection } from "~/shared/collections.ts";
import { useCollections } from "./CollectionsContext.tsx";
import { describeNameError, getNameError } from "./collectionNames.ts";
import { collectionStrings } from "./strings.ts";

type CollectionActionsOptions = {
  // Opens a place by its ?in= value with no filters or search.
  openFresh: (param: string | undefined) => void;
};

// Where a rename happens: the sidebar row, or the title (desktop) and header card (phone).
export type RenameSurface = "sidebar" | "title";

export type CollectionActions = {
  // Resolves with an error message, or undefined once created and opened.
  create: (name: string) => Promise<string | undefined>;
  isRenaming: (collection: Collection, surface: RenameSurface) => boolean;
  renamingId: Accessor<string | undefined>;
  renameError: Accessor<string | undefined>;
  startRename: (collection: Collection, surface: RenameSurface) => void;
  // Resolves true when the input can close (an invalid name keeps it open).
  commitRename: (collection: Collection, name: string) => boolean;
  cancelRename: () => void;
  togglePin: (collection: Collection) => Promise<void>;
  deleting: Accessor<Collection | undefined>;
  requestDelete: (collection: Collection) => void;
  confirmDelete: () => Promise<void>;
  cancelDelete: () => void;
};

// Create, rename, pin and delete, shared by the phone sheets and the desktop
// sidebar and title: inline errors, toasts, and opening the right place after.
export const createCollectionActions = (options: CollectionActionsOptions): CollectionActions => {
  const collectionsContext = useCollections();
  const [renaming, setRenaming] = createSignal<{ id: string; surface: RenameSurface } | undefined>(
    undefined,
  );
  const [renameError, setRenameError] = createSignal<string | undefined>(undefined);
  const [deleting, setDeleting] = createSignal<Collection | undefined>(undefined);

  const create = async (name: string): Promise<string | undefined> => {
    const error = getNameError(name, collectionsContext.collections());
    if (error) {
      return error;
    }
    const result = await collectionsContext.create({ name: name.trim(), kind: "manual" });
    if (!result.isOk) {
      return describeNameError(result.error, name);
    }
    options.openFresh(result.collection.id);
    showToast(collectionStrings.create.created(result.collection.name));
    return undefined;
  };

  const endRename = (): void => {
    setRenaming(undefined);
    setRenameError(undefined);
  };

  const commitRename = (collection: Collection, name: string): boolean => {
    if (name.trim() === collection.name) {
      endRename();
      return true;
    }
    const error = getNameError(name, collectionsContext.collections(), collection.id);
    if (error) {
      setRenameError(error);
      return false;
    }
    endRename();
    collectionsContext.update(collection.id, {
      name,
      filters: collection.filters,
      isPinned: collection.pinPosition !== null,
    });
    return true;
  };

  const togglePin = async (collection: Collection): Promise<void> => {
    const isPinned = collection.pinPosition === null;
    const isSaved = await collectionsContext.update(collection.id, {
      name: collection.name,
      filters: collection.filters,
      isPinned,
    });
    if (isSaved) {
      showToast(
        isPinned
          ? collectionStrings.menu.pinned(collection.name)
          : collectionStrings.menu.unpinned(collection.name),
      );
    }
  };

  const confirmDelete = async (): Promise<void> => {
    const collection = deleting();
    setDeleting(undefined);
    if (!collection) {
      return;
    }
    options.openFresh(undefined);
    const isDeleted = await collectionsContext.remove(collection.id);
    if (isDeleted) {
      showToast(
        collection.kind === "smart"
          ? collectionStrings.remove.smartDeleted(collection.name)
          : collectionStrings.remove.collectionDeleted(collection.name),
      );
    }
  };

  return {
    create,
    isRenaming: (collection, surface) =>
      renaming()?.id === collection.id && renaming()?.surface === surface,
    renamingId: () => renaming()?.id,
    renameError,
    startRename: (collection, surface) => {
      setRenameError(undefined);
      setRenaming({ id: collection.id, surface });
    },
    commitRename,
    cancelRename: endRename,
    togglePin,
    deleting,
    requestDelete: setDeleting,
    confirmDelete,
    cancelDelete: () => setDeleting(undefined),
  };
};
