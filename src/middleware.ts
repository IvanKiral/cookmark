import routes from "virtual:file-routes";
import { createAPIHandler } from "filesystem-routing/api";

// Runs in front of every request: serves the GET/PUT/DELETE exports of the
// route modules (src/routes/api, media, thumbnails, recipe-images) and passes
// everything else on to the page render.
export default [createAPIHandler(routes)];
