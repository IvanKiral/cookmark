import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { afterEach, describe, expect, it, vi } from "vitest";
import MarkButton from "./MarkButton.tsx";

const toggle = vi.fn();
const markedFavorites = new Set(["soup"]);

vi.mock("~/contexts/MarksContext.tsx", () => ({
  useMarks: () => ({
    isMarked: (mark: string, slug: string) => mark === "favorite" && markedFavorites.has(slug),
    toggle,
  }),
}));

describe("<MarkButton />", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("shows an active favourite with a remove label", () => {
    render(() => <MarkButton mark="favorite" slug="soup" name="Soup" />);
    const button = screen.getByRole("button", { name: "Remove Soup from favourites" });
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveTextContent("favorite");
  });

  it("shows an inactive to-try bookmark with an add label", () => {
    render(() => <MarkButton mark="to-try" slug="soup" name="Soup" />);
    const button = screen.getByRole("button", { name: "Add Soup to To try" });
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(button).toHaveTextContent("bookmark");
  });

  it("toggles its own mark without following the card link", () => {
    render(() => <MarkButton mark="to-try" slug="cake" name="Cake" />);
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    fireEvent(screen.getByRole("button"), event);
    expect(toggle).toHaveBeenCalledWith("to-try", "cake");
    expect(event.defaultPrevented).toBe(true);
  });
});
