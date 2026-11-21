// The parts of the Worker binding APIs the app uses, referenced by the
// generated worker-configuration.d.ts. The runtime provides the real objects.
// @cloudflare/workers-types is not used because its Request, Headers and
// ReadableStream clash with the DOM types the UI code needs.
declare global {
  type D1PreparedStatement = {
    bind: (...values: ReadonlyArray<unknown>) => D1PreparedStatement;
    run: () => Promise<{ meta: { changes: number } }>;
    first: <T>() => Promise<T | null>;
    all: <T>() => Promise<{ results: ReadonlyArray<T> }>;
  };

  // A batch runs its statements as one transaction.
  type D1Database = {
    prepare: (query: string) => D1PreparedStatement;
    batch: (statements: ReadonlyArray<D1PreparedStatement>) => Promise<unknown>;
  };

  type R2Object = {
    size: number;
    writeHttpMetadata: (headers: Headers) => void;
  };

  type R2ObjectBody = R2Object & {
    body: ReadableStream;
  };

  type R2Bucket = {
    head: (key: string) => Promise<R2Object | null>;
    get: (
      key: string,
      options?: { range: { offset: number; length: number } },
    ) => Promise<R2ObjectBody | null>;
  };
}

export {};
