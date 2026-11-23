import type { APIEvent } from "~/server/apiEvent.ts";
import { getUserEmail } from "~/server/auth/access.ts";
import { getOrCreateUser } from "~/server/auth/userStore.ts";
import {
  type Collection,
  type CollectionErrorCode,
  type CollectionKind,
  collectionKindValues,
  parseSmartFilters,
  type SmartFilters,
  validateCollectionName,
} from "~/shared/collections.ts";
import {
  appendRecipes,
  type CollectionWriteResult,
  createCollection,
  deleteCollection,
  getCollectionsDb,
  readCollection,
  readCollections,
  removeRecipes,
  reorderRecipes,
  updateCollection,
} from "./collectionsStore.ts";

type CollectionRequest = {
  db: D1Database;
  email: string;
};

const resolveRequest = async (event: APIEvent): Promise<CollectionRequest | Response> => {
  const db = getCollectionsDb();
  if (!db) {
    return new Response("Collections unavailable", { status: 500 });
  }
  const email = await getUserEmail(event.request);
  if (!email) {
    return new Response("Unauthorized", { status: 401 });
  }
  return { db, email };
};

const errorStatuses: Record<CollectionErrorCode, number> = {
  "invalid-body": 400,
  "name-empty": 400,
  "name-too-long": 400,
  "name-taken": 409,
  "pins-full": 409,
  "filters-invalid": 400,
  "filters-on-manual": 400,
  "slugs-on-smart": 400,
  "not-manual": 400,
  "order-mismatch": 400,
};

const errorResponse = (error: CollectionErrorCode): Response =>
  Response.json({ error }, { status: errorStatuses[error] });

const notFound = (): Response => new Response("Not found", { status: 404 });

const noContent = (): Response => new Response(null, { status: 204 });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isStringList = (value: unknown): value is ReadonlyArray<string> =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const isCollectionKind = (value: unknown): value is CollectionKind =>
  collectionKindValues.some((kind) => kind === value);

// undefined when the body is not a JSON object.
const readBody = async (request: Request): Promise<Record<string, unknown> | undefined> => {
  try {
    const body: unknown = await request.json();
    return isRecord(body) ? body : undefined;
  } catch {
    return undefined;
  }
};

const unique = (slugs: ReadonlyArray<string>): ReadonlyArray<string> => [...new Set(slugs)];

const writeResponse = (result: CollectionWriteResult, status: number): Response =>
  result.isSaved
    ? Response.json({ collection: result.collection }, { status })
    : errorResponse(result.error);

type CreateBody = {
  name: string;
  kind: CollectionKind;
  filters: unknown;
  isPinned: boolean;
  slugs: ReadonlyArray<string> | undefined;
};

const parseCreateBody = (body: Record<string, unknown>): CreateBody | undefined => {
  const { name, kind, filters, isPinned, slugs } = body;
  const hasValidTypes =
    typeof name === "string" &&
    isCollectionKind(kind) &&
    (isPinned === undefined || typeof isPinned === "boolean") &&
    (slugs === undefined || isStringList(slugs));
  if (!hasValidTypes) {
    return undefined;
  }
  return { name, kind, filters, isPinned: isPinned ?? false, slugs };
};

type ParsedFilters =
  | { isValid: true; filters: SmartFilters | null }
  | { isValid: false; error: CollectionErrorCode };

const parseCreateFilters = (body: CreateBody): ParsedFilters => {
  if (body.kind === "manual") {
    return body.filters === undefined || body.filters === null
      ? { isValid: true, filters: null }
      : { isValid: false, error: "filters-on-manual" };
  }
  if (body.slugs !== undefined) {
    return { isValid: false, error: "slugs-on-smart" };
  }
  const filters = parseSmartFilters(body.filters);
  return filters ? { isValid: true, filters } : { isValid: false, error: "filters-invalid" };
};

export const handleReadCollections = async (event: APIEvent): Promise<Response> => {
  const request = await resolveRequest(event);
  if (request instanceof Response) {
    return request;
  }
  const collections = await readCollections(request.db, request.email);
  return Response.json({ collections });
};

export const handleCreateCollection = async (event: APIEvent): Promise<Response> => {
  const request = await resolveRequest(event);
  if (request instanceof Response) {
    return request;
  }
  const rawBody = await readBody(event.request);
  const body = rawBody && parseCreateBody(rawBody);
  if (!body) {
    return errorResponse("invalid-body");
  }
  const nameError = validateCollectionName(body.name);
  if (nameError) {
    return errorResponse(nameError);
  }
  const filters = parseCreateFilters(body);
  if (!filters.isValid) {
    return errorResponse(filters.error);
  }
  const now = new Date().toISOString();
  await getOrCreateUser(request.db, request.email, now);
  const result = await createCollection(
    request.db,
    request.email,
    {
      name: body.name.trim(),
      kind: body.kind,
      filters: filters.filters,
      isPinned: body.isPinned,
      slugs: unique(body.slugs ?? []),
    },
    now,
  );
  return writeResponse(result, 201);
};

// A smart filter sent with `filters: null` keeps its stored filters, so one
// whose filters no longer parse can still be renamed or pinned.
type ParsedUpdateFilters =
  | { isValid: true; filters: SmartFilters | null | undefined }
  | { isValid: false; error: CollectionErrorCode };

const parseUpdateFilters = (collection: Collection, filters: unknown): ParsedUpdateFilters => {
  if (collection.kind === "manual") {
    return filters === null
      ? { isValid: true, filters: null }
      : { isValid: false, error: "filters-on-manual" };
  }
  if (filters === null) {
    return { isValid: true, filters: undefined };
  }
  const parsed = parseSmartFilters(filters);
  return parsed ? { isValid: true, filters: parsed } : { isValid: false, error: "filters-invalid" };
};

export const handleUpdateCollection = async (event: APIEvent): Promise<Response> => {
  const request = await resolveRequest(event);
  if (request instanceof Response) {
    return request;
  }
  const body = (await readBody(event.request)) ?? {};
  const { name, isPinned } = body;
  const hasValidTypes =
    typeof name === "string" && typeof isPinned === "boolean" && "filters" in body;
  if (!hasValidTypes) {
    return errorResponse("invalid-body");
  }
  const nameError = validateCollectionName(name);
  if (nameError) {
    return errorResponse(nameError);
  }
  const collection = await readCollection(request.db, request.email, event.params.id ?? "");
  if (!collection) {
    return notFound();
  }
  const filters = parseUpdateFilters(collection, body.filters);
  if (!filters.isValid) {
    return errorResponse(filters.error);
  }
  const result = await updateCollection(
    request.db,
    request.email,
    collection.id,
    { name: name.trim(), filters: filters.filters, isPinned },
    new Date().toISOString(),
  );
  if (!result) {
    return notFound();
  }
  return writeResponse(result, 200);
};

export const handleDeleteCollection = async (event: APIEvent): Promise<Response> => {
  const request = await resolveRequest(event);
  if (request instanceof Response) {
    return request;
  }
  const isDeleted = await deleteCollection(request.db, request.email, event.params.id ?? "");
  return isDeleted ? noContent() : notFound();
};

type RecipesRequest = CollectionRequest & {
  collectionId: string;
  slugs: ReadonlyArray<string>;
};

// Resolves the user, a `{ slugs }` body and a manual collection of the user.
const resolveRecipesRequest = async (event: APIEvent): Promise<RecipesRequest | Response> => {
  const request = await resolveRequest(event);
  if (request instanceof Response) {
    return request;
  }
  const body = await readBody(event.request);
  if (!(body && isStringList(body.slugs))) {
    return errorResponse("invalid-body");
  }
  const collection = await readCollection(request.db, request.email, event.params.id ?? "");
  if (!collection) {
    return notFound();
  }
  if (collection.kind !== "manual") {
    return errorResponse("not-manual");
  }
  return { ...request, collectionId: collection.id, slugs: body.slugs };
};

export const handleAddCollectionRecipes = async (event: APIEvent): Promise<Response> => {
  const request = await resolveRecipesRequest(event);
  if (request instanceof Response) {
    return request;
  }
  await appendRecipes(
    request.db,
    request.collectionId,
    unique(request.slugs),
    new Date().toISOString(),
  );
  return noContent();
};

export const handleRemoveCollectionRecipes = async (event: APIEvent): Promise<Response> => {
  const request = await resolveRecipesRequest(event);
  if (request instanceof Response) {
    return request;
  }
  await removeRecipes(request.db, request.collectionId, unique(request.slugs));
  return noContent();
};

export const handleReorderCollectionRecipes = async (event: APIEvent): Promise<Response> => {
  const request = await resolveRecipesRequest(event);
  if (request instanceof Response) {
    return request;
  }
  const isReordered = await reorderRecipes(request.db, request.collectionId, request.slugs);
  return isReordered ? noContent() : errorResponse("order-mismatch");
};
