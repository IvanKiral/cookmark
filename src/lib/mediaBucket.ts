// Minimal shape of the R2 bindings we use (avoids depending on
// @cloudflare/workers-types). The Worker runtime provides the real objects.
export type R2Metadata = {
  size: number;
  writeHttpMetadata: (headers: Headers) => void;
};

export type R2ObjectBody = R2Metadata & {
  body: ReadableStream;
};

export type R2Bucket = {
  head: (key: string) => Promise<R2Metadata | null>;
  get: (
    key: string,
    options?: { range: { offset: number; length: number } },
  ) => Promise<R2ObjectBody | null>;
};

type MediaEnv = {
  MEDIA?: R2Bucket;
};

// nitro's cloudflare-module runtime sets globalThis.__env__ to the Worker env
// on every request. Only read it inside the request lifecycle.
export const getMediaBucket = (): R2Bucket | undefined =>
  (globalThis as unknown as { __env__?: MediaEnv }).__env__?.MEDIA;
