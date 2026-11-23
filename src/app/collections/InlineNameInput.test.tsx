import { cleanup, fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { afterEach, describe, expect, it, vi } from "vitest";
import { InlineNameInput } from "./InlineNameInput.tsx";

const renderInput = (onCommit = vi.fn(() => true), onCancel = vi.fn()) => {
  render(() => (
    <InlineNameInput
      initialValue="Soups"
      label="Collection name"
      onCommit={onCommit}
      onCancel={onCancel}
    />
  ));
  return { input: screen.getByRole("textbox", { name: "Collection name" }), onCommit, onCancel };
};

describe("<InlineNameInput /> rename", () => {
  afterEach(() => {
    cleanup();
  });

  it("starts with the current name, focused and selected", async () => {
    const { input } = renderInput();
    expect(input).toHaveValue("Soups");
    await waitFor(() => expect(input).toHaveFocus());
  });

  it("saves the trimmed name on Enter, once even if a blur follows", () => {
    const { input, onCommit } = renderInput();
    fireEvent.input(input, { target: { value: "  Stews " } });
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.blur(input);
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith("Stews");
  });

  it("saves on blur", () => {
    const { input, onCommit } = renderInput();
    fireEvent.input(input, { target: { value: "Stews" } });
    fireEvent.blur(input);
    expect(onCommit).toHaveBeenCalledWith("Stews");
  });

  it("cancels on Esc without saving", () => {
    const { input, onCommit, onCancel } = renderInput();
    fireEvent.input(input, { target: { value: "Stews" } });
    fireEvent.keyDown(input, { key: "Escape" });
    fireEvent.blur(input);
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onCommit).not.toHaveBeenCalled();
  });

  it("keeps the old name when the input is emptied", () => {
    const { input, onCommit, onCancel } = renderInput();
    fireEvent.input(input, { target: { value: "   " } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onCommit).not.toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalled();
  });

  it("stays open and can save again after a rejected name", async () => {
    const onCommit = vi.fn().mockReturnValueOnce(false).mockReturnValue(true);
    const { input } = renderInput(onCommit);
    fireEvent.input(input, { target: { value: "Taken" } });
    fireEvent.keyDown(input, { key: "Enter" });
    await Promise.resolve();
    fireEvent.input(input, { target: { value: "Free" } });
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => expect(onCommit).toHaveBeenLastCalledWith("Free"));
    expect(onCommit).toHaveBeenCalledTimes(2);
  });

  it("shows an error", () => {
    render(() => (
      <InlineNameInput
        initialValue="Soups"
        label="Collection name"
        error="Give it a name."
        onCommit={() => true}
        onCancel={() => undefined}
      />
    ));
    expect(screen.getByText("Give it a name.")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });
});
