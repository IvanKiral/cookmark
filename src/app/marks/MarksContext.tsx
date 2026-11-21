import { createContext, createSignal, onMount, type ParentComponent, useContext } from "solid-js";
import { fetchMarkedSlugs, saveMark } from "~/app/api/marksApi.ts";
import { type Mark, markValues } from "~/shared/marks.ts";

type MarkedSlugs = Readonly<Record<Mark, ReadonlySet<string>>>;

type MarksContextValue = {
  isMarked: (mark: Mark, slug: string) => boolean;
  toggle: (mark: Mark, slug: string) => void;
};

const MarksContext = createContext<MarksContextValue>();

const emptyMarks: MarkedSlugs = { favorite: new Set(), "to-try": new Set() };

export const MarksProvider: ParentComponent = (props) => {
  const [marks, setMarks] = createSignal<MarkedSlugs>(emptyMarks);

  // Runs on the client after hydration, because marks are per-user data.
  onMount(async () => {
    const entries = await Promise.all(
      markValues.map(async (mark) => [mark, await fetchMarkedSlugs(mark)] as const),
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
    saveMark(mark, slug, !wasMarked).then((isSaved) => {
      if (!isSaved) {
        setMarked(mark, slug, wasMarked);
      }
    });
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
