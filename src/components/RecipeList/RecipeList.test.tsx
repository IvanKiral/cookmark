import { describe, it, expect } from 'vitest';
import { render } from "@solidjs/testing-library";
import RecipeList from "./RecipeList";
import type { Recipe } from "~/types/Recipe";

describe("<RecipeList />", () => {
  it("renders multiple recipes", () => {
    const mockRecipes: Recipe[] = [
      { id: "1", name: "Pasta Carbonara", difficulty: "Medium", time: "30 min" },
      { id: "2", name: "Caesar Salad", difficulty: "Easy", time: "15 min" },
      { id: "3", name: "Beef Wellington", difficulty: "Hard", time: "2 hours" }
    ];

    const { getByText } = render(() => <RecipeList recipes={mockRecipes} />);
    
    expect(getByText("Pasta Carbonara")).toBeInTheDocument();
    expect(getByText("Caesar Salad")).toBeInTheDocument();
    expect(getByText("Beef Wellington")).toBeInTheDocument();
  });

  it("renders empty list when no recipes provided", () => {
    const { container } = render(() => <RecipeList recipes={[]} />);
    
    expect(container.firstChild).toBeInTheDocument();
    expect(container.firstChild?.childNodes).toHaveLength(0);
  });
});