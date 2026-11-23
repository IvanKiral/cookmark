import { cleanup, fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AdminConfirmDialog } from "~/app/admin/AdminConfirmDialog.tsx";
import { createRecipeAdminActions } from "~/app/admin/createRecipeAdminActions.ts";
import type { Recipe } from "~/shared/recipe.ts";
import type { RecipeVerdict } from "~/shared/verdicts.ts";
import { createPendingResponse, nextTask } from "~/testing/pendingResponse.ts";
import { RecipeBadges } from "./RecipeBadges.tsx";
import { RecipeMoreMenu } from "./RecipeMoreMenu.tsx";
import { RecipeNavActions } from "./RecipeNavActions.tsx";

const { revalidate, navigate } = vi.hoisted(() => ({ revalidate: vi.fn(), navigate: vi.fn() }));

// The real recipeQueries runs on top of this: query() only needs to keep the key.
vi.mock("@solidjs/router", () => ({
  revalidate,
  query: (fn: object, key: string) => Object.assign(fn, { key }),
  useLocation: () => ({ state: null, search: "" }),
  useNavigate: () => navigate,
}));

vi.mock("~/app/marks/MarkButton.tsx", () => ({ MarkButton: () => null }));

const recipe = { title: "Soup" } as Recipe;

const putVerdict = (verdict: string): RequestInit => ({
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ verdict }),
});

type HarnessOptions = {
  isAdmin?: boolean;
  isDesktop?: boolean;
  verdict?: RecipeVerdict;
  isShouldDelete?: boolean;
};

// The route's wiring: saved values come from the recipe, and the mocked
// revalidate stands in for the refetch by writing what was saved.
const renderNav = (options: HarnessOptions = {}) => {
  const isAdmin = options.isAdmin ?? true;
  render(() => {
    const [verdict, setVerdict] = createSignal(options.verdict);
    const [isShouldDelete, setIsShouldDelete] = createSignal(options.isShouldDelete ?? false);
    const [isSheetOpen, setIsSheetOpen] = createSignal(false);
    const admin = createRecipeAdminActions({
      slug: () => "soup",
      name: () => "Soup",
      verdict,
      isShouldDelete,
    });
    revalidate.mockImplementation(() => {
      setVerdict(admin.verdict());
      setIsShouldDelete(admin.isShouldDelete());
    });
    return (
      <>
        <RecipeBadges
          verdict={admin.verdict()}
          isShouldDeleteShown={isAdmin && admin.isShouldDelete()}
          onVerdictClick={isAdmin ? () => setIsSheetOpen(true) : undefined}
        />
        <RecipeNavActions
          slug="soup"
          recipe={recipe}
          isAdmin={isAdmin}
          isDesktop={options.isDesktop ?? false}
          isMoreShown={isAdmin}
          admin={admin}
          isSheetOpen={isSheetOpen()}
          onSheetOpenChange={setIsSheetOpen}
        />
        <AdminConfirmDialog actions={admin} />
      </>
    );
  });
};

const openSheet = (): void => {
  fireEvent.click(screen.getByRole("button", { name: "More actions" }));
};

describe("recipe More menu", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    // jsdom has no scrolling; Kobalte's dialog restores the scroll position on close.
    vi.stubGlobal("scrollTo", vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("is not shown to viewers", () => {
    renderNav({ isAdmin: false, verdict: "chef-ok" });
    expect(screen.queryByRole("button", { name: "More actions" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Change verdict/ })).not.toBeInTheDocument();
    expect(screen.getByText("Chef's ok")).toBeInTheDocument();
  });

  it("lists the verdicts for admins with the current one pressed", async () => {
    renderNav({ verdict: "chef-ok" });
    openSheet();
    expect(await screen.findByText("Admin only")).toBeInTheDocument();
    const pressed = screen.getAllByRole("button", { pressed: true });
    expect(pressed.map((button) => button.textContent)).toEqual([
      "sentiment_neutralChef's okcheck",
    ]);
    expect(screen.getByRole("button", { name: "Clear verdict" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Edit recipe/ })).toHaveAttribute(
      "href",
      "/recipe/soup/edit",
    );
  });

  it("hides Clear verdict when there is no verdict", async () => {
    renderNav();
    openSheet();
    await screen.findByText("Admin only");
    expect(screen.queryByRole("button", { name: "Clear verdict" })).not.toBeInTheDocument();
  });

  it("opens the sheet from the verdict badge", async () => {
    renderNav({ verdict: "chef-approved" });
    fireEvent.click(
      screen.getByRole("button", { name: "Chef's verdict: Chef approved. Change verdict" }),
    );
    expect(await screen.findByText("Admin only")).toBeInTheDocument();
  });

  it("saves a verdict at once and shows it on the badge while saving", async () => {
    const save = createPendingResponse();
    fetchMock.mockReturnValue(save.promise);
    renderNav({ verdict: "chef-ok" });
    openSheet();
    fireEvent.click(await screen.findByRole("button", { name: /Chef approved/ }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Chef approved/ })).toHaveAttribute(
        "aria-pressed",
        "true",
      ),
    );
    // The open sheet hides the page from assistive technology.
    expect(
      screen.getByRole("button", {
        name: "Chef's verdict: Chef approved. Change verdict",
        hidden: true,
      }),
    ).toBeInTheDocument();

    await nextTask();
    save.resolve(new Response(null, { status: 204 }));
    await waitFor(() => expect(revalidate).toHaveBeenCalled());
    expect(fetchMock).toHaveBeenCalledWith("/api/verdict/soup", putVerdict("chef-approved"));
  });

  it("reverts the verdict when the save fails", async () => {
    const save = createPendingResponse();
    fetchMock.mockReturnValue(save.promise);
    renderNav({ verdict: "chef-ok" });
    openSheet();
    fireEvent.click(await screen.findByRole("button", { name: /Chef approved/ }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Chef approved/ })).toHaveAttribute(
        "aria-pressed",
        "true",
      ),
    );

    await nextTask();
    save.resolve(new Response("Forbidden", { status: 403 }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Chef's ok/ })).toHaveAttribute(
        "aria-pressed",
        "true",
      ),
    );
    expect(revalidate).not.toHaveBeenCalled();
  });

  it("asks before taking away a Chef's kiss", async () => {
    renderNav({ verdict: "chef-kiss" });
    openSheet();
    fireEvent.click(await screen.findByRole("button", { name: "Clear verdict" }));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(await screen.findByText("Remove Chef's kiss?")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Remove Chef's kiss" }));
    await waitFor(() => expect(revalidate).toHaveBeenCalled());
    expect(fetchMock).toHaveBeenCalledWith("/api/verdict/soup", { method: "DELETE" });
  });

  it("asks before changing a Chef's kiss and saves nothing on Cancel", async () => {
    renderNav({ verdict: "chef-kiss" });
    openSheet();
    fireEvent.click(await screen.findByRole("button", { name: /Chef's flop/ }));
    expect(await screen.findByText("Change Chef's kiss to Chef's flop?")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await nextTask();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("asks before marking a recipe to delete, then shows the mark", async () => {
    renderNav();
    openSheet();
    fireEvent.click(await screen.findByRole("button", { name: "Mark to delete" }));
    expect(await screen.findByText("Mark recipe to delete?")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Mark to delete" }));

    await waitFor(() => expect(revalidate).toHaveBeenCalled());
    expect(fetchMock).toHaveBeenCalledWith("/api/should-delete/soup", { method: "PUT" });
    expect(screen.getByText("To delete")).toBeInTheDocument();
  });

  it("offers to remove an existing To delete mark", async () => {
    renderNav({ isShouldDelete: true });
    openSheet();
    fireEvent.click(await screen.findByRole("button", { name: "Remove the To delete mark" }));
    fireEvent.click(await screen.findByRole("button", { name: "Remove mark" }));
    await waitFor(() => expect(revalidate).toHaveBeenCalled());
    expect(fetchMock).toHaveBeenCalledWith("/api/should-delete/soup", { method: "DELETE" });
  });
});

describe("<RecipeMoreMenu /> (desktop)", () => {
  // jsdom implements neither; Kobalte's menu calls them while it opens.
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
    vi.stubGlobal("scrollTo", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    cleanup();
    vi.clearAllMocks();
  });

  const renderMenu = (verdict?: RecipeVerdict) =>
    render(() => {
      const admin = createRecipeAdminActions({
        slug: () => "soup",
        name: () => "Soup",
        verdict: () => verdict,
        isShouldDelete: () => false,
      });
      return <RecipeMoreMenu slug="soup" isAdmin admin={admin} />;
    });

  const openMenu = async (): Promise<void> => {
    const trigger = screen.getByRole("button", { name: "More actions" });
    fireEvent.keyDown(trigger, { key: "Enter" });
    await screen.findByRole("menu");
  };

  it("lists the four verdicts as items with the current one checked", async () => {
    renderMenu("chef-approved");
    await openMenu();
    const verdicts = screen.getAllByRole("menuitemradio");
    expect(verdicts.map((item) => item.textContent?.replace(/check$/, ""))).toEqual([
      "chef_hatChef's kiss",
      "thumb_upChef approved",
      "sentiment_neutralChef's ok",
      "thumb_downChef's flop",
    ]);
    expect(screen.getByRole("menuitemradio", { checked: true })).toHaveTextContent("Chef approved");
    expect(screen.getByRole("menuitem", { name: /Clear verdict/ })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /Edit recipe/ })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /Mark to delete/ })).toBeInTheDocument();
  });

  it("opens the edit page", async () => {
    renderMenu();
    await openMenu();
    fireEvent.keyDown(screen.getByRole("menuitem", { name: /Edit recipe/ }), { key: "Enter" });
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith("/recipe/soup/edit", { state: null }),
    );
  });
});
