import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from "@solidjs/testing-library";
import FilterSidebar from "./FilterSidebar";

describe("<FilterSidebar />", () => {
  it("renders all filter sections", () => {
    const mockOnFilterChange = vi.fn();
    const mockOnTimeFilterChange = vi.fn();
    const { getByText } = render(() => 
      <FilterSidebar 
        onFilterChange={mockOnFilterChange}
        onTimeFilterChange={mockOnTimeFilterChange}
      />
    );
    
    expect(getByText("Difficulty")).toBeInTheDocument();
    expect(getByText("Time")).toBeInTheDocument();
  });

  it("renders all difficulty options", () => {
    const mockOnFilterChange = vi.fn();
    const mockOnTimeFilterChange = vi.fn();
    const { getAllByText, getByText } = render(() => 
      <FilterSidebar 
        onFilterChange={mockOnFilterChange}
        onTimeFilterChange={mockOnTimeFilterChange}
      />
    );
    
    const allOptions = getAllByText("All");
    expect(allOptions).toHaveLength(2); // One for difficulty, one for time
    expect(getByText("Easy")).toBeInTheDocument();
    expect(getByText("Medium")).toBeInTheDocument();
    expect(getByText("Hard")).toBeInTheDocument();
  });

  it("calls onFilterChange when difficulty filter changes", () => {
    const mockOnFilterChange = vi.fn();
    const mockOnTimeFilterChange = vi.fn();
    const { getByLabelText } = render(() => 
      <FilterSidebar 
        onFilterChange={mockOnFilterChange}
        onTimeFilterChange={mockOnTimeFilterChange}
      />
    );
    
    const easyRadio = getByLabelText("Easy");
    fireEvent.click(easyRadio);
    
    expect(mockOnFilterChange).toHaveBeenCalledWith("Easy");
  });

  it("renders all time options", () => {
    const mockOnFilterChange = vi.fn();
    const mockOnTimeFilterChange = vi.fn();
    const { getByText } = render(() => 
      <FilterSidebar 
        onFilterChange={mockOnFilterChange}
        onTimeFilterChange={mockOnTimeFilterChange}
      />
    );
    
    expect(getByText("Under 30 min")).toBeInTheDocument();
    expect(getByText("Under 1 hour")).toBeInTheDocument();
    expect(getByText("1+ hours")).toBeInTheDocument();
  });
});