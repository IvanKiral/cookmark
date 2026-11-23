import { useLocation, useParams } from "@solidjs/router";
import { type Component, createMemo, createSignal, Loading, Match, Show, Switch } from "solid-js";
import { AdminConfirmDialog } from "~/app/admin/AdminConfirmDialog.tsx";
import { createRecipeAdminActions } from "~/app/admin/createRecipeAdminActions.ts";
import { getRecipeBySlug } from "~/app/api/recipeQueries.ts";
import { createRecipeScale } from "~/app/recipe-page/createRecipeScale.ts";
import { RecipeBadges } from "~/app/recipe-page/RecipeBadges.tsx";
import { RecipeBody } from "~/app/recipe-page/RecipeBody.tsx";
import { RecipeHeader } from "~/app/recipe-page/RecipeHeader.tsx";
import { RecipeImage } from "~/app/recipe-page/RecipeImage.tsx";
import { RecipeNavActions } from "~/app/recipe-page/RecipeNavActions.tsx";
import { RecipePageLayout } from "~/app/recipe-page/RecipePageLayout.tsx";
import { RecipeVideo } from "~/app/recipe-page/RecipeVideo.tsx";
import { recipePageStrings } from "~/app/recipe-page/strings.ts";
import { createMediaQuery } from "~/app/ui/createMediaQuery.ts";
import { useCurrentUser } from "~/app/user/CurrentUserContext.tsx";
import { getSourceImageUrl } from "~/shared/recipeImage.ts";
import styles from "./index.module.css";

type RecipeNavState = {
  fromSearch?: string;
};

const DESKTOP_QUERY = "(min-width: 1024px)";

const RecipePage: Component = () => {
  const params = useParams<{ slug: string }>();
  const location = useLocation();
  const recipe = createMemo(() => getRecipeBySlug(params.slug));
  const { isAdmin } = useCurrentUser();
  const isDesktop = createMediaQuery(DESKTOP_QUERY);
  const scale = createRecipeScale(() => params.slug, recipe);
  const admin = createRecipeAdminActions({
    slug: () => params.slug,
    name: () => recipe()?.title ?? "",
    verdict: () => recipe()?.verdict,
    isShouldDelete: () => recipe()?.should_delete ?? false,
  });
  const [isSheetOpen, setIsSheetOpen] = createSignal(false);

  // Back to the list with the search and filters it had.
  const backHref = (): string => {
    const state = location.state as RecipeNavState | null;
    return state?.fromSearch ? `/${state.fromSearch}` : "/";
  };

  const isShouldDeleteShown = (): boolean => isAdmin() && admin.isShouldDelete();
  const hasBadges = (): boolean => admin.verdict() !== undefined || isShouldDeleteShown();

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
            closeIcon="arrow_back"
            isLogoShown={false}
            actions={
              <RecipeNavActions
                slug={params.slug}
                recipe={recipeData()}
                isAdmin={isAdmin()}
                isDesktop={isDesktop()}
                isMoreShown={isAdmin()}
                admin={admin}
                isSheetOpen={isSheetOpen()}
                onSheetOpenChange={setIsSheetOpen}
              />
            }
          >
            <RecipeHeader
              recipe={recipeData()}
              scale={scale}
              badges={
                hasBadges() ? (
                  <RecipeBadges
                    verdict={admin.verdict()}
                    isShouldDeleteShown={isShouldDeleteShown()}
                    onVerdictClick={
                      isAdmin() && !isDesktop() ? () => setIsSheetOpen(true) : undefined
                    }
                  />
                ) : undefined
              }
            />
            <RecipeBody recipe={recipeData()} scale={scale} />
            <Switch>
              <Match when={recipeData().video_url}>
                {(videoUrl) => <RecipeVideo src={videoUrl()} title={recipeData().title} />}
              </Match>
              <Match when={getSourceImageUrl(recipeData())}>
                {(imageUrl) => <RecipeImage src={imageUrl()} title={recipeData().title} />}
              </Match>
            </Switch>
            <AdminConfirmDialog actions={admin} />
          </RecipePageLayout>
        )}
      </Show>
    </Loading>
  );
};

export default RecipePage;
