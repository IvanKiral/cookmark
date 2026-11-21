import { Link, MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";
import { MarksProvider } from "~/app/marks/MarksContext.tsx";
import { InstallPrompt } from "~/app/pwa/InstallPrompt.tsx";
import { uiStrings } from "~/app/ui/strings.ts";
import { CurrentUserProvider } from "~/app/user/CurrentUserContext.tsx";

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Title>{uiStrings.appName}</Title>
          <Link rel="preconnect" href="https://fonts.googleapis.com" />
          <Link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
          <Link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap"
          />
          <Link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0&display=swap"
          />
          <InstallPrompt />
          <CurrentUserProvider>
            <MarksProvider>
              <Suspense>{props.children}</Suspense>
            </MarksProvider>
          </CurrentUserProvider>
          <Link rel="icon" href="/favicon.ico" />
          <Link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
          <Link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          <Link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <Link rel="manifest" href="/site.webmanifest" />
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
