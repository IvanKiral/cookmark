import { describe, it, expect } from 'vitest';
import { render } from "@solidjs/testing-library";
import RecipeListItem from "./RecipeListItem";

describe("<RecipeListItem />", () => {
  it("renders recipe item with all props", () => {
    const { getByText } = render(() => 
      <RecipeListItem 
        name="Pasta Carbonara" 
        difficulty="Medium" 
        time="30 min" 
      />
    );
    
    expect(getByText("Pasta Carbonara")).toBeInTheDocument();
    expect(getByText("Medium")).toBeInTheDocument();
    expect(getByText("30 min")).toBeInTheDocument();
  });

  it("renders with different difficulty levels", () => {
    const { getByText } = render(() => 
      <RecipeListItem 
        name="Simple Salad" 
        difficulty="Easy" 
        time="10 min" 
      />
    );
    
    expect(getByText("Easy")).toBeInTheDocument();
  });
});