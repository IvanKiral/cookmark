import { A, createAsync, useLocation, useNavigate, useParams } from "@solidjs/router";
import { type Component, Match, Show, Suspense, Switch } from "solid-js";
import RecipeEditForm from "~/components/RecipeEditForm/RecipeEditForm.tsx";
import { strings } from "~/constants/strings.ts";
import { useCurrentUser } from "~/contexts/CurrentUserContext.tsx";
import { getRecipeBySlug } from "~/lib/recipeQueries.ts";
import { getInitialRecipeEdit } from "~/utils/recipeEdit.ts";
import styles from "./edit.module.css";
import pageStyles from "./index.module.css";

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
    <div class={pageStyles.page}>
      <nav class={pageStyles.nav}>
        <div class={pageStyles.navInner}>
          <div class={pageStyles.navLeading}>
            <A
              href={recipeHref()}
              state={location.state}
              class={`${pageStyles.navButton} ${pageStyles.closeButton}`}
              aria-label={strings.recipeEdit.backToRecipe}
            >
              <span class="material-symbols-outlined">close</span>
            </A>
            <A href="/" class={pageStyles.logo}>
              Cookmark
            </A>
          </div>
        </div>
      </nav>

      <main class={`${pageStyles.main} ${styles.main}`}>
        <Suspense>
          <Show when={isLoaded()}>
            <Switch>
              <Match when={!isAdmin()}>
                <div class={styles.message}>
                  <p>{strings.recipeEdit.notAllowed}</p>
                  <A href={recipeHref()}>{strings.recipeEdit.backToRecipe}</A>
                </div>
              </Match>
              <Match when={recipe()}>
                {(recipeData) => (
                  <>
                    <h1 class={styles.title}>{strings.recipeEdit.pageTitle}</h1>
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
                  <p>{strings.recipe.notFound}</p>
                  <A href="/">{strings.recipe.backToList}</A>
                </div>
              </Match>
            </Switch>
          </Show>
        </Suspense>
      </main>
    </div>
  );
};

export default RecipeEditPage;
