import solid from "vite-plugin-solid";
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  plugins: [solid()],
  resolve: {
    conditions: ["development", "browser"],
    alias: {
      "~": path.resolve(__dirname, "./src"),
    },
  },
});
