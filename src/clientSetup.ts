import { Workbox } from "workbox-window";

// Runs in the browser before the app hydrates. Registers the service worker
// that vite-plugin-pwa builds, and reloads once a new version takes over (not
// on the first visit, when the first worker takes control).
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  const workbox = new Workbox("/sw.js");

  workbox.addEventListener("controlling", (event) => {
    if (event.isUpdate) {
      window.location.reload();
    }
  });

  workbox.addEventListener("waiting", () => {
    workbox.messageSkipWaiting();
  });

  workbox.register();
}
