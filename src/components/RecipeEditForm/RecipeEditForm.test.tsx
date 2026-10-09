import type { BeforeLeaveEventArgs } from "@solidjs/router";
import { cleanup, fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { RecipeEdit } from "~/utils/recipeEdit.ts";
import RecipeEditForm from "./RecipeEditForm.tsx";

const { router } = vi.hoisted(() => ({
  router: {
    revalidate: vi.fn(),
    beforeLeave: undefined as ((event: BeforeLeaveEventArgs) => void) | undefined,
  },
}));

vi.mock("@solidjs/router", () => ({
  revalidate: router.revalidate,
  useBeforeLeave: (listener: (event: BeforeLeaveEventArgs) => void) => {
    router.beforeLeave = listener;
  },
}));

vi.mock("~/lib/recipeQueries.ts", () => ({
  getRecipesList: { key: "recipes-list" },
  getRecipeBySlug: { key: "recipe-by-slug" },
}));

const initial: RecipeEdit = {
  title: "Soup",
  description: "Warm",
  prep_time: 10,
  cook_time: 20,
  total_time: 30,
  tags: ["Soup"],
  ingredients: [
    { name: "Water", amount: "1", unit: "l" },
    { name: "Salt", amount: "", unit: "" },
  ],
  instructions: [{ name: "Main", steps: ["Boil", "Serve"] }],
};

const createLeaveEvent = () => {
  const event = {
    defaultPrevented: false,
    preventDefault: vi.fn(),
    retry: vi.fn(),
  };
  return event as typeof event & BeforeLeaveEventArgs;
};

const renderForm = () => {
  const onSaved = vi.fn();
  const onCancel = vi.fn();
  render(() => (
    <RecipeEditForm slug="soup" initial={initial} onSaved={onSaved} onCancel={onCancel} />
  ));
  return { onSaved, onCancel };
};

const typeInto = (label: string, value: string): void => {
  fireEvent.input(screen.getByLabelText(label), { target: { value } });
};

describe("<RecipeEditForm />", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    router.beforeLeave = undefined;
  });

  it("saves the trimmed edit, refreshes the recipe data and reports success", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    const { onSaved } = renderForm();

    typeInto("Name", "  Better soup ");
    typeInto("Cook time (min)", "25");
    typeInto("Total time (min)", "");
    fireEvent.click(screen.getByRole("checkbox", { name: "Vegan" }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(fetchMock).toHaveBeenCalledWith("/api/recipes/soup", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...initial,
        title: "Better soup",
        cook_time: 25,
        total_time: null,
        tags: ["Soup", "Vegan"],
        ingredients: [
          { name: "Water", amount: 1, unit: "l" },
          { name: "Salt", amount: null, unit: null },
        ],
      }),
    });
    expect(router.revalidate).toHaveBeenCalledWith(["recipes-list", "recipe-by-slug"]);
  });

  it("shows field errors without sending an invalid edit", () => {
    renderForm();

    typeInto("Name", "   ");
    typeInto("Prep time (min)", "2.5");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByLabelText("Name")).toHaveAccessibleDescription("Enter a name.");
    expect(screen.getByLabelText("Prep time (min)")).toHaveAttribute("aria-invalid", "true");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("clears a field's error once it is changed", () => {
    renderForm();

    typeInto("Name", "");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    typeInto("Name", "Soup again");

    expect(screen.getByLabelText("Name")).toHaveAttribute("aria-invalid", "false");
  });

  it("shows the errors the server returns", async () => {
    fetchMock.mockResolvedValue(
      Response.json({ errors: { tags: "Unknown tag: Pizza." } }, { status: 422 }),
    );
    const { onSaved } = renderForm();

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Unknown tag: Pizza.")).toBeInTheDocument();
    expect(onSaved).not.toHaveBeenCalled();
  });

  it("tells the admin when saving fails", async () => {
    fetchMock.mockResolvedValue(new Response("Forbidden", { status: 403 }));
    const { onSaved } = renderForm();

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Saving failed. Try again.");
    expect(router.revalidate).not.toHaveBeenCalled();
    expect(onSaved).not.toHaveBeenCalled();
  });

  it("lets the admin leave without asking when nothing changed", () => {
    renderForm();

    fireEvent.click(screen.getByRole("checkbox", { name: "Vegan" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Vegan" }));
    const event = createLeaveEvent();
    router.beforeLeave?.(event);

    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it("asks before leaving with unsaved changes and stays when the admin keeps editing", async () => {
    renderForm();

    typeInto("Description", "Hot");
    const event = createLeaveEvent();
    router.beforeLeave?.(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(await screen.findByRole("alertdialog")).toHaveTextContent("Discard changes?");
    fireEvent.click(screen.getByRole("button", { name: "Keep editing" }));

    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(event.retry).not.toHaveBeenCalled();
  });

  it("leaves once the admin discards the changes", async () => {
    renderForm();

    typeInto("Description", "Hot");
    const event = createLeaveEvent();
    router.beforeLeave?.(event);
    fireEvent.click(await screen.findByRole("button", { name: "Discard" }));

    expect(event.retry).toHaveBeenCalledWith(true);
  });

  it("does not ask after a successful save", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    const { onSaved } = renderForm();

    typeInto("Description", "Hot");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    const event = createLeaveEvent();
    router.beforeLeave?.(event);

    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it("edits existing ingredients and steps and sends them cleaned up", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    const { onSaved } = renderForm();

    typeInto("Ingredient 2 amount", "0,5");
    typeInto("Ingredient 2 unit", "tsp");
    typeInto("Ingredient 1", "Cold water");
    typeInto("Step 2", " Serve hot ");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.ingredients).toEqual([
      { name: "Cold water", amount: 1, unit: "l" },
      { name: "Salt", amount: 0.5, unit: "tsp" },
    ]);
    expect(body.instructions).toEqual([{ name: "Main", steps: ["Boil", "Serve hot"] }]);
  });

  it("shows an error on the step that is empty", () => {
    renderForm();

    typeInto("Step 1", " ");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByLabelText("Step 1")).toHaveAccessibleDescription("Enter the step.");
    expect(screen.getByLabelText("Step 2")).toHaveAttribute("aria-invalid", "false");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("offers no way to add or remove ingredients and steps", () => {
    renderForm();

    expect(screen.getAllByLabelText(/^Ingredient \d+$/)).toHaveLength(2);
    expect(screen.getAllByLabelText(/^Step \d+$/)).toHaveLength(2);
    expect(screen.queryByRole("button", { name: /add|remove|delete/i })).not.toBeInTheDocument();
  });
});
