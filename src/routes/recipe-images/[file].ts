import type { APIEvent } from "@solidjs/start/server";
import { getMediaBucket } from "~/lib/mediaBucket.ts";
import { RECIPE_IMAGE_FILENAME_PATTERN, RECIPE_IMAGES_PREFIX } from "~/utils/recipeImage.ts";

const getContentType = (file: string): string =>
  file.endsWith(".png") ? "image/png" : "image/jpeg";

// Source photos of image recipes live in the same R2 bucket as
// recipe-images/<slug>.<ext>. `pnpm dev` has no R2 binding, so it reads the
// gitignored ./recipe-images folder instead. import.meta.env.DEV is replaced
// at build time, which drops the local reader from the Worker bundle.
export const GET = async (event: APIEvent): Promise<Response> => {
  const file = event.params.file;
  if (!RECIPE_IMAGE_FILENAME_PATTERN.test(file)) {
    return new Response("Not found", { status: 404 });
  }

  const bucket = getMediaBucket();
  if (!bucket) {
    if (import.meta.env.DEV) {
      const { readLocalRecipeImage } = await import("~/lib/localRecipeImage.ts");
      const body = await readLocalRecipeImage(file);
      return body
        ? new Response(body, { status: 200, headers: { "content-type": getContentType(file) } })
        : new Response("Not found", { status: 404 });
    }
    return new Response("Media storage unavailable", { status: 500 });
  }

  const object = await bucket.get(`${RECIPE_IMAGES_PREFIX}/${file}`);
  if (!object) {
    return new Response("Not found", { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("cache-control", "private, max-age=86400");
  headers.set("content-length", String(object.size));
  if (!headers.has("content-type")) {
    headers.set("content-type", getContentType(file));
  }
  return new Response(object.body, { status: 200, headers });
};
