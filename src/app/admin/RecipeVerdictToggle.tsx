import {
  action,
  type Component,
  createOptimistic,
  createSignal,
  createUniqueId,
  For,
  onSettled,
  Show,
} from "solid-js";
import { saveRecipeVerdict } from "~/app/api/adminApi.ts";
import { revalidateRecipes } from "~/app/api/recipeQueries.ts";
import { ariaBoolean } from "~/app/ui/ariaBoolean.ts";
import { ConfirmDialog } from "~/app/ui/ConfirmDialog.tsx";
import buttonStyles from "~/app/ui/iconToggleButton.module.css";
import { useCurrentUser } from "~/app/user/CurrentUserContext.tsx";
import { recipeVerdictIcons, recipeVerdictLabels } from "~/app/verdicts/verdictDisplay.ts";
import { type RecipeVerdict, recipeVerdictValues } from "~/shared/verdicts.ts";
import styles from "./RecipeVerdictToggle.module.css";
import { adminStrings } from "./strings.ts";

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
      title: adminStrings.verdict.confirmChangeTitle(nextLabel),
      description: adminStrings.verdict.confirmRemoveDescription(name),
      confirmLabel: adminStrings.verdict.confirmChange(nextLabel),
    };
  }
  return {
    nextVerdict,
    title: adminStrings.verdict.confirmRemoveTitle,
    description: adminStrings.verdict.confirmRemoveDescription(name),
    confirmLabel: adminStrings.verdict.confirmRemove,
  };
};

// Admin-only. One icon button showing the current verdict opens a list of all
// verdicts plus Clear, so the recipe top bar stays narrow enough for phones.
// The list is a disclosure of plain buttons (Tab moves between them) rather
// than an ARIA menu, which would also need arrow-key handling. Optimistic: the
// button shows the new verdict at once and keeps it until the refetched recipe
// confirms it. On failure it reverts and the admin can try again.
export const RecipeVerdictToggle: Component<RecipeVerdictToggleProps> = (props) => {
  const { isAdmin } = useCurrentUser();
  const [isOpen, setIsOpen] = createSignal(false);
  const [verdict, setVerdict] = createOptimistic(() => props.verdict);
  // True only while a save runs; it reverts on its own when the action ends.
  const [isSaving, setIsSaving] = createOptimistic(false);
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

  onSettled(() => {
    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleDocumentKeyDown);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
      document.removeEventListener("keydown", handleDocumentKeyDown);
    };
  });

  const saveVerdict = action(async function* (nextVerdict: RecipeVerdict | undefined) {
    setVerdict(nextVerdict);
    setIsSaving(true);
    const isSaved = await saveRecipeVerdict(props.slug, nextVerdict);
    // Re-enter the action's transaction before the refetch.
    yield;
    if (isSaved) {
      revalidateRecipes();
    }
  });

  const handleSelect = async (nextVerdict: RecipeVerdict | undefined): Promise<void> => {
    closePanel();
    if (nextVerdict === verdict()) {
      return;
    }
    const change = getPendingChange(props.name, verdict(), nextVerdict);
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

  const triggerLabel = (): string => {
    const current = verdict();
    return adminStrings.verdict.menuLabel(
      props.name,
      current ? recipeVerdictLabels[current] : adminStrings.verdict.none,
    );
  };

  const triggerClass = (): string => {
    const current = verdict();
    return current
      ? `${buttonStyles.button} ${buttonStyles.active} ${triggerActiveClasses[current]}`
      : buttonStyles.button;
  };

  return (
    <Show when={isAdmin()}>
      <div class={styles.container} ref={containerRef}>
        <button
          ref={triggerRef}
          type="button"
          class={triggerClass()}
          aria-label={triggerLabel()}
          aria-expanded={ariaBoolean(isOpen())}
          aria-controls={panelId}
          disabled={isSaving()}
          onClick={() => setIsOpen(!isOpen())}
        >
          <span class="material-symbols-outlined" aria-hidden="true">
            {recipeVerdictIcons[verdict() ?? "chef-kiss"]}
          </span>
        </button>
        <Show when={isOpen()}>
          <div id={panelId} class={styles.panel}>
            <For each={recipeVerdictValues}>
              {(option) => (
                <button
                  type="button"
                  class={[styles.option, { [styles.optionSelected]: verdict() === option }]}
                  aria-pressed={ariaBoolean(verdict() === option)}
                  onClick={() => handleSelect(option)}
                >
                  <span
                    class={`material-symbols-outlined ${styles.optionIcon} ${optionIconClasses[option]}`}
                    aria-hidden="true"
                  >
                    {recipeVerdictIcons[option]}
                  </span>
                  <span class={styles.optionLabel}>{recipeVerdictLabels[option]}</span>
                  <Show when={verdict() === option}>
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
            <Show when={verdict()}>
              <button
                type="button"
                class={`${styles.option} ${styles.clearOption}`}
                onClick={() => handleSelect(undefined)}
              >
                <span class={`material-symbols-outlined ${styles.optionIcon}`} aria-hidden="true">
                  close
                </span>
                <span class={styles.optionLabel}>{adminStrings.verdict.clear}</span>
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
