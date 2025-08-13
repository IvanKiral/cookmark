import { render } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";
import RecipeListItem from "./RecipeListItem.jsx";

describe("<RecipeListItem />", () => {
  it("renders recipe item with all props", () => {
    const mockOnSelect = vi.fn();
    const { getByText } = render(() => (
      <RecipeListItem
        id="1"
        name="Pasta Carbonara"
        difficulty="Medium"
        time="30 min"
        onSelect={mockOnSelect}
      />
    ));

    expect(getByText("Pasta Carbonara")).toBeInTheDocument();
    expect(getByText("Medium")).toBeInTheDocument();
    expect(getByText("30 min")).toBeInTheDocument();
  });

  it("renders with different difficulty levels", () => {
    const mockOnSelect = vi.fn();
    const { getByText } = render(() => (
      <RecipeListItem
        id="2"
        name="Simple Salad"
        difficulty="Easy"
        time="10 min"
        onSelect={mockOnSelect}
      />
    ));

    expect(getByText("Easy")).toBeInTheDocument();
  });
});
