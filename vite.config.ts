import { fileURLToPath } from "node:url";
import { cloudflare } from "@cloudflare/vite-plugin";
import solid from "@solidjs/vite-plugin";
import { fileRoutes } from "filesystem-routing/vite";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { LOCAL_ADMIN_EMAIL } from "./scripts/localWrangler.ts";

export default defineConfig(({ command, isPreview }) => ({
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 3000,
  },
  plugins: [
    // Runs the server side in workerd with the bindings from wrangler.jsonc,
    // in dev as in production. Local D1 and R2 live in .wrangler/state, which
    // `pnpm local:setup` fills. It has to come before solid() so the Worker
    // takes over Solid's ssr environment.
    cloudflare({
      viteEnvironment: { name: "ssr" },
      // `pnpm dev` signs in as LOCAL_USER_EMAIL (default: the seeded admin).
      // Only for the dev server, so the variable never reaches a build.
      config:
        command === "serve" && !isPreview
          ? {
              vars: { LOCAL_USER_EMAIL: process.env.LOCAL_USER_EMAIL ?? LOCAL_ADMIN_EMAIL },
            }
          : undefined,
    }),
    // Start mode: generated entries around src/app.tsx inside src/Document.tsx,
    // streaming SSR and "use server" functions served from /_server.
    solid({
      start: { middleware: "./src/middleware.ts", clientSetup: "./src/clientSetup.ts" },
      ssr: true,
      serverFunctions: true,
      // Also compiles the `?pick=` route modules the fileRoutes plugin emits.
      extensions: [".jsx", ".tsx"],
    }),
    // Pages and the GET/PUT/DELETE exports of src/routes; the API ones are
    // dispatched by the middleware.
    fileRoutes({ httpMethods: true }),
    // Only the client build: the server bundle has no use for the manifest.
    ...VitePWA({
      registerType: "autoUpdate",
      injectRegister: false,
      devOptions: {
        enabled: false,
      },
      workbox: {
        // Pages are server-rendered, so there is no index.html to fall back to.
        navigateFallback: null,
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
    }).map((plugin) => ({
      ...plugin,
      applyToEnvironment: (environment: { name: string }) => environment.name === "client",
    })),
  ],
}));
