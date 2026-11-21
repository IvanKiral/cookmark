import { configure } from "@testing-library/dom";
import { flush } from "solid-js";

// Solid 2 applies signal writes on the next microtask. Flushing after every
// fireEvent lets a test assert on the DOM right after the event, as it did
// with Solid 1.
configure({
  eventWrapper: (callback) => {
    const result = callback();
    flush();
    return result;
  },
});
