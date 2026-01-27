export const generateSlug = (text: string): string =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "")
    .replace(/[\s]+/g, "_")
    .replace(/-+/g, "_")
    .replace(/^_+|_+$/g, "");
