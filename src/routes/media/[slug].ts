import type { APIEvent } from "@solidjs/start/server";

// Minimal shape of the R2 bindings we use (avoids depending on
// @cloudflare/workers-types). The Worker runtime provides the real objects.
type R2Metadata = {
  size: number;
  writeHttpMetadata: (headers: Headers) => void;
};

type R2ObjectBody = R2Metadata & {
  body: ReadableStream;
};

type R2Bucket = {
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
const getMediaBucket = (): R2Bucket | undefined =>
  (globalThis as unknown as { __env__?: MediaEnv }).__env__?.MEDIA;

const buildBaseHeaders = (meta: R2Metadata): Headers => {
  const headers = new Headers();
  meta.writeHttpMetadata(headers);
  headers.set("accept-ranges", "bytes");
  headers.set("cache-control", "private, max-age=3600");
  if (!headers.has("content-type")) {
    headers.set("content-type", "video/mp4");
  }
  return headers;
};

const parseRange = (
  rangeHeader: string,
  total: number,
): { start: number; end: number } | undefined => {
  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim());
  if (!match) {
    return undefined;
  }
  const [, startStr, endStr] = match;
  if (startStr === "") {
    const suffix = Number.parseInt(endStr, 10);
    if (Number.isNaN(suffix)) {
      return undefined;
    }
    return { start: Math.max(total - suffix, 0), end: total - 1 };
  }
  const start = Number.parseInt(startStr, 10);
  const end = endStr === "" ? total - 1 : Math.min(Number.parseInt(endStr, 10), total - 1);
  return { start, end };
};

export const GET = async (event: APIEvent): Promise<Response> => {
  const bucket = getMediaBucket();
  if (!bucket) {
    return new Response("Media storage unavailable", { status: 500 });
  }

  const key = `videos/${event.params.slug}.mp4`;
  const meta = await bucket.head(key);
  if (!meta) {
    return new Response("Not found", { status: 404 });
  }

  const baseHeaders = buildBaseHeaders(meta);
  const rangeHeader = event.request.headers.get("range");

  if (rangeHeader) {
    const range = parseRange(rangeHeader, meta.size);
    if (!range || range.start > range.end || range.start >= meta.size) {
      return new Response("Range Not Satisfiable", {
        status: 416,
        headers: { "content-range": `bytes */${meta.size}` },
      });
    }
    const length = range.end - range.start + 1;
    const object = await bucket.get(key, { range: { offset: range.start, length } });
    if (!object) {
      return new Response("Not found", { status: 404 });
    }
    const headers = new Headers(baseHeaders);
    headers.set("content-range", `bytes ${range.start}-${range.end}/${meta.size}`);
    headers.set("content-length", String(length));
    return new Response(object.body, { status: 206, headers });
  }

  const object = await bucket.get(key);
  if (!object) {
    return new Response("Not found", { status: 404 });
  }
  const headers = new Headers(baseHeaders);
  headers.set("content-length", String(meta.size));
  return new Response(object.body, { status: 200, headers });
};
