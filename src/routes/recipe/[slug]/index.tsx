import { useLocation, useParams } from "@solidjs/router";
import { type Component, createMemo, Loading, Match, Show, Switch } from "solid-js";
import { getRecipeBySlug } from "~/app/api/recipeQueries.ts";
import { createRecipeScale } from "~/app/recipe-page/createRecipeScale.ts";
import { RecipeBody } from "~/app/recipe-page/RecipeBody.tsx";
import { RecipeHeader } from "~/app/recipe-page/RecipeHeader.tsx";
import { RecipeImage } from "~/app/recipe-page/RecipeImage.tsx";
import { RecipeNavActions } from "~/app/recipe-page/RecipeNavActions.tsx";
import { RecipePageLayout } from "~/app/recipe-page/RecipePageLayout.tsx";
import { RecipeVideo } from "~/app/recipe-page/RecipeVideo.tsx";
import { recipePageStrings } from "~/app/recipe-page/strings.ts";
import { useCurrentUser } from "~/app/user/CurrentUserContext.tsx";
import { getSourceImageUrl } from "~/shared/recipeImage.ts";
import styles from "./index.module.css";

type RecipeNavState = {
  fromSearch?: string;
};

const RecipePage: Component = () => {
  const params = useParams<{ slug: string }>();
  const location = useLocation();
  const recipe = createMemo(() => getRecipeBySlug(params.slug));
  const { isAdmin } = useCurrentUser();
  const scale = createRecipeScale(() => params.slug, recipe);

  // Back to the list with the search and filters it had.
  const backHref = (): string => {
    const state = location.state as RecipeNavState | null;
    return state?.fromSearch ? `/${state.fromSearch}` : "/";
  };

  return (
    <Loading>
      <Show
        when={recipe()}
        fallback={
          <div class={styles.notFound}>
            <h1>{recipePageStrings.notFound}</h1>
            <a href="/">{recipePageStrings.backToList}</a>
          </div>
        }
      >
        {(recipeData) => (
          <RecipePageLayout
            closeHref={backHref()}
            closeLabel={recipePageStrings.backToList}
            // Admins get extra action buttons; the logo would crowd them on phones.
            isLogoShown={!isAdmin()}
            actions={<RecipeNavActions slug={params.slug} recipe={recipeData()} />}
          >
            <RecipeHeader recipe={recipeData()} scale={scale} />
            <RecipeBody recipe={recipeData()} scale={scale} />
            <Switch>
              <Match when={recipeData().video_url}>
                {(videoUrl) => <RecipeVideo src={videoUrl()} title={recipeData().title} />}
              </Match>
              <Match when={getSourceImageUrl(recipeData())}>
                {(imageUrl) => <RecipeImage src={imageUrl()} title={recipeData().title} />}
              </Match>
            </Switch>
          </RecipePageLayout>
        )}
      </Show>
    </Loading>
  );
};

export default RecipePage;
