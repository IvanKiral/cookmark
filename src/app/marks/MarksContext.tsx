import {
  action,
  createContext,
  createOptimistic,
  createSignal,
  onSettled,
  type ParentComponent,
  useContext,
} from "solid-js";
import { fetchMarkedSlugs, saveMark } from "~/app/api/marksApi.ts";
import { type Mark, markValues } from "~/shared/marks.ts";

type MarkedSlugs = Readonly<Record<Mark, ReadonlySet<string>>>;

type MarksContextValue = {
  isMarked: (mark: Mark, slug: string) => boolean;
  toggle: (mark: Mark, slug: string) => void;
};

const MarksContext = createContext<MarksContextValue>();

const emptyMarks: MarkedSlugs = { favorite: new Set(), "to-try": new Set() };

const withMark = (
  marks: MarkedSlugs,
  mark: Mark,
  slug: string,
  shouldMark: boolean,
): MarkedSlugs => {
  const next = new Set(marks[mark]);
  if (shouldMark) {
    next.add(slug);
  } else {
    next.delete(slug);
  }
  return { ...marks, [mark]: next };
};

export const MarksProvider: ParentComponent = (props) => {
  // What the server has saved.
  const [savedMarks, setSavedMarks] = createSignal<MarkedSlugs>(emptyMarks);
  // What the buttons show: the saved marks plus any toggle still being saved.
  const [marks, setMarks] = createOptimistic(() => savedMarks());

  // Runs on the client after hydration, because marks are per-user data.
  onSettled(() => {
    Promise.all(markValues.map(async (mark) => [mark, await fetchMarkedSlugs(mark)] as const)).then(
      (entries) => setSavedMarks(Object.fromEntries(entries) as MarkedSlugs),
    );
  });

  const isMarked = (mark: Mark, slug: string): boolean => marks()[mark].has(slug);

  // Optimistic: the button flips at once. A failed save ends the action
  // without touching the saved marks, so the button flips back on its own.
  const saveToggle = action(async function* (mark: Mark, slug: string) {
    const shouldMark = !isMarked(mark, slug);
    setMarks((current) => withMark(current, mark, slug, shouldMark));
    const isSaved = await saveMark(mark, slug, shouldMark);
    // Re-enter the action's transaction before writing.
    yield;
    if (isSaved) {
      setSavedMarks((current) => withMark(current, mark, slug, shouldMark));
    }
  });

  const toggle = (mark: Mark, slug: string): void => {
    saveToggle(mark, slug);
  };

  return <MarksContext value={{ isMarked, toggle }}>{props.children}</MarksContext>;
};

export const useMarks = (): MarksContextValue => useContext(MarksContext);
