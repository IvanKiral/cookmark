import { describe, expect, it } from "vitest";
import type { RecipeData } from "~/types/Recipe.ts";
import {
  getRecipeImageUrl,
  getSourceImageUrl,
  RECIPE_IMAGE_FILENAME_PATTERN,
} from "./recipeImage.ts";

const baseRecipe: RecipeData = {
  title: "Recipe",
  description: "",
  prep_time: null,
  cook_time: null,
  total_time: null,
  servings: null,
  ingredients: [],
  instructions: [],
  tags: [],
  difficulty: null,
  cuisine: null,
  source_url: "https://example.com/recipe",
};

const imageRecipe: RecipeData = {
  ...baseRecipe,
  source_url: undefined,
  source_type: "image",
  source_file: { key: "recipe-images/hrstkova-polevka.jpg", mime_type: "image/jpeg" },
};

describe("getSourceImageUrl", () => {
  it("returns undefined for legacy recipes without source_type", () => {
    expect(getSourceImageUrl(baseRecipe)).toBeUndefined();
  });

  it("returns undefined for video recipes", () => {
    expect(getSourceImageUrl({ ...baseRecipe, source_type: "instagram_reel" })).toBeUndefined();
  });

  it("returns the recipe-images url for image recipes", () => {
    expect(getSourceImageUrl(imageRecipe)).toBe("/recipe-images/hrstkova-polevka.jpg");
  });

  it("returns undefined for pdf sources", () => {
    expect(
      getSourceImageUrl({
        ...imageRecipe,
        source_file: { key: "recipe-images/scan.pdf", mime_type: "application/pdf" },
      }),
    ).toBeUndefined();
  });

  it("returns undefined when an image recipe is missing its source_file", () => {
    expect(getSourceImageUrl({ ...imageRecipe, source_file: undefined })).toBeUndefined();
  });
});

describe("getRecipeImageUrl", () => {
  it("falls back to the thumbnail for legacy recipes", () => {
    expect(getRecipeImageUrl(baseRecipe, "burger-sneci")).toBe("/thumbnails/burger-sneci");
  });

  it("uses the source image for image recipes", () => {
    expect(getRecipeImageUrl(imageRecipe, "hrstkova-polevka")).toBe(
      "/recipe-images/hrstkova-polevka.jpg",
    );
  });
});

describe("RECIPE_IMAGE_FILENAME_PATTERN", () => {
  it.each(["hrstkova-polevka.jpg", "spagety.png"])("accepts %s", (filename) => {
    expect(RECIPE_IMAGE_FILENAME_PATTERN.test(filename)).toBe(true);
  });

  it.each(["../videos/x.mp4", "a/b.jpg", "scan.pdf", "UPPER.jpg", ".jpg"])(
    "rejects %s",
    (filename) => {
      expect(RECIPE_IMAGE_FILENAME_PATTERN.test(filename)).toBe(false);
    },
  );
});
