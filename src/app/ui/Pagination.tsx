import { Pagination as KobaltePagination } from "@kobalte/core/pagination";
import type { Component } from "solid-js";
import { Show } from "solid-js";
import styles from "./Pagination.module.css";
import { uiStrings } from "./strings.ts";

type PaginationProps = {
  count: number;
  pageSize: number;
  page?: number;
  onPageChange?: (details: { page: number }) => void;
  class?: string;
};

export const Pagination: Component<PaginationProps> = (props) => {
  const pageCount = (): number => Math.ceil(props.count / props.pageSize);

  return (
    <Show when={props.count > props.pageSize}>
      <KobaltePagination
        count={pageCount()}
        page={props.page}
        onPageChange={(page) => props.onPageChange?.({ page })}
        siblingCount={1}
        // The same number of buttons on every page, so the bar doesn't shift.
        fixedItems
        aria-label={uiStrings.pagination.label}
        class={`${styles.pagination} ${props.class || ""}`}
        itemComponent={(itemProps) => (
          <KobaltePagination.Item
            page={itemProps.page}
            class={styles.pageItem}
            aria-label={uiStrings.pagination.goToPage(itemProps.page)}
          >
            {itemProps.page}
          </KobaltePagination.Item>
        )}
        ellipsisComponent={() => (
          <KobaltePagination.Ellipsis class={styles.ellipsis}>⋯</KobaltePagination.Ellipsis>
        )}
      >
        <KobaltePagination.Previous
          class={styles.trigger}
          aria-label={uiStrings.pagination.previous}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M10 12L6 8L10 4"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span class={styles.triggerText}>{uiStrings.pagination.previous}</span>
        </KobaltePagination.Previous>
        <KobaltePagination.Items />
        <KobaltePagination.Next class={styles.trigger} aria-label={uiStrings.pagination.next}>
          <span class={styles.triggerText}>{uiStrings.pagination.next}</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M6 12L10 8L6 4"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </KobaltePagination.Next>
      </KobaltePagination>
    </Show>
  );
};
