import { defineConfig } from "@solidjs/start/config";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  vite: {
    plugins: [
      visualizer({
        filename: "bundle-report.html",
        template: "treemap",
        gzipSize: true,
        brotliSize: true,
      }) as unknown as import("vite").PluginOption,
    ],
  },
  server: {
    preset: "github-pages",
    prerender: {
      routes: ["/", "/en", "/sk"],
    },
  },
});
