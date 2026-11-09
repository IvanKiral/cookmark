import { cleanup, fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import RecipeFlagToggle from "./RecipeFlagToggle.tsx";

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

describe("<RecipeFlagToggle />", () => {
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
    render(() => <RecipeFlagToggle flag="should-delete" slug="soup" name="Soup" isSet />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("asks before marking a recipe to delete", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    render(() => <RecipeFlagToggle flag="should-delete" slug="soup" name="Soup" isSet={false} />);

    fireEvent.click(screen.getByRole("button", { name: "Mark Soup to delete" }));
    expect(fetchMock).not.toHaveBeenCalled();
    fireEvent.click(await screen.findByRole("button", { name: "Mark to delete" }));

    await waitFor(() => expect(revalidate).toHaveBeenCalled());
    expect(fetchMock).toHaveBeenCalledWith("/api/should-delete/soup", { method: "PUT" });
  });

  it("asks before removing the To delete mark and does not refresh when the request fails", async () => {
    fetchMock.mockResolvedValue(new Response("Forbidden", { status: 403 }));
    render(() => <RecipeFlagToggle flag="should-delete" slug="soup" name="Soup" isSet />);

    const button = screen.getByRole("button", { name: "Remove the To delete mark from Soup" });
    expect(button).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(button);
    fireEvent.click(await screen.findByRole("button", { name: "Remove mark" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    await waitFor(() => expect(button).not.toBeDisabled());
    expect(fetchMock).toHaveBeenCalledWith("/api/should-delete/soup", { method: "DELETE" });
    expect(revalidate).not.toHaveBeenCalled();
  });
});
