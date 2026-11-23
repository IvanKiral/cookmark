import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Recipe } from "~/shared/recipe.ts";
import { createRecipeScale } from "./createRecipeScale.ts";
import { RecipeBody } from "./RecipeBody.tsx";
import { RecipeHeader } from "./RecipeHeader.tsx";

vi.mock("~/app/user/CurrentUserContext.tsx", () => ({
  useCurrentUser: () => ({ isAdmin: () => false }),
}));

const recipe: Recipe = {
  title: "Meatballs",
  description: "Small meatballs.",
  prep_time: 30,
  cook_time: 20,
  total_time: 50,
  servings: 4,
  ingredients: [
    { name: "minced beef", amount: 250, unit: "g" },
    { name: "breadcrumbs", amount: 40, unit: "g" },
    { name: "egg", amount: 1, unit: null },
    { name: "salt", amount: "a pinch", unit: null },
    { name: "pepper", amount: null, unit: null },
  ],
  instructions: [{ name: "Main", steps: ["Mix."] }],
  tags: [],
  difficulty: "easy",
  cuisine: null,
};

const renderPage = (data: Recipe = recipe) =>
  render(() => {
    const scale = createRecipeScale(
      () => "meatballs",
      () => data,
    );
    return (
      <>
        <RecipeHeader recipe={data} scale={scale} />
        <RecipeBody recipe={data} scale={scale} />
      </>
    );
  });

const amountButton = (name: string): HTMLElement =>
  screen.getByRole("button", { name: new RegExp(`^Change amount of ${name},`) });

const typeAmount = (input: HTMLElement, value: string): void => {
  fireEvent.input(input, { target: { value } });
};

describe("ingredient scaling", () => {
  afterEach(() => {
    cleanup();
  });

  it("scales the other amounts live while typing, rounded by unit", () => {
    renderPage();
    fireEvent.click(amountButton("minced beef"));
    const input = screen.getByRole("textbox", { name: "Amount of minced beef" });
    expect(input).toHaveValue("250");
    expect(input).toHaveFocus();

    typeAmount(input, "400");
    expect(amountButton("breadcrumbs")).toHaveTextContent("65 g");
    expect(amountButton("egg")).toHaveTextContent("1.5");
    expect(screen.getByText(/Scaled to/)).toHaveTextContent("Scaled to 400 g minced beef (×1.6)");
    expect(screen.getByRole("button", { name: /servings/ })).toHaveTextContent("6");
  });

  it("accepts a comma and shows the original amounts for empty, zero or text input", () => {
    renderPage();
    fireEvent.click(amountButton("egg"));
    const input = screen.getByRole("textbox", { name: "Amount of egg" });

    typeAmount(input, "1,5");
    expect(amountButton("minced beef")).toHaveTextContent("380 g");

    for (const value of ["", "0", "abc"]) {
      typeAmount(input, value);
      expect(amountButton("minced beef")).toHaveTextContent("250 g");
      expect(screen.queryByText(/Scaled to/)).not.toBeInTheDocument();
    }
  });

  it("closes the input on Enter and keeps the typed value", () => {
    renderPage();
    fireEvent.click(amountButton("minced beef"));
    const input = screen.getByRole("textbox", { name: "Amount of minced beef" });
    typeAmount(input, "500");
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.blur(input);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(amountButton("minced beef")).toHaveTextContent("500 g");
    expect(amountButton("breadcrumbs")).toHaveTextContent("80 g");
  });

  it("steps with the arrow keys and restores the previous value on Esc", () => {
    renderPage();
    fireEvent.click(amountButton("minced beef"));
    const input = screen.getByRole("textbox", { name: "Amount of minced beef" });
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input).toHaveValue("260");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input).toHaveValue("240");

    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(amountButton("minced beef")).toHaveTextContent("250 g");
    expect(screen.queryByText(/Scaled to/)).not.toBeInTheDocument();
  });

  it("resets every amount", () => {
    renderPage();
    fireEvent.click(amountButton("minced beef"));
    const input = screen.getByRole("textbox");
    typeAmount(input, "500");
    fireEvent.blur(input);
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(amountButton("minced beef")).toHaveTextContent("250 g");
    expect(amountButton("breadcrumbs")).toHaveTextContent("40 g");
    expect(screen.queryByText(/Scaled to/)).not.toBeInTheDocument();
  });

  it("shows text and missing amounts as plain text, not buttons", () => {
    renderPage();
    expect(screen.getByText("a pinch salt")).toBeInTheDocument();
    expect(screen.getByText("pepper")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /salt|pepper/ })).not.toBeInTheDocument();
  });

  it("scales by servings", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Change number of servings, now 4" }));
    typeAmount(screen.getByRole("textbox", { name: "Number of servings" }), "8");
    expect(amountButton("minced beef")).toHaveTextContent("500 g");
    expect(screen.getByText(/Scaled to/)).toHaveTextContent("Scaled to 8 servings (×2)");
  });

  it("hides servings, the hint and amount buttons when there is nothing to scale", () => {
    renderPage({
      ...recipe,
      servings: null,
      ingredients: [{ name: "salt", amount: "a pinch", unit: null }],
    });
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByText(/any amount/)).not.toBeInTheDocument();
  });
});
