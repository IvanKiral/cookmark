import { cleanup, fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { RecipeVerdict } from "~/constants/recipeVerdicts.ts";
import RecipeVerdictToggle from "./RecipeVerdictToggle.tsx";

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

const putVerdict = (verdict: string): RequestInit => ({
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ verdict }),
});

const renderToggle = (verdict?: RecipeVerdict) =>
  render(() => <RecipeVerdictToggle slug="soup" name="Soup" verdict={verdict} />);

const getTrigger = (): HTMLElement => screen.getByRole("button", { name: /^Chef's verdict for/ });

const choose = (label: string): void => {
  fireEvent.click(getTrigger());
  fireEvent.click(screen.getByRole("button", { name: label }));
};

describe("<RecipeVerdictToggle />", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    currentUser.isAdmin = true;
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("is hidden from viewers", () => {
    currentUser.isAdmin = false;
    renderToggle("chef-kiss");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("shows the current verdict on one collapsed button", () => {
    renderToggle("chef-ok");
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(getTrigger()).toHaveAccessibleName("Chef's verdict for Soup: Chef's ok");
    expect(getTrigger()).toHaveAttribute("aria-expanded", "false");
  });

  it("says when there is no verdict yet", () => {
    renderToggle();
    expect(getTrigger()).toHaveAccessibleName("Chef's verdict for Soup: none");
  });

  it("lists the four verdicts from best to worst and presses the current one", () => {
    renderToggle("chef-ok");
    fireEvent.click(getTrigger());

    expect(getTrigger()).toHaveAttribute("aria-expanded", "true");
    const options = screen.getAllByRole("button", { pressed: false });
    expect(options.map((option) => option.textContent)).toEqual([
      "chef_hatChef's kiss",
      "thumb_upChef approved",
      "thumb_downChef's flop",
    ]);
    expect(screen.getByRole("button", { pressed: true })).toHaveTextContent("Chef's ok");
    expect(screen.getByRole("button", { name: /Clear verdict/ })).toBeInTheDocument();
  });

  it("offers no Clear option when there is no verdict", () => {
    renderToggle();
    fireEvent.click(getTrigger());
    expect(screen.queryByRole("button", { name: /Clear verdict/ })).not.toBeInTheDocument();
  });

  it("closes the list on Escape", () => {
    renderToggle();
    fireEvent.click(getTrigger());
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("button", { name: /Chef approved/ })).not.toBeInTheDocument();
    expect(getTrigger()).toHaveFocus();
  });

  it("closes the list on a click outside", () => {
    renderToggle();
    fireEvent.click(getTrigger());
    fireEvent.click(document.body);
    expect(screen.queryByRole("button", { name: /Chef approved/ })).not.toBeInTheDocument();
  });

  it("sets Chef's kiss without asking and refreshes the recipe data", async () => {
    renderToggle();

    choose("Chef's kiss");

    await waitFor(() =>
      expect(revalidate).toHaveBeenCalledWith(["recipes-list", "recipe-by-slug"]),
    );
    expect(fetchMock).toHaveBeenCalledWith("/api/verdict/soup", putVerdict("chef-kiss"));
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Chef approved/ })).not.toBeInTheDocument();
  });

  it("changes between lower verdicts without asking", async () => {
    renderToggle("chef-approved");

    choose("Chef's flop");

    await waitFor(() => expect(revalidate).toHaveBeenCalled());
    expect(fetchMock).toHaveBeenCalledWith("/api/verdict/soup", putVerdict("chef-flop"));
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("does nothing when the current verdict is chosen again", () => {
    renderToggle("chef-ok");

    choose("Chef's ok");

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("clears a lower verdict without asking", async () => {
    renderToggle("chef-ok");

    choose("Clear verdict");

    await waitFor(() => expect(revalidate).toHaveBeenCalled());
    expect(fetchMock).toHaveBeenCalledWith("/api/verdict/soup", { method: "DELETE" });
  });

  it("asks before clearing Chef's kiss and keeps it when cancelled", async () => {
    renderToggle("chef-kiss");

    choose("Clear verdict");
    const dialog = await screen.findByRole("alertdialog");
    expect(dialog).toHaveTextContent("Soup will no longer be recommended to everyone.");

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("clears Chef's kiss once confirmed", async () => {
    renderToggle("chef-kiss");

    choose("Clear verdict");
    fireEvent.click(await screen.findByRole("button", { name: "Remove Chef's kiss" }));

    await waitFor(() => expect(revalidate).toHaveBeenCalled());
    expect(fetchMock).toHaveBeenCalledWith("/api/verdict/soup", { method: "DELETE" });
  });

  it("asks before changing Chef's kiss to a lower verdict", async () => {
    renderToggle("chef-kiss");

    choose("Chef approved");
    const dialog = await screen.findByRole("alertdialog");
    expect(dialog).toHaveTextContent("Change Chef's kiss to Chef approved?");
    expect(fetchMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Change to Chef approved" }));

    await waitFor(() => expect(revalidate).toHaveBeenCalled());
    expect(fetchMock).toHaveBeenCalledWith("/api/verdict/soup", putVerdict("chef-approved"));
  });

  it("does not refresh when the request fails", async () => {
    fetchMock.mockResolvedValue(new Response("Forbidden", { status: 403 }));
    renderToggle();

    choose("Chef's ok");

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    await waitFor(() => expect(getTrigger()).not.toBeDisabled());
    expect(revalidate).not.toHaveBeenCalled();
  });
});
