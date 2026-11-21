import { defineConfig } from "@solidjs/start/config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  vite: {
    plugins: [
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
          scope: "/",
          start_url: "/",
          categories: ["food", "lifestyle"],
          icons: [
            {
              src: "/web-app-manifest-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "maskable any",
            },
            {
              src: "/web-app-manifest-512x512.png",
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
              url: "/",
              icons: [{ src: "/favicon-96x96.png", sizes: "96x96" }],
            },
          ],
        },
      }),
    ],
  },
  server: {
    // A Cloudflare Worker with Static Assets: it serves the client assets and
    // renders pages and API routes on demand.
    preset: "cloudflare_module",
    // Generates .output/server/wrangler.json for `wrangler deploy` from
    // wrangler.jsonc plus the build output (entry point and static assets).
    cloudflare: {
      deployConfig: true,
    },
  },
});
