import { useLocation, useParams } from "@solidjs/router";
import type { Component } from "solid-js";
import { RecipePage } from "~/app/recipe-page/RecipePage.tsx";

const RecipeRoute: Component = () => {
  const params = useParams<{ slug: string }>();
  const location = useLocation();
  return <RecipePage slug={params.slug} navState={location.state} />;
};

export default RecipeRoute;
