import { cleanup, render, screen } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import type { JSX } from "solid-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Recipe } from "~/types/Recipe.ts";
import RecipeList from "./RecipeList.jsx";

vi.mock("@solidjs/router", () => ({
  A: (props: { href: string; class: string; children: JSX.Element }) => (
    <a href={props.href} class={props.class}>
      {props.children}
    </a>
  ),
  useParams: () => ({}),
  useLocation: () => ({ search: "" }),
}));

vi.mock("~/contexts/FavoritesContext.tsx", () => ({
  useFavorites: () => ({
    favorites: () => new Set<string>(),
    isFavorite: () => false,
    toggle: () => {},
  }),
}));

describe("<RecipeList />", () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const defaultProps = {
    currentPage: 1,
    onPageChange: vi.fn(),
  };

  it("renders first page of recipes with pagination", () => {
    const mockRecipes: ReadonlyArray<Recipe> = Array.from({ length: 20 }, (_, i) => ({
      id: `${i + 1}`,
      url_slug: `recipe_${i + 1}`,
      name: `Recipe ${i + 1}`,
      difficulty: "Easy",
      time: "30 min",
      total_time: 30,
      tags: ["test"],
      ingredients: [],
      description: "",
      created_at: "2024-01-01T00:00:00.000Z",
    }));

    const { getByText, queryByText } = render(() => (
      <RecipeList recipes={mockRecipes} {...defaultProps} />
    ));

    expect(getByText("Recipe 1")).toBeInTheDocument();
    expect(getByText("Recipe 10")).toBeInTheDocument();
    expect(getByText("Recipe 15")).toBeInTheDocument();

    expect(queryByText("Recipe 16")).not.toBeInTheDocument();
    expect(queryByText("Recipe 20")).not.toBeInTheDocument();
  });

  it("calls onPageChange when next is clicked", async () => {
    const mockRecipes: ReadonlyArray<Recipe> = Array.from({ length: 20 }, (_, i) => ({
      id: `${i + 1}`,
      url_slug: `recipe_${i + 1}`,
      name: `Recipe ${i + 1}`,
      difficulty: "Easy",
      time: "30 min",
      total_time: 30,
      tags: ["test"],
      ingredients: [],
      description: "",
      created_at: "2024-01-01T00:00:00.000Z",
    }));

    const mockOnPageChange = vi.fn();
    render(() => (
      <RecipeList recipes={mockRecipes} currentPage={1} onPageChange={mockOnPageChange} />
    ));

    const nextButton = screen.getByLabelText("Next");
    await userEvent.click(nextButton);

    expect(mockOnPageChange).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }));
  });

  it("renders correct page when currentPage prop changes", () => {
    const mockRecipes: ReadonlyArray<Recipe> = Array.from({ length: 20 }, (_, i) => ({
      id: `${i + 1}`,
      url_slug: `recipe_${i + 1}`,
      name: `Recipe ${i + 1}`,
      difficulty: "Easy",
      time: "30 min",
      total_time: 30,
      tags: ["test"],
      ingredients: [],
      description: "",
      created_at: "2024-01-01T00:00:00.000Z",
    }));

    const mockOnPageChange = vi.fn();
    render(() => (
      <RecipeList recipes={mockRecipes} currentPage={2} onPageChange={mockOnPageChange} />
    ));

    expect(screen.queryByText("Recipe 1")).not.toBeInTheDocument();
    expect(screen.getByText("Recipe 16")).toBeInTheDocument();
    expect(screen.getByText("Recipe 20")).toBeInTheDocument();
  });

  it("does not show pagination for 15 or fewer recipes", () => {
    const mockRecipes: ReadonlyArray<Recipe> = Array.from({ length: 15 }, (_, i) => ({
      id: `${i + 1}`,
      url_slug: `recipe_${i + 1}`,
      name: `Recipe ${i + 1}`,
      difficulty: "Easy",
      time: "30 min",
      total_time: 30,
      tags: ["test"],
      ingredients: [],
      description: "",
      created_at: "2024-01-01T00:00:00.000Z",
    }));

    render(() => <RecipeList recipes={mockRecipes} {...defaultProps} />);

    expect(screen.getByText("Recipe 1")).toBeInTheDocument();
    expect(screen.getByText("Recipe 15")).toBeInTheDocument();
    expect(screen.queryByLabelText("Next")).not.toBeInTheDocument();
  });

  it("renders different recipes when recipe list changes", () => {
    const mockRecipes1: ReadonlyArray<Recipe> = Array.from({ length: 3 }, (_, i) => ({
      id: `${i + 1}`,
      url_slug: `recipe_${i + 1}`,
      name: `Recipe ${i + 1}`,
      difficulty: "Easy",
      time: "30 min",
      total_time: 30,
      tags: ["test"],
      ingredients: [],
      description: "",
      created_at: "2024-01-01T00:00:00.000Z",
    }));

    const mockOnPageChange = vi.fn();
    const { unmount } = render(() => (
      <RecipeList recipes={mockRecipes1} currentPage={1} onPageChange={mockOnPageChange} />
    ));

    expect(screen.getByText("Recipe 1")).toBeInTheDocument();
    expect(screen.getByText("Recipe 3")).toBeInTheDocument();

    unmount();
    cleanup();

    const mockRecipes2: ReadonlyArray<Recipe> = Array.from({ length: 20 }, (_, i) => ({
      id: `${i + 10}`,
      url_slug: `new_recipe_${i + 10}`,
      name: `New Recipe ${i + 10}`,
      difficulty: "Medium",
      time: "45 min",
      total_time: 45,
      tags: ["new"],
      ingredients: [],
      description: "",
      created_at: "2024-01-01T00:00:00.000Z",
    }));

    render(() => (
      <RecipeList recipes={mockRecipes2} currentPage={1} onPageChange={mockOnPageChange} />
    ));

    expect(screen.getByText("New Recipe 10")).toBeInTheDocument();
    expect(screen.getByText("New Recipe 24")).toBeInTheDocument();
    expect(screen.queryByText("New Recipe 25")).not.toBeInTheDocument();
  });

  it("renders empty list when no recipes provided", () => {
    const { container } = render(() => <RecipeList recipes={[]} {...defaultProps} />);

    const wrapper = container.querySelector("div");
    expect(wrapper).toBeTruthy();
    const recipeContainer = container.querySelector('[class*="container"]');
    expect(recipeContainer?.children).toHaveLength(0);
  });

  it("shows empty state message when no recipes match", () => {
    render(() => <RecipeList recipes={[]} {...defaultProps} />);

    expect(screen.getByText("No recipes found")).toBeInTheDocument();
    expect(screen.getByText("Try adjusting your search or filters.")).toBeInTheDocument();
  });

  it("calls onResetAll when clear button in empty state is clicked", async () => {
    const mockOnResetAll = vi.fn();
    render(() => <RecipeList recipes={[]} {...defaultProps} onResetAll={mockOnResetAll} />);

    const clearButton = screen.getByText("Clear search and filters");
    await userEvent.click(clearButton);

    expect(mockOnResetAll).toHaveBeenCalled();
  });

  it("scrolls to top when page changes", async () => {
    const mockRecipes: ReadonlyArray<Recipe> = Array.from({ length: 20 }, (_, i) => ({
      id: `${i + 1}`,
      url_slug: `recipe_${i + 1}`,
      name: `Recipe ${i + 1}`,
      difficulty: "Easy",
      time: "30 min",
      total_time: 30,
      tags: ["test"],
      ingredients: [],
      description: "",
      created_at: "2024-01-01T00:00:00.000Z",
    }));

    const mockOnPageChange = vi.fn();
    render(() => (
      <RecipeList recipes={mockRecipes} currentPage={1} onPageChange={mockOnPageChange} />
    ));

    const nextButton = screen.getByLabelText("Next");
    await userEvent.click(nextButton);

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });
});
