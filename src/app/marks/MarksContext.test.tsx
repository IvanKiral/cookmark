import { cleanup, fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPendingResponse, nextTask } from "~/testing/pendingResponse.ts";
import { MarkButton } from "./MarkButton.tsx";
import { MarksProvider } from "./MarksContext.tsx";

describe("<MarksProvider />", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  const renderSoup = () =>
    render(() => (
      <MarksProvider>
        <MarkButton mark="favorite" slug="soup" name="Soup" />
      </MarksProvider>
    ));

  // The lists answer at once; a save answers with the given pending response.
  const stubFetch = (favorites: ReadonlyArray<string>, save?: Promise<Response>): void => {
    fetchMock.mockImplementation((url: string, init?: RequestInit) => {
      if (init?.method && save) {
        return save;
      }
      return Promise.resolve(Response.json({ slugs: url === "/api/favorites" ? favorites : [] }));
    });
  };

  const renderLoaded = async (): Promise<HTMLElement> => {
    renderSoup();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    await nextTask();
    return screen.getByRole("button");
  };

  it("shows the marks saved on the server", async () => {
    stubFetch(["soup"]);
    renderSoup();
    await waitFor(() => expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true"));
  });

  it("shows the mark while it is saved and keeps it once saved", async () => {
    const save = createPendingResponse();
    stubFetch([], save.promise);
    const button = await renderLoaded();

    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(fetchMock).toHaveBeenCalledWith("/api/favorites/soup", { method: "PUT" });

    await nextTask();
    save.resolve(new Response(null, { status: 204 }));
    await nextTask();
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveAccessibleName("Remove Soup from favourites");
  });

  it("removes the mark again when the save fails", async () => {
    const save = createPendingResponse();
    stubFetch([], save.promise);
    const button = await renderLoaded();

    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-pressed", "true");

    await nextTask();
    save.resolve(new Response("Forbidden", { status: 403 }));
    await waitFor(() => expect(button).toHaveAttribute("aria-pressed", "false"));
  });

  it("puts a removed mark back when the save fails", async () => {
    const save = createPendingResponse();
    stubFetch(["soup"], save.promise);
    const button = await renderLoaded();
    expect(button).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(fetchMock).toHaveBeenCalledWith("/api/favorites/soup", { method: "DELETE" });

    await nextTask();
    save.resolve(new Response("Forbidden", { status: 403 }));
    await waitFor(() => expect(button).toHaveAttribute("aria-pressed", "true"));
  });
});
