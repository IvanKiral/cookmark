import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";
import { InstallPrompt } from "./components/InstallPrompt/InstallPrompt.jsx";

export default function App() {
  return (
    <Router
      base="/cookmark"
      root={(props) => (
        <MetaProvider>
          <Title>Cookmark</Title>
          <InstallPrompt />
          <Suspense>{props.children}</Suspense>
          <link rel="icon" href="/cookmark/favicon.ico" />
          <link rel="icon" type="image/png" href="/cookmark/favicon-96x96.png" sizes="96x96" />
          <link rel="icon" type="image/svg+xml" href="/cookmark/favicon.svg" />
          <link rel="apple-touch-icon" sizes="180x180" href="/cookmark/apple-touch-icon.png" />
          <link rel="manifest" href="/cookmark/site.webmanifest" />
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
