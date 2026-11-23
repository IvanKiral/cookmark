import { cleanup, fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { emptyFilters } from "~/app/filters/recipeFilters.ts";
import { SaveSmartFilterDialog } from "./SaveSmartFilterDialog.tsx";

const filters = { ...emptyFilters, tag: ["Dinner", "Pork", "Chicken"] as const };

const renderDialog = (options: { isPinShown?: boolean; isPinsFull?: boolean } = {}) => {
  const onSave = vi.fn(async () => undefined as string | undefined);
  render(() => (
    <SaveSmartFilterDialog
      isOpen
      onOpenChange={vi.fn()}
      filters={filters}
      isPinShown={options.isPinShown ?? true}
      isPinsFull={options.isPinsFull ?? false}
      onSave={onSave}
    />
  ));
  return { onSave };
};

describe("<SaveSmartFilterDialog />", () => {
  beforeEach(() => {
    vi.stubGlobal("scrollTo", vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("prefills the name with the description and lists the filters", async () => {
    renderDialog();
    expect(await screen.findByRole("textbox", { name: "Name" })).toHaveValue(
      "Chicken or Pork, Dinner",
    );
    expect(screen.getByText("Dinner")).toBeInTheDocument();
    expect(screen.getByText("Pork")).toBeInTheDocument();
  });

  it("pins to the top bar by default on phones", async () => {
    const { onSave } = renderDialog();
    expect(await screen.findByRole("checkbox", { name: "Pin to the top bar" })).toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(onSave).toHaveBeenCalledWith("Chicken or Pork, Dinner", true));
  });

  it("unchecks and disables the pin box when three are pinned", async () => {
    const { onSave } = renderDialog({ isPinsFull: true });
    const pin = await screen.findByRole("checkbox", { name: "Pin to the top bar" });
    expect(pin).not.toBeChecked();
    expect(pin).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(onSave).toHaveBeenCalledWith("Chicken or Pork, Dinner", false));
  });

  it("has no pin box on desktop and shows an error from saving", async () => {
    const onSave = vi.fn(async () => "You already have a collection called Soups.");
    render(() => (
      <SaveSmartFilterDialog
        isOpen
        onOpenChange={vi.fn()}
        filters={filters}
        isPinShown={false}
        isPinsFull={false}
        onSave={onSave}
      />
    ));
    await screen.findByRole("textbox", { name: "Name" });
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(
      await screen.findByText("You already have a collection called Soups."),
    ).toBeInTheDocument();
    expect(onSave).toHaveBeenCalledWith("Chicken or Pork, Dinner", false);
  });
});
