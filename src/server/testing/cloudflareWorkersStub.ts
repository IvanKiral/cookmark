// Test stand-in for the `cloudflare:workers` module (aliased in
// vitest.config.ts). Tests set the bindings they need with setTestEnv.
export const env: Record<string, unknown> = {};

export const setTestEnv = (values: Record<string, unknown>): void => {
  for (const key of Object.keys(env)) {
    delete env[key];
  }
  Object.assign(env, values);
};
