import { cleanup, render, screen } from "@solidjs/testing-library";
import type { JSX } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";
import RecipeListItem from "./RecipeListItem.jsx";

vi.mock("@solidjs/router", () => ({
  A: (props: { href: string; class: string; children: JSX.Element }) => (
    <a href={props.href} class={props.class}>
      {props.children}
    </a>
  ),
  useLocation: () => ({ search: "" }),
}));

vi.mock("~/contexts/MarksContext.tsx", () => ({
  useMarks: () => ({
    isMarked: () => false,
    toggle: () => {},
  }),
}));

describe("<RecipeListItem />", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders recipe item with all props", () => {
    const { getByText } = render(() => (
      <RecipeListItem
        urlSlug="pasta-carbonara"
        name="Pasta Carbonara"
        difficulty="Medium"
        time="30 min"
        isChefPick={false}
      />
    ));

    expect(getByText("Pasta Carbonara")).toBeInTheDocument();
    expect(getByText("Medium")).toBeInTheDocument();
    expect(getByText("30 min")).toBeInTheDocument();
  });

  it("renders with different difficulty levels", () => {
    const { getByText } = render(() => (
      <RecipeListItem
        urlSlug="simple-salad"
        name="Simple Salad"
        difficulty="Easy"
        time="10 min"
        isChefPick={false}
      />
    ));

    expect(getByText("Easy")).toBeInTheDocument();
  });

  it("renders as a link to the recipe page", () => {
    const { container } = render(() => (
      <RecipeListItem
        urlSlug="test-recipe"
        name="Test Recipe"
        difficulty="Hard"
        time="60 min"
        isChefPick={false}
      />
    ));

    const link = container.querySelector("a");
    expect(link).toBeTruthy();
    expect(link?.getAttribute("href")).toBe("/recipe/test-recipe");
  });

  it("shows the Chef's pick badge for a picked recipe", () => {
    render(() => (
      <RecipeListItem urlSlug="soup" name="Soup" difficulty="Easy" time="20 min" isChefPick />
    ));
    expect(screen.getByText("Chef's pick")).toBeInTheDocument();
  });

  it("shows no Chef's pick badge for other recipes", () => {
    render(() => (
      <RecipeListItem
        urlSlug="cake"
        name="Cake"
        difficulty="Easy"
        time="20 min"
        isChefPick={false}
      />
    ));
    expect(screen.queryByText("Chef's pick")).not.toBeInTheDocument();
  });
});
