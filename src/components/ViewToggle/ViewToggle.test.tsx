import { cleanup, render, screen } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import ViewToggle from "./ViewToggle.tsx";

describe("<ViewToggle />", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("marks the active view as pressed", () => {
    render(() => <ViewToggle value="card" onChange={vi.fn()} />);

    expect(screen.getByLabelText("Card view")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByLabelText("List view")).toHaveAttribute("aria-pressed", "false");
  });

  it("emits the chosen view on click", async () => {
    const onChange = vi.fn();
    render(() => <ViewToggle value="card" onChange={onChange} />);

    await userEvent.click(screen.getByLabelText("List view"));

    expect(onChange).toHaveBeenCalledWith("list");
  });
});
