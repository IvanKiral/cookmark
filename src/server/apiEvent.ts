// What an API route handler receives: the createAPIHandler middleware
// (src/middleware.ts) dispatches it with the matched path params written onto
// the request event.
export type APIEvent = {
  request: Request;
  params: Readonly<Record<string, string>>;
};
