import { fireEvent, render } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";
import { SortDropdown } from "./SortDropdown.tsx";
import { DEFAULT_SORT, sortOptions, YOUR_ORDER, yourOrderOption } from "./sortOptions.ts";

describe("<SortDropdown />", () => {
  it("renders with sort by label for the default sort", () => {
    const mockOnSortChange = vi.fn();
    const { getByText } = render(() => (
      <SortDropdown
        value="date-desc"
        options={sortOptions}
        defaultValue={DEFAULT_SORT}
        defaultLabel="Sort by"
        onSortChange={mockOnSortChange}
      />
    ));

    expect(getByText("Sort by")).toBeInTheDocument();
  });

  it("shows the active sort in the button for a non-default sort", () => {
    const mockOnSortChange = vi.fn();
    const { getByText } = render(() => (
      <SortDropdown
        value="name-asc"
        options={sortOptions}
        defaultValue={DEFAULT_SORT}
        defaultLabel="Sort by"
        onSortChange={mockOnSortChange}
      />
    ));

    expect(getByText("Sort: Name A-Z")).toBeInTheDocument();
  });

  it("shows all sort options when clicked", () => {
    const mockOnSortChange = vi.fn();
    const { getByText, getByRole } = render(() => (
      <SortDropdown
        value="name-asc"
        options={sortOptions}
        defaultValue={DEFAULT_SORT}
        defaultLabel="Sort by"
        onSortChange={mockOnSortChange}
      />
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
      <SortDropdown
        value="name-asc"
        options={sortOptions}
        defaultValue={DEFAULT_SORT}
        defaultLabel="Sort by"
        onSortChange={mockOnSortChange}
      />
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
      <SortDropdown
        value="difficulty-hard"
        options={sortOptions}
        defaultValue={DEFAULT_SORT}
        defaultLabel="Sort by"
        onSortChange={mockOnSortChange}
      />
    ));

    const button = getByRole("button");
    fireEvent.click(button);

    const options = getAllByRole("button");
    const activeOption = options.find((opt) => opt.textContent === "Difficulty (hard first)");
    expect(activeOption).toHaveClass(/_dropdownItemActive/);
  });

  it("offers Your order first inside a manual collection and labels the button with it", () => {
    const onSortChange = vi.fn();
    const { getByRole, getByText } = render(() => (
      <SortDropdown
        value={YOUR_ORDER}
        options={[yourOrderOption, ...sortOptions]}
        defaultValue={YOUR_ORDER}
        defaultLabel="Your order"
        onSortChange={onSortChange}
      />
    ));
    const button = getByRole("button");
    expect(button).toHaveTextContent("Your order");
    fireEvent.click(button);
    fireEvent.click(getByText("Date (newest first)"));
    expect(onSortChange).toHaveBeenCalledWith("date-desc");
  });
});
