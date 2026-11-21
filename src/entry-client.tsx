// @refresh reload
import { mount, StartClient } from "@solidjs/start/client";
import { Workbox } from "workbox-window";

const appElement = document.getElementById("app");
if (appElement) {
  mount(() => <StartClient />, appElement);
}

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  const wb = new Workbox("/_build/sw.js");

  wb.addEventListener("controlling", () => {
    window.location.reload();
  });

  wb.addEventListener("waiting", () => {
    wb.messageSkipWaiting();
  });

  wb.register();
}

export default () => {};
