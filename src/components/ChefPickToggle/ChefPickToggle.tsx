import { revalidate } from "@solidjs/router";
import { type Component, createSignal, Show } from "solid-js";
import { strings } from "~/constants/strings.ts";
import { useCurrentUser } from "~/contexts/CurrentUserContext.tsx";
import { getRecipeBySlug, getRecipesList } from "~/lib/recipeQueries.ts";
import styles from "~/styles/iconToggleButton.module.css";

type ChefPickToggleProps = {
  slug: string;
  name: string;
  isChefPick: boolean;
};

// Admin-only. Not optimistic: the badge updates once the server has saved the
// change and the recipe queries are refetched.
const ChefPickToggle: Component<ChefPickToggleProps> = (props) => {
  const { isAdmin } = useCurrentUser();
  const [isPending, setIsPending] = createSignal(false);

  const handleClick = async () => {
    setIsPending(true);
    try {
      const response = await fetch(`/api/chef-pick/${props.slug}`, {
        method: props.isChefPick ? "DELETE" : "PUT",
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

  return (
    <Show when={isAdmin()}>
      <button
        type="button"
        class={styles.button}
        classList={{
          [styles.active]: props.isChefPick,
          [styles.chefPickActive]: props.isChefPick,
        }}
        aria-pressed={props.isChefPick}
        aria-label={
          props.isChefPick ? strings.chefPick.remove(props.name) : strings.chefPick.add(props.name)
        }
        disabled={isPending()}
        onClick={handleClick}
      >
        <span class="material-symbols-outlined" aria-hidden="true">
          chef_hat
        </span>
      </button>
    </Show>
  );
};

export default ChefPickToggle;
