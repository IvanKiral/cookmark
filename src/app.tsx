import { Link, MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";
import { InstallPrompt } from "./components/InstallPrompt/InstallPrompt.jsx";

export default function App() {
  const base = import.meta.env.VITE_BASE_URL ?? "/";

  return (
    <Router
      base="/cookmark"
      root={(props) => (
        <MetaProvider>
          <Title>Cookmark</Title>
          <Link rel="preconnect" href="https://fonts.googleapis.com" />
          <Link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
          <Link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap"
          />
          <Link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
          />
          <InstallPrompt />
          <Suspense>{props.children}</Suspense>
          <Link rel="icon" href={`${base}favicon.ico`} />
          <Link rel="icon" type="image/png" href={`${base}favicon-96x96.png`} sizes="96x96" />
          <Link rel="icon" type="image/svg+xml" href={`${base}favicon.svg`} />
          <Link rel="apple-touch-icon" sizes="180x180" href={`${base}apple-touch-icon.png`} />
          <Link rel="manifest" href={`${base}site.webmanifest`} />
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
