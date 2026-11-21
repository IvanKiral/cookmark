// Router state rides on a plain link as a JSON string in its `state`
// attribute; the router parses it into location.state on navigation.
export const toLinkState = (state: unknown): string | undefined =>
  state === undefined || state === null ? undefined : JSON.stringify(state);
