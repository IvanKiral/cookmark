// A fetch response the test resolves by hand, to check the UI while a save is
// still in flight.
export const createPendingResponse = (): PromiseWithResolvers<Response> =>
  Promise.withResolvers<Response>();

// A real request never answers in the same task as the click. Under Solid
// 2.0.3 a save that resolves a microtask or two after the click is lost, so
// tests let a task pass before resolving it.
export const nextTask = (): Promise<void> => new Promise((done) => setTimeout(done, 0));
