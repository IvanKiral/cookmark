import { cleanup, fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ChefPickToggle from "./ChefPickToggle.tsx";

const { currentUser, revalidate } = vi.hoisted(() => ({
  currentUser: { isAdmin: true },
  revalidate: vi.fn(),
}));

vi.mock("~/contexts/CurrentUserContext.tsx", () => ({
  useCurrentUser: () => ({ isAdmin: () => currentUser.isAdmin }),
}));

vi.mock("@solidjs/router", () => ({ revalidate }));

vi.mock("~/lib/recipeQueries.ts", () => ({
  getRecipesList: { key: "recipes-list" },
  getRecipeBySlug: { key: "recipe-by-slug" },
}));

describe("<ChefPickToggle />", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    currentUser.isAdmin = true;
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("is hidden from viewers", () => {
    currentUser.isAdmin = false;
    render(() => <ChefPickToggle slug="soup" name="Soup" isChefPick={false} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("marks a recipe as Chef's pick and refreshes the recipe data", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    render(() => <ChefPickToggle slug="soup" name="Soup" isChefPick={false} />);

    fireEvent.click(screen.getByRole("button", { name: "Mark Soup as Chef's pick" }));

    await waitFor(() =>
      expect(revalidate).toHaveBeenCalledWith(["recipes-list", "recipe-by-slug"]),
    );
    expect(fetchMock).toHaveBeenCalledWith("/api/chef-pick/soup", { method: "PUT" });
  });

  it("removes the pick and does not refresh when the request fails", async () => {
    fetchMock.mockResolvedValue(new Response("Forbidden", { status: 403 }));
    render(() => <ChefPickToggle slug="soup" name="Soup" isChefPick />);

    const button = screen.getByRole("button", { name: "Remove Chef's pick from Soup" });
    expect(button).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(button);

    await waitFor(() => expect(button).not.toBeDisabled());
    expect(fetchMock).toHaveBeenCalledWith("/api/chef-pick/soup", { method: "DELETE" });
    expect(revalidate).not.toHaveBeenCalled();
  });
});
