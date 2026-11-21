import type { RecipeEditError } from "~/shared/recipeEdit.ts";
import { adminStrings } from "./strings.ts";

const text = adminStrings.editErrors;

export const formatRecipeEditError = (error: RecipeEditError): string => {
  switch (error.code) {
    case "tooLong":
      return text.tooLong(error.maxLength);
    case "minutes":
      return text.minutes(error.max);
    case "unknownTag":
      return text.unknownTag(error.tag);
    default:
      return text[error.code];
  }
};
