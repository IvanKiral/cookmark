import {
  type Accessor,
  createContext,
  createSignal,
  onMount,
  type ParentComponent,
  useContext,
} from "solid-js";
import type { User } from "~/lib/userStore.ts";

type CurrentUserContextValue = {
  user: Accessor<User | undefined>;
  isAdmin: () => boolean;
  // True once /api/me has answered or failed, so pages can tell "not an
  // admin" apart from "still checking".
  isLoaded: Accessor<boolean>;
};

const CurrentUserContext = createContext<CurrentUserContextValue>();

export const CurrentUserProvider: ParentComponent = (props) => {
  const [user, setUser] = createSignal<User | undefined>();
  const [isLoaded, setIsLoaded] = createSignal(false);

  // Runs on the client after hydration. /api/me also registers first-time
  // visitors as viewers. Until it answers (or if it fails) nobody is an admin,
  // so admin-only controls stay hidden. The server enforces the role regardless.
  onMount(async () => {
    try {
      const response = await fetch("/api/me");
      if (response.ok) {
        setUser((await response.json()) as User);
      }
    } catch {
      // Leave the user unknown if the fetch fails.
    } finally {
      setIsLoaded(true);
    }
  });

  const isAdmin = (): boolean => user()?.role === "admin";

  return (
    <CurrentUserContext.Provider value={{ user, isAdmin, isLoaded }}>
      {props.children}
    </CurrentUserContext.Provider>
  );
};

export const useCurrentUser = (): CurrentUserContextValue => {
  const context = useContext(CurrentUserContext);
  if (!context) {
    throw new Error("useCurrentUser must be used within a CurrentUserProvider");
  }
  return context;
};
