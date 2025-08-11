import { fireEvent, render } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";
import SortDropdown from "./SortDropdown";

describe("<SortDropdown />", () => {
	it("renders with current value", () => {
		const mockOnSortChange = vi.fn();
		const { getByText } = render(() => (
			<SortDropdown value="name-asc" onSortChange={mockOnSortChange} />
		));

		expect(getByText("Name (A-Z)")).toBeInTheDocument();
	});

	it("shows all sort options when clicked", () => {
		const mockOnSortChange = vi.fn();
		const { getByText } = render(() => (
			<SortDropdown value="name-asc" onSortChange={mockOnSortChange} />
		));

		const button = getByText("Name (A-Z)");
		fireEvent.click(button);

		expect(getByText("Name (Z-A)")).toBeInTheDocument();
		expect(getByText("Time (shortest first)")).toBeInTheDocument();
		expect(getByText("Time (longest first)")).toBeInTheDocument();
		expect(getByText("Difficulty (easy first)")).toBeInTheDocument();
		expect(getByText("Difficulty (hard first)")).toBeInTheDocument();
	});

	it("calls onSortChange when option is selected", () => {
		const mockOnSortChange = vi.fn();
		const { getByText } = render(() => (
			<SortDropdown value="name-asc" onSortChange={mockOnSortChange} />
		));

		const button = getByText("Name (A-Z)");
		fireEvent.click(button);

		const option = getByText("Time (shortest first)");
		fireEvent.click(option);

		expect(mockOnSortChange).toHaveBeenCalledWith("time-asc");
	});

	it("renders with different initial values", () => {
		const mockOnSortChange = vi.fn();
		const { getByText } = render(() => (
			<SortDropdown value="difficulty-hard" onSortChange={mockOnSortChange} />
		));

		expect(getByText("Difficulty (hard first)")).toBeInTheDocument();
	});
});
