import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import type { JSX } from "solid-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "~/lib/i18nContext";
import type { Recipe } from "~/types/Recipe";
import RecipeList from "./RecipeList.jsx";

vi.mock("@solidjs/router", () => ({
  A: (props: { href: string; class: string; children: JSX.Element }) => (
    <a href={props.href} class={props.class}>
      {props.children}
    </a>
  ),
  useParams: () => ({ lang: "en" }),
}));

const TestWrapper = (props: { children: JSX.Element }) => (
  <I18nProvider locale="en">{props.children}</I18nProvider>
);

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
    const mockRecipes: ReadonlyArray<Recipe> = Array.from({ length: 15 }, (_, i) => ({
      id: `${i + 1}`,
      url_slug: `recipe_${i + 1}`,
      name: `Recipe ${i + 1}`,
      difficulty: "Easy",
      time: "30 min",
      total_time: 30,
      tags: ["test"],
    }));

    const { getByText, queryByText } = render(() => (
      <TestWrapper>
        <RecipeList recipes={mockRecipes} {...defaultProps} />
      </TestWrapper>
    ));

    expect(getByText("Recipe 1")).toBeInTheDocument();
    expect(getByText("Recipe 5")).toBeInTheDocument();
    expect(getByText("Recipe 10")).toBeInTheDocument();

    expect(queryByText("Recipe 11")).not.toBeInTheDocument();
    expect(queryByText("Recipe 15")).not.toBeInTheDocument();
  });

  it("calls onPageChange when next is clicked", () => {
    const mockRecipes: ReadonlyArray<Recipe> = Array.from({ length: 15 }, (_, i) => ({
      id: `${i + 1}`,
      url_slug: `recipe_${i + 1}`,
      name: `Recipe ${i + 1}`,
      difficulty: "Easy",
      time: "30 min",
      total_time: 30,
      tags: ["test"],
    }));

    const mockOnPageChange = vi.fn();
    render(() => (
      <TestWrapper>
        <RecipeList recipes={mockRecipes} currentPage={1} onPageChange={mockOnPageChange} />
      </TestWrapper>
    ));

    const nextButton = screen.getByLabelText("Next");
    fireEvent.click(nextButton);

    expect(mockOnPageChange).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }));
  });

  it("renders correct page when currentPage prop changes", () => {
    const mockRecipes: ReadonlyArray<Recipe> = Array.from({ length: 15 }, (_, i) => ({
      id: `${i + 1}`,
      url_slug: `recipe_${i + 1}`,
      name: `Recipe ${i + 1}`,
      difficulty: "Easy",
      time: "30 min",
      total_time: 30,
      tags: ["test"],
    }));

    const mockOnPageChange = vi.fn();
    render(() => (
      <TestWrapper>
        <RecipeList recipes={mockRecipes} currentPage={2} onPageChange={mockOnPageChange} />
      </TestWrapper>
    ));

    expect(screen.queryByText("Recipe 1")).not.toBeInTheDocument();
    expect(screen.getByText("Recipe 11")).toBeInTheDocument();
    expect(screen.getByText("Recipe 15")).toBeInTheDocument();
  });

  it("does not show pagination for 10 or fewer recipes", () => {
    const mockRecipes: ReadonlyArray<Recipe> = Array.from({ length: 10 }, (_, i) => ({
      id: `${i + 1}`,
      url_slug: `recipe_${i + 1}`,
      name: `Recipe ${i + 1}`,
      difficulty: "Easy",
      time: "30 min",
      total_time: 30,
      tags: ["test"],
    }));

    render(() => (
      <TestWrapper>
        <RecipeList recipes={mockRecipes} {...defaultProps} />
      </TestWrapper>
    ));

    expect(screen.getByText("Recipe 1")).toBeInTheDocument();
    expect(screen.getByText("Recipe 10")).toBeInTheDocument();
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
    }));

    const mockOnPageChange = vi.fn();
    const { unmount } = render(() => (
      <TestWrapper>
        <RecipeList recipes={mockRecipes1} currentPage={1} onPageChange={mockOnPageChange} />
      </TestWrapper>
    ));

    expect(screen.getByText("Recipe 1")).toBeInTheDocument();
    expect(screen.getByText("Recipe 3")).toBeInTheDocument();

    unmount();
    cleanup();

    const mockRecipes2: ReadonlyArray<Recipe> = Array.from({ length: 15 }, (_, i) => ({
      id: `${i + 10}`,
      url_slug: `new_recipe_${i + 10}`,
      name: `New Recipe ${i + 10}`,
      difficulty: "Medium",
      time: "45 min",
      total_time: 45,
      tags: ["new"],
    }));

    render(() => (
      <TestWrapper>
        <RecipeList recipes={mockRecipes2} currentPage={1} onPageChange={mockOnPageChange} />
      </TestWrapper>
    ));

    expect(screen.getByText("New Recipe 10")).toBeInTheDocument();
    expect(screen.getByText("New Recipe 19")).toBeInTheDocument();
    expect(screen.queryByText("New Recipe 20")).not.toBeInTheDocument();
  });

  it("renders empty list when no recipes provided", () => {
    const { container } = render(() => (
      <TestWrapper>
        <RecipeList recipes={[]} {...defaultProps} />
      </TestWrapper>
    ));

    const wrapper = container.querySelector("div");
    expect(wrapper).toBeTruthy();
    const recipeContainer = container.querySelector('[class*="container"]');
    expect(recipeContainer?.children).toHaveLength(0);
  });

  it("scrolls to top when page changes", () => {
    const mockRecipes: ReadonlyArray<Recipe> = Array.from({ length: 15 }, (_, i) => ({
      id: `${i + 1}`,
      url_slug: `recipe_${i + 1}`,
      name: `Recipe ${i + 1}`,
      difficulty: "Easy",
      time: "30 min",
      total_time: 30,
      tags: ["test"],
    }));

    const mockOnPageChange = vi.fn();
    render(() => (
      <TestWrapper>
        <RecipeList recipes={mockRecipes} currentPage={1} onPageChange={mockOnPageChange} />
      </TestWrapper>
    ));

    const nextButton = screen.getByLabelText("Next");
    fireEvent.click(nextButton);

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });
});
