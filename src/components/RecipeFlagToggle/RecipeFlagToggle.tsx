import { revalidate } from "@solidjs/router";
import { type Component, createSignal, Show } from "solid-js";
import ConfirmDialog from "~/components/ConfirmDialog/ConfirmDialog.tsx";
import { type RecipeFlag, recipeFlagEndpoints } from "~/constants/recipeFlags.ts";
import { strings } from "~/constants/strings.ts";
import { useCurrentUser } from "~/contexts/CurrentUserContext.tsx";
import { getRecipeBySlug, getRecipesList } from "~/lib/recipeQueries.ts";
import styles from "~/styles/iconToggleButton.module.css";

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
  "chef-pick": {
    icon: "chef_hat",
    activeClass: styles.chefPickActive,
    getLabel: (name, isSet) => (isSet ? strings.chefPick.remove(name) : strings.chefPick.add(name)),
    getConfirmation: (name, isSet) =>
      isSet
        ? {
            title: strings.chefPick.confirmRemoveTitle,
            description: strings.chefPick.confirmRemoveDescription(name),
            confirmLabel: strings.chefPick.confirmRemove,
          }
        : undefined,
  },
  "should-delete": {
    icon: "delete",
    activeClass: styles.shouldDeleteActive,
    getLabel: (name, isSet) =>
      isSet ? strings.shouldDelete.remove(name) : strings.shouldDelete.add(name),
    getConfirmation: (name, isSet) =>
      isSet
        ? {
            title: strings.shouldDelete.confirmRemoveTitle,
            description: strings.shouldDelete.confirmRemoveDescription(name),
            confirmLabel: strings.shouldDelete.confirmRemove,
          }
        : {
            title: strings.shouldDelete.confirmAddTitle,
            description: strings.shouldDelete.confirmAddDescription(name),
            confirmLabel: strings.shouldDelete.confirmAdd,
          },
  },
};

// Admin-only. Not optimistic: the badge updates once the server has saved the
// change and the recipe queries are refetched.
const RecipeFlagToggle: Component<RecipeFlagToggleProps> = (props) => {
  const { isAdmin } = useCurrentUser();
  const [isPending, setIsPending] = createSignal(false);
  const [isConfirming, setIsConfirming] = createSignal(false);
  const config = () => flagConfigs[props.flag];
  const confirmation = () => config().getConfirmation(props.name, props.isSet);

  const toggleFlag = async (): Promise<void> => {
    setIsPending(true);
    try {
      const response = await fetch(`${recipeFlagEndpoints[props.flag]}/${props.slug}`, {
        method: props.isSet ? "DELETE" : "PUT",
      });
      if (response.ok) {
        await revalidate([getRecipesList.key, getRecipeBySlug.key]);
      }
    } catch {
      // Leave the state as it was; the admin can try again.
    } finally {
      setIsPending(false);
    }
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

export default RecipeFlagToggle;
