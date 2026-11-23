import { DragDropManager } from "@dnd-kit/dom";
import { isSortable, Sortable } from "@dnd-kit/dom/sortable";
import { move } from "@dnd-kit/helpers";
import { type Accessor, createEffect, flush, onCleanup } from "solid-js";

type SavedPosition = {
  previous: Element | null;
  next: Element | null;
  parent: Element | null;
};

export type SortableList = {
  // Makes `element` sortable; with a `handle` only the handle starts a drag.
  register: (
    id: string,
    index: Accessor<number>,
    element: HTMLElement,
    handle?: HTMLElement,
  ) => void;
};

// dnd-kit moves DOM nodes while dragging, but Solid owns them: the source
// element is put back where Solid left it before the new order is written,
// and the write is flushed in the same listener, because dnd-kit removes its
// placeholder right after it. Without both, the DOM and the state drift apart.
// (The glue proven in design/dnd-kit-solid2-proof.tsx, after the Solid 1 adapter.)
export const createSortableList = (
  items: Accessor<ReadonlyArray<string>>,
  onReorder: (next: ReadonlyArray<string>) => void,
): SortableList => {
  const manager = new DragDropManager();
  let saved: SavedPosition | undefined;

  manager.monitor.addEventListener("beforedragstart", (event) => {
    const element = event.operation.source?.element;
    if (isSortable(event.operation.source) && element) {
      saved = {
        previous: element.previousElementSibling,
        next: element.nextElementSibling,
        parent: element.parentElement,
      };
    }
  });

  manager.monitor.addEventListener("dragend", (event) => {
    const element = event.operation.source?.element;
    const position = saved;
    saved = undefined;
    if (element && position) {
      if (position.previous && element.previousElementSibling !== position.previous) {
        position.previous.insertAdjacentElement("afterend", element);
      } else if (position.next && element.nextElementSibling !== position.next) {
        position.next.insertAdjacentElement("beforebegin", element);
      } else if (!(position.previous || position.next) && position.parent) {
        position.parent.appendChild(element);
      }
    }
    if (event.canceled) {
      return;
    }
    const next = move([...items()], event) as ReadonlyArray<string>;
    if (next.join("\n") === items().join("\n")) {
      return;
    }
    onReorder(next);
    flush();
  });

  onCleanup(() => manager.destroy());

  return {
    register: (id, index, element, handle) => {
      const sortable = new Sortable({ id, index: index(), element, handle }, manager);
      createEffect(index, (next) => {
        sortable.index = next;
      });
      onCleanup(() => sortable.destroy());
    },
  };
};
