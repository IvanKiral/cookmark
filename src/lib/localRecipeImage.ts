import { RECIPE_IMAGES_PREFIX } from "~/utils/recipeImage.ts";

// Minimal shape of the Node APIs we use (the project has no @types/node).
// getBuiltinModule avoids a static node:fs import, so nothing Node-specific
// can leak into the Worker bundle.
type NodeFs = {
  readFile: (path: string) => Promise<Uint8Array<ArrayBuffer>>;
};

type NodeProcess = {
  cwd: () => string;
  getBuiltinModule: (id: "node:fs/promises") => NodeFs;
};

// Dev-only: mirrors the R2 layout from a local ./recipe-images folder. The
// filename is validated by the route before it reaches this path.
export const readLocalRecipeImage = async (
  file: string,
): Promise<Uint8Array<ArrayBuffer> | undefined> => {
  const nodeProcess = (globalThis as unknown as { process: NodeProcess }).process;
  const fs = nodeProcess.getBuiltinModule("node:fs/promises");
  try {
    return await fs.readFile(`${nodeProcess.cwd()}/${RECIPE_IMAGES_PREFIX}/${file}`);
  } catch {
    return undefined;
  }
};
