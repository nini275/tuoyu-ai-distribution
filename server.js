const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { CatalogStore } = require("./src/catalog/store");
const { createApiHandler } = require("./src/api");

const root = __dirname;
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "127.0.0.1";
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

const publicFiles = new Set([
  "index.html",
  "app.js",
  "styles.css",
  "favicon.svg",
  "catalog.html",
  "catalog.css",
  "catalog.js",
  "admin.html",
  "admin.js",
  "admin.css",
  "vendor/lucide.min.js",
  "README.md",
  "MCP.md",
  "PRICING.md",
  "SUBSCRIPTION_TERMS.md",
  "STORE_PUBLISHING.md",
  "PRIVACY.md",
  "COPYRIGHT.md",
  "TRADEMARK.md",
  "THIRD_PARTY_NOTICES.md",
  "LICENSE",
  "NOTICE",
]);

function sendText(response, statusCode, message, contentType = "text/plain; charset=utf-8") {
  response.writeHead(statusCode, {
    "Content-Type": contentType,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Content-Security-Policy":
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
  });
  response.end(message);
}

function createTuoyuServer(options = {}) {
  const store =
    options.store ||
    new CatalogStore(options.dbPath || process.env.TUOYU_DB_PATH || undefined);
  const apiHandler = createApiHandler({
    store,
    adminToken:
      options.adminToken === undefined ? process.env.TUOYU_ADMIN_TOKEN : options.adminToken,
  });
  let storeClosed = false;

  const server = http.createServer(async (request, response) => {
    try {
      if (await apiHandler(request, response)) return;

      if (!["GET", "HEAD"].includes(request.method)) {
        sendText(response, 405, "Method not allowed");
        return;
      }

      const requestPath = decodeURIComponent(
        new URL(request.url, `http://${request.headers.host || "localhost"}`).pathname,
      );
      const relativePath = requestPath === "/" ? "index.html" : requestPath.replace(/^\/+/, "");
      const normalizedPath = path.posix.normalize(relativePath);
      if (!publicFiles.has(normalizedPath)) {
        sendText(response, 404, "Not found");
        return;
      }

      const filePath = path.resolve(root, normalizedPath);
      fs.readFile(filePath, (error, data) => {
        if (error) {
          sendText(
            response,
            error.code === "ENOENT" ? 404 : 500,
            error.code === "ENOENT" ? "Not found" : "Server error",
          );
          return;
        }

        const fileExtension = path.extname(filePath).toLowerCase();
        const fileName = path.basename(filePath);
        const contentType =
          mimeTypes[fileExtension] ||
          (["LICENSE", "NOTICE"].includes(fileName)
            ? "text/plain; charset=utf-8"
            : "application/octet-stream");

        response.writeHead(200, {
          "Content-Type": contentType,
          "Content-Length": data.length,
          "Cache-Control": "no-cache",
          "X-Content-Type-Options": "nosniff",
          "Referrer-Policy": "no-referrer",
          "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
          "Content-Security-Policy":
            "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
        });
        response.end(request.method === "HEAD" ? undefined : data);
      });
    } catch (error) {
      console.error("Request failed:", error);
      if (!response.headersSent) {
        sendText(response, 400, "Bad request");
      } else {
        response.end();
      }
    }
  });

  server.on("close", () => {
    if (!storeClosed) {
      storeClosed = true;
      store.close();
    }
  });
  server.catalogStore = store;
  return server;
}

if (require.main === module) {
  const server = createTuoyuServer();
  server.listen(port, host, () => {
    console.log(`Tuoyu is running at http://${host}:${port}`);
    console.log("MCP catalog API: /api/catalog/search");
  });

  const shutdown = () => {
    server.close(() => process.exit(0));
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

module.exports = {
  createTuoyuServer,
  publicFiles,
};
