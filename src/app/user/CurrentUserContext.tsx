import {
  type Accessor,
  createContext,
  createSignal,
  onSettled,
  type ParentComponent,
  useContext,
} from "solid-js";
import { fetchCurrentUser } from "~/app/api/userApi.ts";
import type { User } from "~/shared/user.ts";

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
  onSettled(() => {
    fetchCurrentUser().then((currentUser) => {
      setUser(currentUser);
      setIsLoaded(true);
    });
  });

  const isAdmin = (): boolean => user()?.role === "admin";

  return (
    <CurrentUserContext value={{ user, isAdmin, isLoaded }}>{props.children}</CurrentUserContext>
  );
};

export const useCurrentUser = (): CurrentUserContextValue => useContext(CurrentUserContext);
