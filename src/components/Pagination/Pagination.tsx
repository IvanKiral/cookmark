import { Pagination as ArkPagination } from "@ark-ui/solid/pagination";
import type { Component } from "solid-js";
import { For, Show } from "solid-js";
import { strings } from "~/constants/strings";
import styles from "./Pagination.module.css";

type PaginationProps = {
  count: number;
  pageSize: number;
  page?: number;
  onPageChange?: (details: { page: number }) => void;
  class?: string;
};

export const Pagination: Component<PaginationProps> = (props) => {
  return (
    <Show when={props.count > props.pageSize}>
      <ArkPagination.Root
        count={props.count}
        pageSize={props.pageSize}
        page={props.page}
        onPageChange={props.onPageChange}
        siblingCount={1}
        class={`${styles.pagination} ${props.class || ""}`}
      >
        <ArkPagination.PrevTrigger class={styles.trigger} aria-label={strings.pagination.previous}>
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
          <span class={styles.triggerText}>{strings.pagination.previous}</span>
        </ArkPagination.PrevTrigger>

        <ArkPagination.Context>
          {(api) => (
            <div class={styles.pages}>
              <For each={api().pages}>
                {(page, index) =>
                  page.type === "page" ? (
                    <ArkPagination.Item
                      {...page}
                      class={styles.pageItem}
                      aria-label={strings.pagination.goToPage(page.value)}
                    >
                      {page.value}
                    </ArkPagination.Item>
                  ) : (
                    <ArkPagination.Ellipsis index={index()} class={styles.ellipsis}>
                      ⋯
                    </ArkPagination.Ellipsis>
                  )
                }
              </For>
            </div>
          )}
        </ArkPagination.Context>

        <ArkPagination.NextTrigger class={styles.trigger} aria-label={strings.pagination.next}>
          <span class={styles.triggerText}>{strings.pagination.next}</span>
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
        </ArkPagination.NextTrigger>
      </ArkPagination.Root>
    </Show>
  );
};
