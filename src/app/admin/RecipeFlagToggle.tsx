import { action, type Component, createOptimistic, createSignal, Show } from "solid-js";
import { saveRecipeFlag } from "~/app/api/adminApi.ts";
import { revalidateRecipes } from "~/app/api/recipeQueries.ts";
import { ariaBoolean } from "~/app/ui/ariaBoolean.ts";
import { ConfirmDialog } from "~/app/ui/ConfirmDialog.tsx";
import styles from "~/app/ui/iconToggleButton.module.css";
import { useCurrentUser } from "~/app/user/CurrentUserContext.tsx";
import type { RecipeFlag } from "~/shared/recipeFlags.ts";
import { adminStrings } from "./strings.ts";

type RecipeFlagToggleProps = {
  flag: RecipeFlag;
  slug: string;
  name: string;
  isSet: boolean;
};

type Confirmation = {
  title: string;
  description: string;
  confirmLabel: string;
};

type FlagConfig = {
  icon: string;
  activeClass: string;
  getLabel: (name: string, isSet: boolean) => string;
  // Asked before the change; undefined changes the flag straight away.
  getConfirmation: (name: string, isSet: boolean) => Confirmation | undefined;
};

const flagConfigs: Record<RecipeFlag, FlagConfig> = {
  "should-delete": {
    icon: "delete",
    activeClass: styles.shouldDeleteActive,
    getLabel: (name, isSet) =>
      isSet ? adminStrings.shouldDelete.remove(name) : adminStrings.shouldDelete.add(name),
    getConfirmation: (name, isSet) =>
      isSet
        ? {
            title: adminStrings.shouldDelete.confirmRemoveTitle,
            description: adminStrings.shouldDelete.confirmRemoveDescription(name),
            confirmLabel: adminStrings.shouldDelete.confirmRemove,
          }
        : {
            title: adminStrings.shouldDelete.confirmAddTitle,
            description: adminStrings.shouldDelete.confirmAddDescription(name),
            confirmLabel: adminStrings.shouldDelete.confirmAdd,
          },
  },
};

// Admin-only. Optimistic: the button shows the new state at once and keeps it
// until the refetched recipe confirms it. On failure it reverts and the admin
// can try again.
export const RecipeFlagToggle: Component<RecipeFlagToggleProps> = (props) => {
  const { isAdmin } = useCurrentUser();
  const [isSet, setIsSet] = createOptimistic(() => props.isSet);
  // True only while a save runs; it reverts on its own when the action ends.
  const [isSaving, setIsSaving] = createOptimistic(false);
  const [isConfirming, setIsConfirming] = createSignal(false);
  const config = () => flagConfigs[props.flag];
  const confirmation = () => config().getConfirmation(props.name, isSet());

  const toggleFlag = action(async function* () {
    const nextIsSet = !isSet();
    setIsSet(nextIsSet);
    setIsSaving(true);
    const isSaved = await saveRecipeFlag(props.slug, props.flag, nextIsSet);
    // Re-enter the action's transaction before the refetch.
    yield;
    if (isSaved) {
      revalidateRecipes();
    }
  });

  const handleClick = async (): Promise<void> => {
    if (confirmation()) {
      setIsConfirming(true);
      return;
    }
    await toggleFlag();
  };

  const handleConfirm = async (): Promise<void> => {
    setIsConfirming(false);
    await toggleFlag();
  };

  return (
    <Show when={isAdmin()}>
      <button
        type="button"
        class={[styles.button, { [styles.active]: isSet(), [config().activeClass]: isSet() }]}
        aria-pressed={ariaBoolean(isSet())}
        aria-label={config().getLabel(props.name, isSet())}
        disabled={isSaving()}
        onClick={handleClick}
      >
        <span class="material-symbols-outlined" aria-hidden="true">
          {config().icon}
        </span>
      </button>
      <Show when={confirmation()}>
        {(currentConfirmation) => (
          <ConfirmDialog
            isOpen={isConfirming()}
            title={currentConfirmation().title}
            description={currentConfirmation().description}
            confirmLabel={currentConfirmation().confirmLabel}
            onConfirm={handleConfirm}
            onCancel={() => setIsConfirming(false)}
          />
        )}
      </Show>
    </Show>
  );
};
