const { timingSafeEqual } = require("node:crypto");
const { serializePublicTool } = require("./catalog/scoring");

const MAX_BODY_BYTES = 100 * 1024;

function sendJson(response, statusCode, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
  });
  response.end(body);
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    const contentType = request.headers["content-type"] || "";
    if (!/^application\/json(?:\s*;|$)/i.test(contentType)) {
      reject(
        Object.assign(new Error("Content-Type must be application/json"), {
          code: "UNSUPPORTED_MEDIA_TYPE",
        }),
      );
      return;
    }
    let size = 0;
    let tooLarge = false;
    const chunks = [];
    request.on("data", (chunk) => {
      if (tooLarge) return;
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        tooLarge = true;
        chunks.length = 0;
        reject(
          Object.assign(new Error("request body is too large"), {
            code: "BODY_TOO_LARGE",
          }),
        );
        request.resume();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => {
      if (tooLarge) return;
      if (!chunks.length) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch {
        reject(Object.assign(new Error("request body must be valid JSON"), { code: "INVALID_JSON" }));
      }
    });
    request.on("error", reject);
  });
}

function constantTimeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ""));
  const rightBuffer = Buffer.from(String(right || ""));
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function getBearerToken(request) {
  const authorization = request.headers.authorization || "";
  return authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
}

function mapStoreError(error) {
  if (error.code === "VALIDATION_ERROR") {
    return {
      status: 400,
      body: {
        error: "validation_error",
        message: error.message,
        details: error.details || [],
      },
    };
  }
  if (error.code === "DUPLICATE_PROJECT") {
    return {
      status: 409,
      body: {
        error: "duplicate_project",
        message: error.message,
        existingId: error.existingId,
      },
    };
  }
  if (error.code === "NOT_FOUND") {
    return {
      status: 404,
      body: { error: "not_found", message: error.message },
    };
  }
  if (error.code === "BODY_TOO_LARGE") {
    return {
      status: 413,
      body: { error: "body_too_large", message: error.message },
    };
  }
  if (error.code === "INVALID_JSON") {
    return {
      status: 400,
      body: { error: "invalid_json", message: error.message },
    };
  }
  if (error.code === "UNSUPPORTED_MEDIA_TYPE") {
    return {
      status: 415,
      body: { error: "unsupported_media_type", message: error.message },
    };
  }
  return null;
}

function createApiHandler({ store, adminToken = process.env.TUOYU_ADMIN_TOKEN } = {}) {
  if (!store) throw new Error("createApiHandler requires a catalog store");

  return async function handleApi(request, response) {
    const requestUrl = new URL(request.url, "http://localhost");
    if (!requestUrl.pathname.startsWith("/api/")) return false;

    const send = (status, payload) => sendJson(response, status, payload);

    try {
      if (request.method === "GET" && requestUrl.pathname === "/api/health") {
        send(200, {
          ok: true,
          service: "tuoyu-mcp-catalog",
          time: new Date().toISOString(),
        });
        return true;
      }

      if (request.method === "GET" && requestUrl.pathname === "/api/catalog/categories") {
        send(200, { categories: store.categories() });
        return true;
      }

      if (request.method === "GET" && requestUrl.pathname === "/api/catalog/search") {
        const includeSponsored = requestUrl.searchParams.get("includeSponsored") !== "false";
        const results = store.search({
          query: requestUrl.searchParams.get("q") || "",
          category: requestUrl.searchParams.get("category") || "",
          useCase: requestUrl.searchParams.get("useCase") || "",
          limit: requestUrl.searchParams.get("limit") || 10,
          includeSponsored,
        });
        send(200, {
          query: {
            text: requestUrl.searchParams.get("q") || "",
            category: requestUrl.searchParams.get("category") || null,
            useCase: requestUrl.searchParams.get("useCase") || null,
          },
          results,
          rankingPolicy: {
            formula: "finalScore = baseScore + paidBoost",
            maximumPaidBoost: 15,
            sponsoredResultsAreDisclosed: true,
            paidBoostCanBeDisabled: true,
          },
        });
        return true;
      }

      const publicToolMatch = requestUrl.pathname.match(/^\/api\/catalog\/tools\/([^/]+)$/);
      if (request.method === "GET" && publicToolMatch) {
        const tool = store.getById(decodeURIComponent(publicToolMatch[1]), {
          publicOnly: true,
        });
        if (!tool) {
          send(404, { error: "not_found", message: "approved tool not found" });
          return true;
        }
        send(200, { tool: serializePublicTool(tool) });
        return true;
      }

      if (request.method === "POST" && requestUrl.pathname === "/api/catalog/submissions") {
        const body = await readJsonBody(request);
        const tool = store.submit(body);
        send(201, {
          submission: {
            id: tool.id,
            name: tool.name,
            status: tool.status,
            reviewFlags: tool.reviewFlags,
            submittedAt: tool.submittedAt,
          },
          message: "Submitted for review. It will not appear in search results until approved.",
        });
        return true;
      }

      if (requestUrl.pathname.startsWith("/api/admin/")) {
        if (!adminToken) {
          send(503, {
            error: "admin_disabled",
            message: "Set TUOYU_ADMIN_TOKEN before using the admin API.",
          });
          return true;
        }
        if (!constantTimeEqual(getBearerToken(request), adminToken)) {
          send(401, {
            error: "unauthorized",
            message: "A valid admin bearer token is required.",
          });
          return true;
        }
      }

      if (request.method === "GET" && requestUrl.pathname === "/api/admin/tools") {
        const status = requestUrl.searchParams.get("status") || undefined;
        send(200, { tools: store.list({ status }) });
        return true;
      }

      const adminToolMatch = requestUrl.pathname.match(/^\/api\/admin\/tools\/([^/]+)$/);
      if (request.method === "PATCH" && adminToolMatch) {
        const body = await readJsonBody(request);
        const tool = store.review(decodeURIComponent(adminToolMatch[1]), body);
        send(200, { tool });
        return true;
      }

      if (request.method === "DELETE" && adminToolMatch) {
        const deletion = store.remove(decodeURIComponent(adminToolMatch[1]));
        send(200, { deletion });
        return true;
      }

      send(404, { error: "not_found", message: "API route not found" });
      return true;
    } catch (error) {
      const mapped = mapStoreError(error);
      if (mapped) {
        send(mapped.status, mapped.body);
        return true;
      }
      console.error("API request failed:", error);
      send(500, {
        error: "internal_error",
        message: "The request could not be completed.",
      });
      return true;
    }
  };
}

module.exports = {
  createApiHandler,
  readJsonBody,
  sendJson,
};
