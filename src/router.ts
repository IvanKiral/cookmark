import { pageRoutes } from "virtual:file-routes";
import { createRouter } from "@solidjs/router";
import { fileRoutes } from "@solidjs/router/fs";

// The pages under src/routes, scanned by the fileRoutes plugin in vite.config.ts.
export const Router = createRouter({ routes: fileRoutes(pageRoutes) });
