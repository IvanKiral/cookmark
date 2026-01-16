import { fireEvent, render } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";
import SortDropdown from "./SortDropdown.jsx";

describe("<SortDropdown />", () => {
  it("renders with sort by label", () => {
    const mockOnSortChange = vi.fn();
    const { getByText } = render(() => (
      <SortDropdown value="name-asc" onSortChange={mockOnSortChange} />
    ));

    expect(getByText("Sort by")).toBeInTheDocument();
  });

  it("shows all sort options when clicked", () => {
    const mockOnSortChange = vi.fn();
    const { getByText, getByRole } = render(() => (
      <SortDropdown value="name-asc" onSortChange={mockOnSortChange} />
    ));

    const button = getByRole("button");
    fireEvent.click(button);

    expect(getByText("Name (A-Z)")).toBeInTheDocument();
    expect(getByText("Name (Z-A)")).toBeInTheDocument();
    expect(getByText("Time (shortest first)")).toBeInTheDocument();
    expect(getByText("Time (longest first)")).toBeInTheDocument();
    expect(getByText("Difficulty (easy first)")).toBeInTheDocument();
    expect(getByText("Difficulty (hard first)")).toBeInTheDocument();
  });

  it("calls onSortChange when option is selected", () => {
    const mockOnSortChange = vi.fn();
    const { getByText, getByRole } = render(() => (
      <SortDropdown value="name-asc" onSortChange={mockOnSortChange} />
    ));

    const button = getByRole("button");
    fireEvent.click(button);

    const option = getByText("Time (shortest first)");
    fireEvent.click(option);

    expect(mockOnSortChange).toHaveBeenCalledWith("time-asc");
  });

  it("highlights the active option", () => {
    const mockOnSortChange = vi.fn();
    const { getByRole, getAllByRole } = render(() => (
      <SortDropdown value="difficulty-hard" onSortChange={mockOnSortChange} />
    ));

    const button = getByRole("button");
    fireEvent.click(button);

    const options = getAllByRole("button");
    const activeOption = options.find((opt) => opt.textContent === "Difficulty (hard first)");
    expect(activeOption).toHaveClass(/_dropdownItemActive/);
  });
});
