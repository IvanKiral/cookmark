import * as fs from "node:fs";
import * as path from "node:path";

export const getPrerenderRoutes = (): ReadonlyArray<string> => {
  const dataDir = path.join(process.cwd(), "data");

  if (!fs.existsSync(dataDir)) {
    return ["/cookmark"];
  }

  const files = fs.readdirSync(dataDir).filter((f) => f.endsWith(".json"));
  const recipeSlugs = files.map((file) => file.replace(".json", ""));

  return ["/cookmark", ...recipeSlugs.map((slug) => `/cookmark/recipe/${slug}`)];
};
