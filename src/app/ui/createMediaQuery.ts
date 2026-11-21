import { createSignal, onSettled } from "solid-js";

export const createMediaQuery = (query: string) => {
  const [matches, setMatches] = createSignal(false);

  onSettled(() => {
    const onChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    const result = matchMedia(query);
    result.addEventListener("change", onChange);
    setMatches(result.matches);

    return () => {
      result.removeEventListener("change", onChange);
    };
  });

  return matches;
};
