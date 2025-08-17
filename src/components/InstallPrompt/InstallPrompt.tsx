import { createSignal, onMount, Show } from "solid-js";
import styles from "./InstallPrompt.module.css";

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = createSignal<Event | null>(null);
  const [showPrompt, setShowPrompt] = createSignal(false);

  onMount(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    const handleAppInstalled = () => {
      setShowPrompt(false);
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

    setShowPrompt(false);

    // Type assertion for the prompt event with proper interface
    interface BeforeInstallPromptEvent extends Event {
      prompt: () => Promise<void>;
      userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
    }

    const promptEvent = prompt as BeforeInstallPromptEvent;
    await promptEvent.prompt();

    const result = await promptEvent.userChoice;
    if (result.outcome === "accepted") {
      setDeferredPrompt(null);
    } else {
      setShowPrompt(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  return (
    <Show when={showPrompt()}>
      <div class={styles.installPrompt}>
        <div class={styles.content}>
          <div class={styles.icon}>📱</div>
          <div class={styles.text}>
            <h3>Install Cookmark</h3>
            <p>Add to your home screen for quick access to your recipes</p>
          </div>
          <div class={styles.actions}>
            <button class={styles.installButton} onClick={handleInstallClick} type="button">
              Install
            </button>
            <button class={styles.dismissButton} onClick={handleDismiss} type="button">
              ✕
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
};
