import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Recipe } from "~/types/Recipe";
import SearchBar from "./SearchBar";

const mockRecipes: Recipe[] = [
	{
		id: "1",
		name: "Lemon Herb Chicken",
		difficulty: "Medium",
		time: "35 min",
		total_time: 35,
		tags: ["chicken", "herbs"],
	},
	{
		id: "2",
		name: "Quinoa Salad",
		difficulty: "Easy",
		time: "20 min",
		total_time: 20,
		tags: ["quinoa", "salad"],
	},
	{
		id: "3",
		name: "Chicken Caesar Salad",
		difficulty: "Easy",
		time: "15 min",
		total_time: 15,
		tags: ["chicken", "salad"],
	},
];

describe("SearchBar", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders search input with placeholder", () => {
		const mockOnSearchResults = vi.fn();
		render(() => (
			<SearchBar recipes={mockRecipes} onSearchResults={mockOnSearchResults} />
		));

		const searchInput = screen.getByPlaceholderText("Search recipes...");
		expect(searchInput).toBeInTheDocument();
	});

	it("calls onSearchResults with filtered results when searching", () => {
		const mockOnSearchResults = vi.fn();
		render(() => (
			<SearchBar recipes={mockRecipes} onSearchResults={mockOnSearchResults} />
		));

		const searchInput = screen.getByPlaceholderText("Search recipes...");
		fireEvent.input(searchInput, { target: { value: "chicken" } });

		expect(mockOnSearchResults).toHaveBeenCalled();
	});

	it("shows clear button when there is search text", () => {
		const mockOnSearchResults = vi.fn();
		render(() => (
			<SearchBar recipes={mockRecipes} onSearchResults={mockOnSearchResults} />
		));

		const searchInput = screen.getByPlaceholderText("Search recipes...");
		fireEvent.input(searchInput, { target: { value: "chicken" } });

		const clearButton = screen.getByRole("button");
		expect(clearButton).toBeInTheDocument();
	});

	it("clears search when clear button is clicked", () => {
		const mockOnSearchResults = vi.fn();
		render(() => (
			<SearchBar recipes={mockRecipes} onSearchResults={mockOnSearchResults} />
		));

		const searchInput = screen.getByPlaceholderText("Search recipes...");
		fireEvent.input(searchInput, { target: { value: "chicken" } });

		const clearButton = screen.getByRole("button");
		fireEvent.click(clearButton);

		expect((searchInput as HTMLInputElement).value).toBe("");
	});
});
