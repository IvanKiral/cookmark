import { render } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";
import type { Recipe } from "~/types/Recipe";
import RecipeList from "./RecipeList";

describe("<RecipeList />", () => {
	it("renders multiple recipes", () => {
		const mockRecipes: ReadonlyArray<Recipe> = [
			{
				id: "1",
				name: "Pasta Carbonara",
				difficulty: "Medium",
				time: "30 min",
				total_time: 30,
			},
			{
				id: "2",
				name: "Caesar Salad",
				difficulty: "Easy",
				time: "15 min",
				total_time: 15,
			},
			{
				id: "3",
				name: "Beef Wellington",
				difficulty: "Hard",
				time: "2 hours",
				total_time: 120,
			},
		];

		const mockOnRecipeSelect = vi.fn();
		const { getByText } = render(() => (
			<RecipeList recipes={mockRecipes} onRecipeSelect={mockOnRecipeSelect} />
		));

		expect(getByText("Pasta Carbonara")).toBeInTheDocument();
		expect(getByText("Caesar Salad")).toBeInTheDocument();
		expect(getByText("Beef Wellington")).toBeInTheDocument();
	});

	it("renders empty list when no recipes provided", () => {
		const mockOnRecipeSelect = vi.fn();
		const { container } = render(() => (
			<RecipeList recipes={[]} onRecipeSelect={mockOnRecipeSelect} />
		));

		expect(container.firstChild).toBeInTheDocument();
		expect(container.firstChild?.childNodes).toHaveLength(0);
	});
});
