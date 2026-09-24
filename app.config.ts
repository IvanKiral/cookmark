import { defineConfig } from "@solidjs/start/config";
import { visualizer } from "rollup-plugin-visualizer";
import { VitePWA } from "vite-plugin-pwa";
import { getPrerenderRoutes } from "./scripts/getPrerenderRoutes.ts";
import { getVideoSlugs } from "./scripts/getVideoSlugs.ts";

// Single source of truth for the deploy base path (trailing slash included).
// GitHub Pages (project site) sets it to "/cookmark/"; Cloudflare Pages (root) uses "/".
const basePath = process.env.VITE_BASE_URL ?? "/";

// The static GitHub Pages build prerenders every recipe from the local bundle.
// Cloudflare serves recipes dynamically from R2, so it renders on demand.
const isStaticBuild = process.env.SERVER_PRESET === "github-pages";

// Baked into the bundle so recipe pages know which slugs have a video to stream.
const videoSlugs = getVideoSlugs();

export default defineConfig({
  vite: {
    define: {
      __VIDEO_SLUGS__: JSON.stringify(videoSlugs),
    },
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
          scope: basePath,
          start_url: basePath,
          categories: ["food", "lifestyle"],
          icons: [
            {
              src: `${basePath}web-app-manifest-192x192.png`,
              sizes: "192x192",
              type: "image/png",
              purpose: "maskable any",
            },
            {
              src: `${basePath}web-app-manifest-512x512.png`,
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
              url: basePath,
              icons: [{ src: `${basePath}favicon-96x96.png`, sizes: "96x96" }],
            },
          ],
        },
      }),
    ],
  },
  server: {
    // Default target is a Cloudflare Worker with Static Assets: it serves the
    // prerendered site for free and runs dynamic routes (e.g. media streamed
    // from R2). GitHub Pages builds pass SERVER_PRESET=github-pages for a pure
    // static site (no server runtime).
    preset: process.env.SERVER_PRESET ?? "cloudflare_module",
    // A literal "/" here makes the server-function mount resolve to "//_server"
    // (a protocol-relative URL), so only set baseURL for a real sub-path.
    baseURL: basePath === "/" ? undefined : basePath,
    prerender: {
      routes: isStaticBuild ? (getPrerenderRoutes(basePath) as string[]) : [],
    },
    // Runtime-only routes (R2 streaming, per-user favourites) — never prerender.
    routeRules: {
      "/media/**": { prerender: false },
      "/thumbnails/**": { prerender: false },
      "/recipe-images/**": { prerender: false },
      "/api/**": { prerender: false },
    },
    // Merged into the wrangler config nitro generates at .output/server.
    // The ASSETS binding and `main` are added automatically by the preset.
    cloudflare: {
      // Generate .output/server/wrangler.json (+ deploy redirect) and enable
      // nodejs_compat so `wrangler deploy` works from the project root.
      deployConfig: true,
      wrangler: {
        name: "cookmark",
        compatibility_date: "2025-07-15",
        // Per-user favourites trust the Access JWT, so the app must only be
        // reachable through the Access-fronted custom domain — not workers.dev.
        workers_dev: false,
        // Serve the app from the Access-protected custom domain.
        routes: [{ pattern: "cookmark.kiralivan.eu", custom_domain: true }],
        // Private bucket holding recipe videos (videos/<slug>.mp4), thumbnails
        // (thumbnails/<slug>.jpg) and image recipe sources (recipe-images/<slug>.<ext>).
        r2_buckets: [{ binding: "MEDIA", bucket_name: "cookmark" }],
        // Per-user favourite recipe slugs, keyed by Access email.
        kv_namespaces: [{ binding: "FAVORITES", id: "9be88640af5546f5b2341287ae842757" }],
        d1_databases: [
          {
            binding: "RECIPE_INBOX",
            database_name: "cookmark-recipe-inbox",
            database_id: "aa058d7c-4a35-4b14-9d67-5e799eff98ba",
          },
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
