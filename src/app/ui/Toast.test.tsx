import { describe, expect, it, vi } from "vitest";
import { showToast } from "./Toast.tsx";

const { toaster } = vi.hoisted(() => ({
  toaster: { clear: vi.fn(), show: vi.fn() },
}));

vi.mock("@kobalte/core/toast", () => ({ Toast: () => null, toaster }));

describe("showToast", () => {
  it("clears the current toast before showing the new one", () => {
    showToast("Saved Soups");
    expect(toaster.clear).toHaveBeenCalledTimes(1);
    expect(toaster.show).toHaveBeenCalledTimes(1);
    expect(toaster.clear.mock.invocationCallOrder[0]).toBeLessThan(
      toaster.show.mock.invocationCallOrder[0] ?? 0,
    );
  });
});
