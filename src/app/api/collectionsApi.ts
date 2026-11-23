import type {
  Collection,
  CollectionErrorCode,
  CollectionKind,
  SmartFilters,
} from "~/shared/collections.ts";

// Calls to /api/collections. Each one returns a result instead of throwing;
// status 0 means the request never got an answer.

export type CollectionFailure = {
  isOk: false;
  status: number;
  error: CollectionErrorCode | undefined;
};

export type CollectionSaveResult = { isOk: true } | CollectionFailure;

export type CollectionWriteResult = { isOk: true; collection: Collection } | CollectionFailure;

export type NewCollectionInput = {
  name: string;
  kind: CollectionKind;
  filters?: SmartFilters;
  isPinned?: boolean;
  slugs?: ReadonlyArray<string>;
};

export type CollectionUpdateInput = {
  name: string;
  filters: SmartFilters | null;
  isPinned: boolean;
};

const ENDPOINT = "/api/collections";

const readError = async (response: Response): Promise<CollectionErrorCode | undefined> => {
  try {
    const body = (await response.json()) as { error?: CollectionErrorCode };
    return body.error;
  } catch {
    return undefined;
  }
};

const failure = async (response: Response | undefined): Promise<CollectionFailure> => ({
  isOk: false,
  status: response?.status ?? 0,
  error: response ? await readError(response) : undefined,
});

const request = async (
  url: string,
  method: string,
  body?: unknown,
): Promise<Response | undefined> => {
  try {
    return await fetch(url, {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    return undefined;
  }
};

const save = async (url: string, method: string, body?: unknown): Promise<CollectionSaveResult> => {
  const response = await request(url, method, body);
  return response?.ok ? { isOk: true } : failure(response);
};

const write = async (
  url: string,
  method: string,
  body: unknown,
): Promise<CollectionWriteResult> => {
  const response = await request(url, method, body);
  if (!response?.ok) {
    return failure(response);
  }
  const data = (await response.json()) as { collection: Collection };
  return { isOk: true, collection: data.collection };
};

// undefined when the list could not be loaded.
export const fetchCollections = async (): Promise<ReadonlyArray<Collection> | undefined> => {
  const response = await request(ENDPOINT, "GET");
  if (!response?.ok) {
    return undefined;
  }
  try {
    const data = (await response.json()) as { collections?: ReadonlyArray<Collection> };
    return data.collections;
  } catch {
    return undefined;
  }
};

export const createCollection = (input: NewCollectionInput): Promise<CollectionWriteResult> =>
  write(ENDPOINT, "POST", input);

export const updateCollection = (
  id: string,
  input: CollectionUpdateInput,
): Promise<CollectionWriteResult> => write(`${ENDPOINT}/${id}`, "PUT", input);

export const deleteCollection = (id: string): Promise<CollectionSaveResult> =>
  save(`${ENDPOINT}/${id}`, "DELETE");

export const addCollectionRecipes = (
  id: string,
  slugs: ReadonlyArray<string>,
): Promise<CollectionSaveResult> => save(`${ENDPOINT}/${id}/recipes`, "POST", { slugs });

export const removeCollectionRecipes = (
  id: string,
  slugs: ReadonlyArray<string>,
): Promise<CollectionSaveResult> => save(`${ENDPOINT}/${id}/recipes`, "DELETE", { slugs });

export const reorderCollectionRecipes = (
  id: string,
  slugs: ReadonlyArray<string>,
): Promise<CollectionSaveResult> => save(`${ENDPOINT}/${id}/order`, "PUT", { slugs });
