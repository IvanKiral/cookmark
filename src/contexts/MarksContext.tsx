import { createContext, createSignal, onMount, type ParentComponent, useContext } from "solid-js";
import { type Mark, markEndpoints, markValues } from "~/constants/markOptions.ts";

type MarkedSlugs = Readonly<Record<Mark, ReadonlySet<string>>>;

type MarksContextValue = {
  isMarked: (mark: Mark, slug: string) => boolean;
  toggle: (mark: Mark, slug: string) => void;
};

const MarksContext = createContext<MarksContextValue>();

const emptyMarks: MarkedSlugs = { favorite: new Set(), "to-try": new Set() };

const fetchSlugs = async (mark: Mark): Promise<ReadonlySet<string>> => {
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

export const MarksProvider: ParentComponent = (props) => {
  const [marks, setMarks] = createSignal<MarkedSlugs>(emptyMarks);

  // Runs on the client after hydration — marks are per-user runtime data.
  // A list that fails to load stays empty.
  onMount(async () => {
    const entries = await Promise.all(
      markValues.map(async (mark) => [mark, await fetchSlugs(mark)] as const),
    );
    setMarks(Object.fromEntries(entries) as MarkedSlugs);
  });

  const isMarked = (mark: Mark, slug: string): boolean => marks()[mark].has(slug);

  const setMarked = (mark: Mark, slug: string, shouldMark: boolean): void => {
    setMarks((current) => {
      const next = new Set(current[mark]);
      if (shouldMark) {
        next.add(slug);
      } else {
        next.delete(slug);
      }
      return { ...current, [mark]: next };
    });
  };

  const toggle = (mark: Mark, slug: string): void => {
    const wasMarked = isMarked(mark, slug);

    // Optimistic update, reverted if the request fails.
    setMarked(mark, slug, !wasMarked);
    fetch(`${markEndpoints[mark]}/${slug}`, { method: wasMarked ? "DELETE" : "PUT" })
      .then((response) => {
        if (!response.ok) {
          setMarked(mark, slug, wasMarked);
        }
      })
      .catch(() => setMarked(mark, slug, wasMarked));
  };

  return (
    <MarksContext.Provider value={{ isMarked, toggle }}>{props.children}</MarksContext.Provider>
  );
};

export const useMarks = (): MarksContextValue => {
  const context = useContext(MarksContext);
  if (!context) {
    throw new Error("useMarks must be used within a MarksProvider");
  }
  return context;
};
