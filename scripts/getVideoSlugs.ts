import * as fs from "node:fs";
import * as path from "node:path";

// Slugs that have a video available, derived at build time from the local
// ./videos source (uploaded to R2 separately). Used to decide which recipe
// pages render a player. Returns [] when the folder is absent (e.g. CI).
export const getVideoSlugs = (): ReadonlyArray<string> => {
  const videosDir = path.join(process.cwd(), "videos");

  if (!fs.existsSync(videosDir)) {
    return [];
  }

  return fs
    .readdirSync(videosDir)
    .filter((file) => file.endsWith(".mp4"))
    .map((file) => file.replace(".mp4", ""));
};
