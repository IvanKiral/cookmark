// @refresh reload
import { mount, StartClient } from "@solidjs/start/client";
import { Workbox } from "workbox-window";

const appElement = document.getElementById("app");
if (appElement) {
  mount(() => <StartClient />, appElement);
}

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  const base = import.meta.env.VITE_BASE_URL ?? "/";
  const wb = new Workbox(`${base}_build/sw.js`);

  wb.addEventListener("controlling", () => {
    window.location.reload();
  });

  wb.addEventListener("waiting", () => {
    wb.messageSkipWaiting();
  });

  wb.register();
}

export default () => { };
