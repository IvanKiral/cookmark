import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Recipe } from "~/types/Recipe";
import SearchBar from "./SearchBar.jsx";

const mockRecipes: Recipe[] = [
  {
    id: "1",
    url_slug: "lemon_herb_chicken",
    name: "Lemon Herb Chicken",
    difficulty: "Medium",
    time: "35 min",
    total_time: 35,
    tags: ["chicken", "herbs"],
    created_at: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    url_slug: "quinoa_salad",
    name: "Quinoa Salad",
    difficulty: "Easy",
    time: "20 min",
    total_time: 20,
    tags: ["quinoa", "salad"],
    created_at: "2024-01-02T00:00:00.000Z",
  },
  {
    id: "3",
    url_slug: "chicken_caesar_salad",
    name: "Chicken Caesar Salad",
    difficulty: "Easy",
    time: "15 min",
    total_time: 15,
    tags: ["chicken", "salad"],
    created_at: "2024-01-03T00:00:00.000Z",
  },
];

describe("SearchBar", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders search input with placeholder", () => {
    const mockOnSearchResults = vi.fn();
    render(() => (
      <SearchBar recipes={mockRecipes} searchQuery="" onSearchChange={mockOnSearchResults} />
    ));

    const searchInput = screen.getByPlaceholderText("Search recipes...");
    expect(searchInput).toBeInTheDocument();
  });

  it("calls onSearchResults with filtered results when searching", () => {
    const mockOnSearchResults = vi.fn();
    render(() => (
      <SearchBar recipes={mockRecipes} searchQuery="" onSearchChange={mockOnSearchResults} />
    ));

    const searchInput = screen.getByPlaceholderText("Search recipes...");
    fireEvent.input(searchInput, { target: { value: "chicken" } });

    expect(mockOnSearchResults).toHaveBeenCalled();
  });

  it("shows clear button when there is search text", () => {
    const mockOnSearchResults = vi.fn();
    render(() => (
      <SearchBar recipes={mockRecipes} searchQuery="chicken" onSearchChange={mockOnSearchResults} />
    ));

    const clearButton = screen.getByRole("button");
    expect(clearButton).toBeInTheDocument();
  });

  it("clears search when clear button is clicked", () => {
    const mockOnSearchResults = vi.fn();
    render(() => (
      <SearchBar recipes={mockRecipes} searchQuery="chicken" onSearchChange={mockOnSearchResults} />
    ));

    const clearButton = screen.getByRole("button");
    fireEvent.click(clearButton);

    expect(mockOnSearchResults).toHaveBeenCalledWith("");
  });
});
