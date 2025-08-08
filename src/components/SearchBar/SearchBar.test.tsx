import { render, screen, fireEvent, cleanup } from "@solidjs/testing-library";
import { describe, it, expect, vi, afterEach } from "vitest";
import SearchBar from "./SearchBar";
import type { Recipe } from "~/types/Recipe";

const mockRecipes: Recipe[] = [
  { id: "1", name: "Lemon Herb Chicken", difficulty: "Medium", time: "35 min" },
  { id: "2", name: "Quinoa Salad", difficulty: "Easy", time: "20 min" },
  { id: "3", name: "Chicken Caesar Salad", difficulty: "Easy", time: "15 min" }
];

describe("SearchBar", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders search input with placeholder", () => {
    const mockOnSearchResults = vi.fn();
    render(() => <SearchBar recipes={mockRecipes} onSearchResults={mockOnSearchResults} />);
    
    const searchInput = screen.getByPlaceholderText("Search recipes...");
    expect(searchInput).toBeInTheDocument();
  });

  it("calls onSearchResults with filtered results when searching", () => {
    const mockOnSearchResults = vi.fn();
    render(() => <SearchBar recipes={mockRecipes} onSearchResults={mockOnSearchResults} />);
    
    const searchInput = screen.getByPlaceholderText("Search recipes...");
    fireEvent.input(searchInput, { target: { value: "chicken" } });
    
    expect(mockOnSearchResults).toHaveBeenCalled();
  });

  it("shows clear button when there is search text", () => {
    const mockOnSearchResults = vi.fn();
    render(() => <SearchBar recipes={mockRecipes} onSearchResults={mockOnSearchResults} />);
    
    const searchInput = screen.getByPlaceholderText("Search recipes...");
    fireEvent.input(searchInput, { target: { value: "chicken" } });
    
    const clearButton = screen.getByRole("button");
    expect(clearButton).toBeInTheDocument();
  });

  it("clears search when clear button is clicked", () => {
    const mockOnSearchResults = vi.fn();
    render(() => <SearchBar recipes={mockRecipes} onSearchResults={mockOnSearchResults} />);
    
    const searchInput = screen.getByPlaceholderText("Search recipes...");
    fireEvent.input(searchInput, { target: { value: "chicken" } });
    
    const clearButton = screen.getByRole("button");
    fireEvent.click(clearButton);
    
    expect(searchInput.value).toBe("");
  });
});