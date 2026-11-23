import { type Component, Loading, Match, Show, Switch } from "solid-js";
import { AdminConfirmDialog } from "~/app/admin/AdminConfirmDialog.tsx";
import { getSourceImageUrl } from "~/shared/recipeImage.ts";
import { backHrefFrom } from "./backHref.ts";
import { createRecipePage } from "./createRecipePage.ts";
import { RecipeBadges } from "./RecipeBadges.tsx";
import { RecipeBody } from "./RecipeBody.tsx";
import { RecipeHeader } from "./RecipeHeader.tsx";
import { RecipeImage } from "./RecipeImage.tsx";
import { RecipeNavActions } from "./RecipeNavActions.tsx";
import styles from "./RecipePage.module.css";
import { RecipePageLayout } from "./RecipePageLayout.tsx";
import { RecipeVideo } from "./RecipeVideo.tsx";
import { recipePageStrings } from "./strings.ts";

type RecipePageProps = {
  slug: string;
  // The router state the list left, for the way back.
  navState: unknown;
};

export const RecipePage: Component<RecipePageProps> = (props) => {
  const page = createRecipePage(() => props.slug);

  return (
    <Loading>
      <Show
        when={page.recipe()}
        fallback={
          <div class={styles.notFound}>
            <h1>{recipePageStrings.notFound}</h1>
            <a href="/">{recipePageStrings.backToList}</a>
          </div>
        }
      >
        {(recipeData) => (
          <RecipePageLayout
            closeHref={backHrefFrom(props.navState)}
            closeLabel={recipePageStrings.backToList}
            closeIcon="arrow_back"
            isLogoShown={false}
            actions={
              <RecipeNavActions
                slug={props.slug}
                recipe={recipeData()}
                isAdmin={page.isAdmin()}
                isDesktop={page.isDesktop()}
                admin={page.admin}
                recipeCollections={page.recipeCollections}
                openSheet={page.openSheet()}
                onOpenSheetChange={page.setOpenSheet}
              />
            }
          >
            <RecipeHeader
              recipe={recipeData()}
              scale={page.scale}
              badges={
                page.hasBadges() ? (
                  <RecipeBadges
                    verdict={page.admin.verdict()}
                    isShouldDeleteShown={page.isShouldDeleteShown()}
                    onVerdictClick={
                      page.canOpenSheetFromBadge() ? () => page.setOpenSheet("more") : undefined
                    }
                  />
                ) : undefined
              }
            />
            <RecipeBody recipe={recipeData()} scale={page.scale} />
            <Switch>
              <Match when={recipeData().video_url}>
                {(videoUrl) => <RecipeVideo src={videoUrl()} title={recipeData().title} />}
              </Match>
              <Match when={getSourceImageUrl(recipeData())}>
                {(imageUrl) => <RecipeImage src={imageUrl()} title={recipeData().title} />}
              </Match>
            </Switch>
            <AdminConfirmDialog actions={page.admin} />
          </RecipePageLayout>
        )}
      </Show>
    </Loading>
  );
};
