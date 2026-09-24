import type { RecipeData } from "~/types/Recipe.ts";

export const RECIPE_IMAGES_PREFIX = "recipe-images";

// Matches the <slug>.<ext> filenames owl-sight writes under recipe-images/.
// Anything else is rejected so the route can never reach other bucket keys.
export const RECIPE_IMAGE_FILENAME_PATTERN = /^[a-z0-9-]+\.(jpg|png)$/;

const getFilename = (key: string): string => key.split("/").pop() ?? "";

// Only image sources render inline; PDF sources have nothing to show as a picture.
export const getSourceImageUrl = (data: RecipeData): string | undefined => {
  if (data.source_type !== "image" || !data.source_file?.mime_type.startsWith("image/")) {
    return undefined;
  }
  return `/${RECIPE_IMAGES_PREFIX}/${getFilename(data.source_file.key)}`;
};

// Legacy and video recipes keep their extracted thumbnail; image recipes reuse the source photo.
export const getRecipeImageUrl = (data: RecipeData, slug: string): string =>
  getSourceImageUrl(data) ?? `/thumbnails/${slug}`;
