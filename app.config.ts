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
    // Merged into the wrangler config nitro generates at .output/server.
    // The ASSETS binding and `main` are added automatically by the preset.
    cloudflare: {
      // Generate .output/server/wrangler.json (+ deploy redirect) and enable
      // nodejs_compat so `wrangler deploy` works from the project root.
      deployConfig: true,
      wrangler: {
        name: "cookmark",
        compatibility_date: "2025-07-15",
        // Per-user data (favourites, roles) trusts the Access JWT, so the app
        // must only be reachable through the Access-fronted custom domain — not
        // workers.dev.
        // The JWT is verified with two Worker secrets (set via `wrangler secret
        // put`, which survive deploys unlike `vars`): ACCESS_TEAM_DOMAIN
        // (https://<team-name>.cloudflareaccess.com) and ACCESS_AUD (the Access
        // application's AUD tag). Without them every request is unauthenticated.
        workers_dev: false,
        // Serve the app from the Access-protected custom domain.
        routes: [{ pattern: "cookmark.kiralivan.eu", custom_domain: true }],
        // Private bucket holding recipe videos (videos/<slug>.mp4), thumbnails
        // (thumbnails/<slug>.jpg) and image recipe sources (recipe-images/<slug>.<ext>).
        r2_buckets: [{ binding: "MEDIA", bucket_name: "cookmark" }],
        d1_databases: [
          // Recipes plus users and their per-user recipe marks (favourites).
          {
            binding: "RECIPES",
            database_name: "cookmark-recipes",
            database_id: "05f0777c-5a1b-43d9-a148-6ee5ea95d42d",
          },
        ],
      },
    },
  },
});
