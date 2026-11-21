import type { Mark } from "~/shared/marks.ts";

const markEndpoints: Record<Mark, string> = {
  favorite: "/api/favorites",
  "to-try": "/api/to-try",
};

// The signed-in user's marked recipes. A list that fails to load is empty.
export const fetchMarkedSlugs = async (mark: Mark): Promise<ReadonlySet<string>> => {
  try {
    const response = await fetch(markEndpoints[mark]);
    if (!response.ok) {
      return new Set();
    }
    const data = (await response.json()) as { slugs?: ReadonlyArray<string> };
    return new Set(data.slugs ?? []);
  } catch {
    return new Set();
  }
};

// Returns whether the change was saved.
export const saveMark = async (mark: Mark, slug: string, isMarked: boolean): Promise<boolean> => {
  try {
    const response = await fetch(`${markEndpoints[mark]}/${slug}`, {
      method: isMarked ? "PUT" : "DELETE",
    });
    return response.ok;
  } catch {
    return false;
  }
};
