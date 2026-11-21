import { createSignal, onSettled, Show } from "solid-js";
import styles from "./InstallPrompt.module.css";
import { pwaStrings } from "./strings.ts";

// Chrome's install event, which TypeScript's DOM types do not include.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = createSignal<BeforeInstallPromptEvent | null>(null);
  const [isPromptShown, setIsPromptShown] = createSignal(false);

  onSettled(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setIsPromptShown(true);
    };

    const handleAppInstalled = () => {
      setIsPromptShown(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  });

  const handleInstallClick = async () => {
    const prompt = deferredPrompt();
    if (!prompt) {
      return;
    }

    setIsPromptShown(false);
    await prompt.prompt();

    const result = await prompt.userChoice;
    if (result.outcome === "accepted") {
      setDeferredPrompt(null);
    } else {
      setIsPromptShown(true);
    }
  };

  const handleDismiss = () => {
    setIsPromptShown(false);
  };

  return (
    <Show when={isPromptShown()}>
      <div class={styles.installPrompt}>
        <div class={styles.content}>
          <div class={styles.icon}>
            <span class="material-symbols-outlined" aria-hidden="true">
              install_mobile
            </span>
          </div>
          <div class={styles.text}>
            <h3>{pwaStrings.title}</h3>
            <p>{pwaStrings.hint}</p>
          </div>
          <div class={styles.actions}>
            <button class={styles.installButton} onClick={handleInstallClick} type="button">
              {pwaStrings.install}
            </button>
            <button
              class={styles.dismissButton}
              onClick={handleDismiss}
              type="button"
              aria-label={pwaStrings.dismiss}
            >
              <span class="material-symbols-outlined" aria-hidden="true">
                close
              </span>
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
};
