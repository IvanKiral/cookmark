import { fireEvent, render } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";
import FilterSidebar from "./FilterSidebar.jsx";

describe("<FilterSidebar />", () => {
  it("renders all filter sections", () => {
    const mockOnFilterChange = vi.fn();
    const mockOnTimeFilterChange = vi.fn();
    const mockOnTagFilterChange = vi.fn();
    const { getByText } = render(() => (
      <FilterSidebar
        onFilterChange={mockOnFilterChange}
        onTimeFilterChange={mockOnTimeFilterChange}
        onTagFilterChange={mockOnTagFilterChange}
      />
    ));

    expect(getByText("Difficulty")).toBeInTheDocument();
    expect(getByText("Time")).toBeInTheDocument();
  });

  it("renders all difficulty options", () => {
    const mockOnFilterChange = vi.fn();
    const mockOnTimeFilterChange = vi.fn();
    const mockOnTagFilterChange = vi.fn();
    const { getAllByText, getByText } = render(() => (
      <FilterSidebar
        onFilterChange={mockOnFilterChange}
        onTimeFilterChange={mockOnTimeFilterChange}
        onTagFilterChange={mockOnTagFilterChange}
      />
    ));

    const allOptions = getAllByText("All");
    expect(allOptions).toHaveLength(2); // One for difficulty, one for time
    expect(getByText("Easy")).toBeInTheDocument();
    expect(getByText("Medium")).toBeInTheDocument();
    expect(getByText("Hard")).toBeInTheDocument();
  });

  it("calls onFilterChange when difficulty filter changes", () => {
    const mockOnFilterChange = vi.fn();
    const mockOnTimeFilterChange = vi.fn();
    const mockOnTagFilterChange = vi.fn();
    const { getByLabelText } = render(() => (
      <FilterSidebar
        onFilterChange={mockOnFilterChange}
        onTimeFilterChange={mockOnTimeFilterChange}
        onTagFilterChange={mockOnTagFilterChange}
      />
    ));

    const easyRadio = getByLabelText("Easy");
    fireEvent.click(easyRadio);

    expect(mockOnFilterChange).toHaveBeenCalledWith("Easy");
  });

  it("renders all time options", () => {
    const mockOnFilterChange = vi.fn();
    const mockOnTimeFilterChange = vi.fn();
    const mockOnTagFilterChange = vi.fn();
    const { getByText } = render(() => (
      <FilterSidebar
        onFilterChange={mockOnFilterChange}
        onTimeFilterChange={mockOnTimeFilterChange}
        onTagFilterChange={mockOnTagFilterChange}
      />
    ));

    expect(getByText("Under 30 min")).toBeInTheDocument();
    expect(getByText("Under 1 hour")).toBeInTheDocument();
    expect(getByText("1+ hours")).toBeInTheDocument();
  });
});
