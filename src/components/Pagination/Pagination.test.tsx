import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { afterEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "~/lib/i18nContext";
import { Pagination } from "./Pagination";

const TestWrapper = (props: { children: any }) => <I18nProvider locale="en">{props.children}</I18nProvider>;

describe("Pagination", () => {
  afterEach(() => {
    cleanup();
  });

  it("should not render when count is less than or equal to page size", () => {
    const { container } = render(() => (
      <TestWrapper>
        <Pagination count={5} pageSize={10} />
      </TestWrapper>
    ));
    expect(container.firstChild).toBeNull();
  });

  it("should render pagination when count exceeds page size", () => {
    render(() => (
      <TestWrapper>
        <Pagination count={20} pageSize={5} />
      </TestWrapper>
    ));
    expect(screen.getByLabelText("Previous")).toBeInTheDocument();
    expect(screen.getByLabelText("Next")).toBeInTheDocument();
    expect(screen.getByLabelText("Go to page 1")).toBeInTheDocument();
  });

  it("should display correct number of pages", () => {
    render(() => (
      <TestWrapper>
        <Pagination count={25} pageSize={5} />
      </TestWrapper>
    ));
    expect(screen.getByLabelText("Go to page 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Go to page 2")).toBeInTheDocument();
    expect(screen.getByLabelText("Go to page 3")).toBeInTheDocument();
    const ellipsis = screen.getAllByText("⋯");
    expect(ellipsis.length).toBeGreaterThan(0);
    expect(screen.getByLabelText("Go to page 5")).toBeInTheDocument();
  });

  it("should call onPageChange when page is clicked", () => {
    const handlePageChange = vi.fn();
    render(() => (
      <TestWrapper>
        <Pagination count={20} pageSize={5} onPageChange={handlePageChange} />
      </TestWrapper>
    ));

    const page2Button = screen.getByLabelText("Go to page 2");
    fireEvent.click(page2Button);

    expect(handlePageChange).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }));
  });

  it("should call onPageChange when next is clicked", () => {
    const handlePageChange = vi.fn();
    render(() => (
      <TestWrapper>
        <Pagination count={20} pageSize={5} page={1} onPageChange={handlePageChange} />
      </TestWrapper>
    ));

    const nextButton = screen.getByLabelText("Next");
    fireEvent.click(nextButton);

    expect(handlePageChange).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }));
  });

  it("should call onPageChange when previous is clicked", () => {
    const handlePageChange = vi.fn();
    render(() => (
      <TestWrapper>
        <Pagination count={20} pageSize={5} page={3} onPageChange={handlePageChange} />
      </TestWrapper>
    ));

    const prevButton = screen.getByLabelText("Previous");
    fireEvent.click(prevButton);

    expect(handlePageChange).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }));
  });

  it("should display ellipsis for many pages", () => {
    render(() => (
      <TestWrapper>
        <Pagination count={100} pageSize={5} page={10} />
      </TestWrapper>
    ));
    const ellipsis = screen.getAllByText("⋯");
    expect(ellipsis.length).toBeGreaterThan(0);
  });

  it("should apply custom class", () => {
    const { container } = render(() => (
      <TestWrapper>
        <Pagination count={20} pageSize={5} class="custom-class" />
      </TestWrapper>
    ));
    const pagination = container.querySelector(".custom-class");
    expect(pagination).toBeInTheDocument();
  });

  it("should highlight current page", () => {
    render(() => (
      <TestWrapper>
        <Pagination count={20} pageSize={5} page={2} />
      </TestWrapper>
    ));
    const page2Button = screen.getByLabelText("Go to page 2");
    expect(page2Button).toHaveAttribute("data-selected");
  });
});
