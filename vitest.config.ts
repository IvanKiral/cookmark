import { fileURLToPath } from "node:url";
import solid from "@solidjs/vite-plugin";
import { defineConfig } from "vitest/config";

const fromRoot = (path: string): string => fileURLToPath(new URL(path, import.meta.url));

// Separate from vite.config.ts so tests run without the Cloudflare and start
// mode plugins.
export default defineConfig({
  plugins: [solid()],
  resolve: {
    alias: {
      "~": fromRoot("./src"),
      "cloudflare:workers": fromRoot("./src/server/testing/cloudflareWorkersStub.ts"),
    },
  },
  test: {
    globals: true,
    projects: [
      {
        extends: true,
        test: {
          name: "components",
          environment: "jsdom",
          include: ["src/**/*.test.tsx"],
          setupFiles: ["./src/testing/setupTests.ts"],
        },
      },
      {
        extends: true,
        test: { name: "logic", environment: "node", include: ["src/**/*.test.ts"] },
      },
    ],
  },
});
