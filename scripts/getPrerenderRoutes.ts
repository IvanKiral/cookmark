import * as fs from "node:fs";
import * as path from "node:path";

export const getPrerenderRoutes = (basePath = "/"): ReadonlyArray<string> => {
  // Strip the trailing slash so routes join cleanly; "/" collapses to "".
  const base = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
  const homeRoute = base === "" ? "/" : base;

  const dataDir = path.join(process.cwd(), "data");

  if (!fs.existsSync(dataDir)) {
    return [homeRoute];
  }

  const files = fs.readdirSync(dataDir).filter((f) => f.endsWith(".json"));
  const recipeSlugs = files.map((file) => file.replace(".json", ""));

  return [homeRoute, ...recipeSlugs.map((slug) => `${base}/recipe/${slug}`)];
};
