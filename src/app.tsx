import { Loading } from "solid-js";
import "./app.css";
import { CollectionsProvider } from "~/app/collections/CollectionsContext.tsx";
import { MarksProvider } from "~/app/marks/MarksContext.tsx";
import { InstallPrompt } from "~/app/pwa/InstallPrompt.tsx";
import { ToastRegion } from "~/app/ui/Toast.tsx";
import { CurrentUserProvider } from "~/app/user/CurrentUserContext.tsx";
import { Router } from "./router.ts";

export default function App() {
  return (
    <Router>
      {(props) => (
        <>
          <InstallPrompt />
          <ToastRegion />
          <CurrentUserProvider>
            <MarksProvider>
              <CollectionsProvider>
                <Loading>{props.children}</Loading>
              </CollectionsProvider>
            </MarksProvider>
          </CurrentUserProvider>
        </>
      )}
    </Router>
  );
}
