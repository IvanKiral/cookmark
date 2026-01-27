import { defineConfig } from "@solidjs/start/config";
import { visualizer } from "rollup-plugin-visualizer";
import { VitePWA } from "vite-plugin-pwa";
import { getPrerenderRoutes } from "./scripts/getPrerenderRoutes.ts";

export default defineConfig({
  vite: {
    plugins: [
      visualizer({
        filename: "bundle-report.html",
        template: "treemap",
        gzipSize: true,
        brotliSize: true,
      }) as unknown as import("vite").PluginOption,
      VitePWA({
        registerType: "autoUpdate",
        devOptions: {
          enabled: false,
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff,woff2}"],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts-cache",
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
              handler: "CacheFirst",
              options: {
                cacheName: "images-cache",
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
              },
            },
          ],
        },
        manifest: {
          name: "Cookmark - Recipe Book",
          short_name: "Cookmark",
          description: "A modern recipe book application with search and filtering capabilities",
          theme_color: "#ffffff",
          background_color: "#ffffff",
          display: "standalone",
          scope: "/cookmark/",
          start_url: "/cookmark/",
          categories: ["food", "lifestyle"],
          icons: [
            {
              src: "/cookmark/web-app-manifest-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "maskable any",
            },
            {
              src: "/cookmark/web-app-manifest-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable any",
            },
          ],
          shortcuts: [
            {
              name: "Search Recipes",
              short_name: "Search",
              description: "Search for recipes",
              url: "/cookmark/",
              icons: [{ src: "/cookmark/favicon-96x96.png", sizes: "96x96" }],
            },
          ],
        },
      }),
    ],
  },
  server: {
    preset: "github-pages",
    baseURL: process.env.GITHUB_REPOSITORY
      ? `/${process.env.GITHUB_REPOSITORY.split("/")[1]}/`
      : "/",
    prerender: {
      routes: getPrerenderRoutes() as string[],
    },
  },
});
