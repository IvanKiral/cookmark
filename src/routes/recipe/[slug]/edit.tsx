import { A, createAsync, useLocation, useNavigate, useParams } from "@solidjs/router";
import { type Component, Match, Show, Suspense, Switch } from "solid-js";
import { RecipeEditForm } from "~/app/admin/RecipeEditForm.tsx";
import { adminStrings } from "~/app/admin/strings.ts";
import { getRecipeBySlug } from "~/app/api/recipeQueries.ts";
import { RecipePageLayout } from "~/app/recipe-page/RecipePageLayout.tsx";
import { recipePageStrings } from "~/app/recipe-page/strings.ts";
import { useCurrentUser } from "~/app/user/CurrentUserContext.tsx";
import { getInitialRecipeEdit } from "~/shared/recipeEdit.ts";
import styles from "./edit.module.css";

// Admin-only. The server enforces the role on save; this page only decides
// whether to show the form.
const RecipeEditPage: Component = () => {
  const params = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const recipe = createAsync(() => getRecipeBySlug(params.slug));
  const { isAdmin, isLoaded } = useCurrentUser();

  const recipeHref = (): string => `/recipe/${params.slug}`;

  // Replaces the edit page in history, so Back from the recipe doesn't return
  // here. The state keeps the recipe page's link back to the filtered list.
  const handleDone = (): void => {
    navigate(recipeHref(), { replace: true, state: location.state });
  };

  return (
    <RecipePageLayout
      closeHref={recipeHref()}
      closeState={location.state}
      closeLabel={adminStrings.edit.backToRecipe}
      isLogoShown
      mainClass={styles.main}
    >
      <Suspense>
        <Show when={isLoaded()}>
          <Switch>
            <Match when={!isAdmin()}>
              <div class={styles.message}>
                <p>{adminStrings.edit.notAllowed}</p>
                <A href={recipeHref()}>{adminStrings.edit.backToRecipe}</A>
              </div>
            </Match>
            <Match when={recipe()}>
              {(recipeData) => (
                <>
                  <h1 class={styles.title}>{adminStrings.edit.pageTitle}</h1>
                  <RecipeEditForm
                    slug={params.slug}
                    initial={getInitialRecipeEdit(recipeData())}
                    onSaved={handleDone}
                    onCancel={handleDone}
                  />
                </>
              )}
            </Match>
            <Match when={true}>
              <div class={styles.message}>
                <p>{recipePageStrings.notFound}</p>
                <A href="/">{recipePageStrings.backToList}</A>
              </div>
            </Match>
          </Switch>
        </Show>
      </Suspense>
    </RecipePageLayout>
  );
};

export default RecipeEditPage;
