import type { APIEvent } from "@solidjs/start/server";
import { getMediaBucket } from "~/lib/mediaBucket.ts";

// Recipe thumbnails live alongside the videos in the same R2 bucket as
// thumbnails/<slug>.jpg. Unlike videos these are small, so we stream the whole
// object without range support. Missing thumbnails return 404 and the card
// falls back to a placeholder.
export const GET = async (event: APIEvent): Promise<Response> => {
  const bucket = getMediaBucket();
  if (!bucket) {
    return new Response("Media storage unavailable", { status: 500 });
  }

  const object = await bucket.get(`thumbnails/${event.params.slug}.jpg`);
  if (!object) {
    return new Response("Not found", { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("cache-control", "private, max-age=86400");
  headers.set("content-length", String(object.size));
  if (!headers.has("content-type")) {
    headers.set("content-type", "image/jpeg");
  }
  return new Response(object.body, { status: 200, headers });
};
