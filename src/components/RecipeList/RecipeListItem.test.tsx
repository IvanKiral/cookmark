import { render } from "@solidjs/testing-library";
import type { JSX } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import RecipeListItem from "./RecipeListItem.jsx";

vi.mock("@solidjs/router", () => ({
  A: (props: { href: string; class: string; children: JSX.Element }) => (
    <a href={props.href} class={props.class}>
      {props.children}
    </a>
  ),
  useParams: () => ({ lang: "en" }),
}));

describe("<RecipeListItem />", () => {
  it("renders recipe item with all props", () => {
    const { getByText } = render(() => (
      <RecipeListItem
        urlSlug="pasta-carbonara"
        name="Pasta Carbonara"
        difficulty="Medium"
        time="30 min"
      />
    ));

    expect(getByText("Pasta Carbonara")).toBeInTheDocument();
    expect(getByText("Medium")).toBeInTheDocument();
    expect(getByText("30 min")).toBeInTheDocument();
  });

  it("renders with different difficulty levels", () => {
    const { getByText } = render(() => (
      <RecipeListItem urlSlug="simple-salad" name="Simple Salad" difficulty="Easy" time="10 min" />
    ));

    expect(getByText("Easy")).toBeInTheDocument();
  });

  it("renders as a link to the recipe page", () => {
    const { container } = render(() => (
      <RecipeListItem urlSlug="test-recipe" name="Test Recipe" difficulty="Hard" time="60 min" />
    ));

    const link = container.querySelector("a");
    expect(link).toBeTruthy();
    expect(link?.getAttribute("href")).toBe("/en/recipe/test-recipe");
  });
});
