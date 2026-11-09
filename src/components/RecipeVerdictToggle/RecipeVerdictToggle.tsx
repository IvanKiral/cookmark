import { revalidate } from "@solidjs/router";
import {
  type Component,
  createSignal,
  createUniqueId,
  For,
  onCleanup,
  onMount,
  Show,
} from "solid-js";
import ConfirmDialog from "~/components/ConfirmDialog/ConfirmDialog.tsx";
import {
  type RecipeVerdict,
  recipeVerdictIcons,
  recipeVerdictLabels,
  recipeVerdictValues,
} from "~/constants/recipeVerdicts.ts";
import { strings } from "~/constants/strings.ts";
import { useCurrentUser } from "~/contexts/CurrentUserContext.tsx";
import { getRecipeBySlug, getRecipesList } from "~/lib/recipeQueries.ts";
import buttonStyles from "~/styles/iconToggleButton.module.css";
import styles from "./RecipeVerdictToggle.module.css";

type RecipeVerdictToggleProps = {
  slug: string;
  name: string;
  verdict?: RecipeVerdict;
};

type PendingChange = {
  nextVerdict: RecipeVerdict | undefined;
  title: string;
  description: string;
  confirmLabel: string;
};

const triggerActiveClasses: Record<RecipeVerdict, string> = {
  "chef-kiss": buttonStyles.chefKissActive,
  "chef-approved": buttonStyles.chefApprovedActive,
  "chef-ok": buttonStyles.chefOkActive,
  "chef-flop": buttonStyles.chefFlopActive,
};

const optionIconClasses: Record<RecipeVerdict, string> = {
  "chef-kiss": styles.chefKiss,
  "chef-approved": styles.chefApproved,
  "chef-ok": styles.chefOk,
  "chef-flop": styles.chefFlop,
};

// Losing a Chef's kiss is the only change worth a confirmation, whether the
// verdict is cleared or changed to a lower one.
const getPendingChange = (
  name: string,
  currentVerdict: RecipeVerdict | undefined,
  nextVerdict: RecipeVerdict | undefined,
): PendingChange | undefined => {
  if (currentVerdict !== "chef-kiss") {
    return undefined;
  }
  if (nextVerdict) {
    const nextLabel = recipeVerdictLabels[nextVerdict];
    return {
      nextVerdict,
      title: strings.verdicts.confirmChangeTitle(nextLabel),
      description: strings.verdicts.confirmRemoveDescription(name),
      confirmLabel: strings.verdicts.confirmChange(nextLabel),
    };
  }
  return {
    nextVerdict,
    title: strings.verdicts.confirmRemoveTitle,
    description: strings.verdicts.confirmRemoveDescription(name),
    confirmLabel: strings.verdicts.confirmRemove,
  };
};

const createVerdictRequest = (verdict: RecipeVerdict | undefined): RequestInit =>
  verdict
    ? {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verdict }),
      }
    : { method: "DELETE" };

// Admin-only. One icon button showing the current verdict opens a list of all
// verdicts plus Clear, so the recipe top bar stays narrow enough for phones.
// The list is a disclosure of plain buttons (Tab moves between them) rather
// than an ARIA menu, which would also need arrow-key handling. Not optimistic:
// the badge updates once the server has saved the change and the recipe
// queries are refetched.
const RecipeVerdictToggle: Component<RecipeVerdictToggleProps> = (props) => {
  const { isAdmin } = useCurrentUser();
  const [isOpen, setIsOpen] = createSignal(false);
  const [isPending, setIsPending] = createSignal(false);
  const [isConfirming, setIsConfirming] = createSignal(false);
  const [pendingChange, setPendingChange] = createSignal<PendingChange>();
  const panelId = createUniqueId();
  let containerRef: HTMLDivElement | undefined;
  let triggerRef: HTMLButtonElement | undefined;

  const closePanel = (): void => {
    setIsOpen(false);
    triggerRef?.focus();
  };

  const handleDocumentClick = (event: MouseEvent): void => {
    if (isOpen() && containerRef && !containerRef.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  const handleDocumentKeyDown = (event: KeyboardEvent): void => {
    if (isOpen() && event.key === "Escape") {
      closePanel();
    }
  };

  onMount(() => {
    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleDocumentKeyDown);
    onCleanup(() => {
      document.removeEventListener("click", handleDocumentClick);
      document.removeEventListener("keydown", handleDocumentKeyDown);
    });
  });

  const saveVerdict = async (verdict: RecipeVerdict | undefined): Promise<void> => {
    setIsPending(true);
    try {
      const response = await fetch(`/api/verdict/${props.slug}`, createVerdictRequest(verdict));
      if (response.ok) {
        await revalidate([getRecipesList.key, getRecipeBySlug.key]);
      }
    } catch {
      // Leave the state as it was; the admin can try again.
    } finally {
      setIsPending(false);
    }
  };

  const handleSelect = async (nextVerdict: RecipeVerdict | undefined): Promise<void> => {
    closePanel();
    if (nextVerdict === props.verdict) {
      return;
    }
    const change = getPendingChange(props.name, props.verdict, nextVerdict);
    if (change) {
      setPendingChange(change);
      setIsConfirming(true);
      return;
    }
    await saveVerdict(nextVerdict);
  };

  const handleConfirm = async (): Promise<void> => {
    setIsConfirming(false);
    await saveVerdict(pendingChange()?.nextVerdict);
  };

  const triggerLabel = (): string =>
    strings.verdicts.menuLabel(
      props.name,
      props.verdict ? recipeVerdictLabels[props.verdict] : strings.verdicts.none,
    );

  return (
    <Show when={isAdmin()}>
      <div class={styles.container} ref={containerRef}>
        <button
          ref={triggerRef}
          type="button"
          class={
            props.verdict
              ? `${buttonStyles.button} ${buttonStyles.active} ${triggerActiveClasses[props.verdict]}`
              : buttonStyles.button
          }
          aria-label={triggerLabel()}
          aria-expanded={isOpen()}
          aria-controls={panelId}
          disabled={isPending()}
          onClick={() => setIsOpen(!isOpen())}
        >
          <span class="material-symbols-outlined" aria-hidden="true">
            {props.verdict ? recipeVerdictIcons[props.verdict] : recipeVerdictIcons["chef-kiss"]}
          </span>
        </button>
        <Show when={isOpen()}>
          <div id={panelId} class={styles.panel}>
            <For each={recipeVerdictValues}>
              {(verdict) => (
                <button
                  type="button"
                  class={styles.option}
                  classList={{ [styles.optionSelected]: props.verdict === verdict }}
                  aria-pressed={props.verdict === verdict}
                  onClick={() => handleSelect(verdict)}
                >
                  <span
                    class={`material-symbols-outlined ${styles.optionIcon} ${optionIconClasses[verdict]}`}
                    aria-hidden="true"
                  >
                    {recipeVerdictIcons[verdict]}
                  </span>
                  <span class={styles.optionLabel}>{recipeVerdictLabels[verdict]}</span>
                  <Show when={props.verdict === verdict}>
                    <span
                      class={`material-symbols-outlined ${styles.optionCheck}`}
                      aria-hidden="true"
                    >
                      check
                    </span>
                  </Show>
                </button>
              )}
            </For>
            <Show when={props.verdict}>
              <button
                type="button"
                class={`${styles.option} ${styles.clearOption}`}
                onClick={() => handleSelect(undefined)}
              >
                <span class={`material-symbols-outlined ${styles.optionIcon}`} aria-hidden="true">
                  close
                </span>
                <span class={styles.optionLabel}>{strings.verdicts.clear}</span>
              </button>
            </Show>
          </div>
        </Show>
      </div>
      <ConfirmDialog
        isOpen={isConfirming()}
        title={pendingChange()?.title ?? ""}
        description={pendingChange()?.description ?? ""}
        confirmLabel={pendingChange()?.confirmLabel ?? ""}
        onConfirm={handleConfirm}
        onCancel={() => setIsConfirming(false)}
      />
    </Show>
  );
};

export default RecipeVerdictToggle;
