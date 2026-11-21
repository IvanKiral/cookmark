import { useLocation } from "@solidjs/router";
import { type Component, Show } from "solid-js";
import { RecipeFlagToggle } from "~/app/admin/RecipeFlagToggle.tsx";
import { RecipeVerdictToggle } from "~/app/admin/RecipeVerdictToggle.tsx";
import { adminStrings } from "~/app/admin/strings.ts";
import { MarkButton } from "~/app/marks/MarkButton.tsx";
import iconButtonStyles from "~/app/ui/iconToggleButton.module.css";
import { toLinkState } from "~/app/ui/linkState.ts";
import { useCurrentUser } from "~/app/user/CurrentUserContext.tsx";
import type { Recipe } from "~/shared/recipe.ts";

type RecipeNavActionsProps = {
  slug: string;
  recipe: Recipe;
};

// The admin controls render nothing for viewers; everyone gets the marks.
export const RecipeNavActions: Component<RecipeNavActionsProps> = (props) => {
  const location = useLocation();
  const { isAdmin } = useCurrentUser();

  return (
    <>
      <Show when={isAdmin()}>
        {/* biome-ignore lint/a11y/useAnchorContent: the aria-label names the link, the icon is decorative */}
        <a
          href={`/recipe/${props.slug}/edit`}
          state={toLinkState(location.state)}
          class={iconButtonStyles.button}
          aria-label={adminStrings.edit.edit(props.recipe.title)}
        >
          <span class="material-symbols-outlined" aria-hidden="true">
            edit
          </span>
        </a>
      </Show>
      <RecipeVerdictToggle
        slug={props.slug}
        name={props.recipe.title}
        verdict={props.recipe.verdict}
      />
      <RecipeFlagToggle
        flag="should-delete"
        slug={props.slug}
        name={props.recipe.title}
        isSet={props.recipe.should_delete ?? false}
      />
      <MarkButton mark="favorite" slug={props.slug} name={props.recipe.title} />
      <MarkButton mark="to-try" slug={props.slug} name={props.recipe.title} />
    </>
  );
};
