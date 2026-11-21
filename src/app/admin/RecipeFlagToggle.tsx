import { type Component, createSignal, Show } from "solid-js";
import { saveRecipeFlag } from "~/app/api/adminApi.ts";
import { ConfirmDialog } from "~/app/ui/ConfirmDialog.tsx";
import { useCurrentUser } from "~/app/user/CurrentUserContext.tsx";
import type { RecipeFlag } from "~/shared/recipeFlags.ts";
import styles from "~/styles/iconToggleButton.module.css";
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

// Admin-only. Not optimistic: the badge updates once the server has saved the
// change and the recipe queries are refetched.
export const RecipeFlagToggle: Component<RecipeFlagToggleProps> = (props) => {
  const { isAdmin } = useCurrentUser();
  const [isPending, setIsPending] = createSignal(false);
  const [isConfirming, setIsConfirming] = createSignal(false);
  const config = () => flagConfigs[props.flag];
  const confirmation = () => config().getConfirmation(props.name, props.isSet);

  const toggleFlag = async (): Promise<void> => {
    // On failure the state stays as it was and the admin can try again.
    setIsPending(true);
    await saveRecipeFlag(props.slug, props.flag, !props.isSet);
    setIsPending(false);
  };

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
        class={styles.button}
        classList={{
          [styles.active]: props.isSet,
          [config().activeClass]: props.isSet,
        }}
        aria-pressed={props.isSet}
        aria-label={config().getLabel(props.name, props.isSet)}
        disabled={isPending()}
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
