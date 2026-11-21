import { Loading } from "solid-js";
import "./app.css";
import { MarksProvider } from "~/app/marks/MarksContext.tsx";
import { InstallPrompt } from "~/app/pwa/InstallPrompt.tsx";
import { CurrentUserProvider } from "~/app/user/CurrentUserContext.tsx";
import { Router } from "./router.ts";

export default function App() {
  return (
    <Router>
      {(props) => (
        <>
          <InstallPrompt />
          <CurrentUserProvider>
            <MarksProvider>
              <Loading>{props.children}</Loading>
            </MarksProvider>
          </CurrentUserProvider>
        </>
      )}
    </Router>
  );
}
