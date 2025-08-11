import { render } from "@solidjs/testing-library";
import { describe, expect, it } from "vitest";
import type { RecipeData } from "~/types/Recipe";
import RecipeDetail from "./RecipeDetail";

describe("<RecipeDetail />", () => {
	const mockRecipe: RecipeData = {
		title: "Test Recipe",
		description: "A delicious test recipe",
		difficulty: "medium",
		prep_time: 15,
		cook_time: 30,
		total_time: 45,
		servings: 4,
		cuisine: "Italian",
		tags: ["pasta", "quick"],
		ingredients: [
			{ name: "Pasta", amount: "500", unit: "g" },
			{ name: "Tomato sauce", amount: "400", unit: "ml" },
		],
		instructions: ["Boil water", "Cook pasta"],
	};

	it("renders recipe with all details", () => {
		const { getByText } = render(() => <RecipeDetail recipe={mockRecipe} />);

		expect(getByText("Test Recipe")).toBeInTheDocument();
		expect(getByText("A delicious test recipe")).toBeInTheDocument();
		expect(getByText("Medium")).toBeInTheDocument();
		expect(getByText("Italian")).toBeInTheDocument();
	});

	it("renders ingredients section", () => {
		const { getByText } = render(() => <RecipeDetail recipe={mockRecipe} />);

		expect(getByText("Ingredients")).toBeInTheDocument();
		expect(getByText("500 g Pasta")).toBeInTheDocument();
		expect(getByText("400 ml Tomato sauce")).toBeInTheDocument();
	});

	it("renders instructions section", () => {
		const { getByText } = render(() => <RecipeDetail recipe={mockRecipe} />);

		expect(getByText("Instructions")).toBeInTheDocument();
		expect(getByText("Boil water")).toBeInTheDocument();
		expect(getByText("Cook pasta")).toBeInTheDocument();
	});

	it("renders time information", () => {
		const { getByText } = render(() => <RecipeDetail recipe={mockRecipe} />);

		expect(getByText("Prep:")).toBeInTheDocument();
		expect(getByText("Cook:")).toBeInTheDocument();
		expect(getByText("Total:")).toBeInTheDocument();
		expect(getByText("4 servings")).toBeInTheDocument();
	});

	it("renders tags", () => {
		const { getByText } = render(() => <RecipeDetail recipe={mockRecipe} />);

		expect(getByText("pasta")).toBeInTheDocument();
		expect(getByText("quick")).toBeInTheDocument();
	});
});
