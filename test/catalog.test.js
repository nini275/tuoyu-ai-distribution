const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const { once } = require("node:events");
const test = require("node:test");

const { createTuoyuServer } = require("../server");
const { CatalogStore } = require("../src/catalog/store");
const {
  handleMessage,
  LATEST_PROTOCOL_VERSION,
} = require("../src/mcp-server");

const ADMIN_TOKEN = "test-admin-token-1234567890";

function createTempDatabase() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "tuoyu-catalog-"));
  return {
    directory,
    dbPath: path.join(directory, "catalog.sqlite"),
  };
}

async function closeTestContext(context) {
  if (context.server.listening) {
    await new Promise((resolve, reject) => {
      context.server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
      context.server.closeAllConnections();
    });
  }
  fs.rmSync(context.directory, { recursive: true, force: true });
}

async function startTestContext(t) {
  const database = createTempDatabase();
  const server = createTuoyuServer({
    dbPath: database.dbPath,
    adminToken: ADMIN_TOKEN,
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");

  const address = server.address();
  const context = {
    ...database,
    server,
    store: server.catalogStore,
    origin: `http://127.0.0.1:${address.port}`,
  };
  t.after(() => closeTestContext(context));
  return context;
}

async function apiRequest(context, pathname, options = {}) {
  const headers = {
    Accept: "application/json",
    ...(options.headers || {}),
  };
  const response = await fetch(`${context.origin}${pathname}`, {
    ...options,
    headers,
  });
  const rawBody = await response.text();
  let payload = null;
  if (rawBody) {
    try {
      payload = JSON.parse(rawBody);
    } catch {
      payload = rawBody;
    }
  }
  return { response, payload };
}

async function adminRequest(context, pathname, options = {}) {
  const headers = {
    Authorization: `Bearer ${options.token || ADMIN_TOKEN}`,
    ...(options.headers || {}),
  };
  let body = options.body;
  if (body !== undefined && typeof body !== "string") {
    body = JSON.stringify(body);
  }
  if (body !== undefined) headers["Content-Type"] = "application/json";
  return apiRequest(context, pathname, {
    method: options.method || "GET",
    headers,
    body,
  });
}

function submissionInput(overrides = {}) {
  const unique = randomUUID();
  return {
    name: `测试项目 ${unique.slice(0, 8)}`,
    description:
      "这是一个用于验证拓域目录审核、检索和 MCP 推荐流程的开源软件项目。它说明主要功能、适用用户、部署方式、使用边界与公开链接，便于审核人员判断质量和相关性。",
    repoUrl: `https://github.com/tuoyu-test/${unique}`,
    websiteUrl: `https://example.com/projects/${unique}`,
    category: "自动化测试",
    tags: ["测试", `tag-${unique.slice(0, 8)}`],
    useCases: ["验证项目发布审核流程"],
    githubStars: 256,
    lastUpdated: "2026-10-01T00:00:00.000Z",
    ...overrides,
  };
}

async function submitProject(context, input) {
  return apiRequest(context, "/api/catalog/submissions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

async function reviewProject(context, id, body) {
  return adminRequest(context, `/api/admin/tools/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body,
  });
}

async function searchCatalog(context, params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) search.set(key, String(value));
  }
  return apiRequest(context, `/api/catalog/search?${search}`);
}

test("pending and rejected projects stay private until approved", async (t) => {
  const context = await startTestContext(t);
  const uniqueTag = `review-${randomUUID().slice(0, 8)}`;
  const input = submissionInput({
    category: "审核隔离测试",
    tags: [uniqueTag],
    useCases: ["检索中文审核流程"],
  });

  const submitted = await submitProject(context, input);
  assert.equal(submitted.response.status, 201);
  assert.equal(submitted.payload.submission.status, "pending");
  const id = submitted.payload.submission.id;

  const pendingSearch = await searchCatalog(context, { q: uniqueTag });
  assert.equal(pendingSearch.response.status, 200);
  assert.equal(
    pendingSearch.payload.results.some((result) => result.id === id),
    false,
  );

  const rejected = await reviewProject(context, id, { status: "rejected" });
  assert.equal(rejected.response.status, 200);
  assert.equal(rejected.payload.tool.status, "rejected");

  const rejectedSearch = await searchCatalog(context, { q: uniqueTag });
  assert.equal(
    rejectedSearch.payload.results.some((result) => result.id === id),
    false,
  );

  const approved = await reviewProject(context, id, {
    status: "approved",
    reviewNote: "链接与描述已核验",
  });
  assert.equal(approved.response.status, 200);
  assert.equal(approved.payload.tool.status, "approved");

  const approvedSearch = await searchCatalog(context, {
    q: uniqueTag,
    category: "审核隔离测试",
  });
  const approvedResult = approvedSearch.payload.results.find((result) => result.id === id);
  assert.ok(approvedResult);
  assert.equal(approvedResult.review.status, "approved");
  assert.equal(approvedResult.links.repository, approved.payload.tool.repoUrl);

  const publicDetail = await apiRequest(
    context,
    `/api/catalog/tools/${encodeURIComponent(id)}`,
  );
  assert.equal(publicDetail.response.status, 200);
  assert.equal(publicDetail.payload.tool.id, id);
  assert.equal(Object.hasOwn(publicDetail.payload.tool, "reviewNote"), false);
  assert.equal(Object.hasOwn(publicDetail.payload.tool, "promotionActive"), false);

  const useCaseSearch = await searchCatalog(context, {
    useCase: "检索中文审核流程",
    category: "审核隔离测试",
  });
  assert.ok(useCaseSearch.payload.results.some((result) => result.id === id));
});

test("duplicate project links return a conflict response", async (t) => {
  const context = await startTestContext(t);
  const input = submissionInput();

  const first = await submitProject(context, input);
  assert.equal(first.response.status, 201);

  const duplicate = await submitProject(context, {
    ...input,
    name: "Duplicate Submission",
  });
  assert.equal(duplicate.response.status, 409);
  assert.equal(duplicate.payload.error, "duplicate_project");
  assert.equal(duplicate.payload.existingId, first.payload.submission.id);
});

test("paid boosts are capped, disclosed, optional, and reset with tier none", async (t) => {
  const context = await startTestContext(t);
  const sharedTag = `weighted-${randomUUID().slice(0, 8)}`;
  const sharedMetadata = {
    category: "付费加权测试",
    tags: [sharedTag, "推广"],
    useCases: ["统一推广测试场景"],
    githubStars: 900,
    lastUpdated: "2026-10-10T00:00:00.000Z",
  };

  const boostInput = submissionInput({
    ...sharedMetadata,
    name: "Boost Candidate",
  });
  const featuredInput = submissionInput({
    ...sharedMetadata,
    name: "Featured Candidate",
  });
  const boostSubmit = await submitProject(context, boostInput);
  const featuredSubmit = await submitProject(context, featuredInput);
  const boostId = boostSubmit.payload.submission.id;
  const featuredId = featuredSubmit.payload.submission.id;

  const boostReview = await reviewProject(context, boostId, {
    status: "approved",
    promotionTier: "boost",
    promotionActive: true,
  });
  const featuredReview = await reviewProject(context, featuredId, {
    status: "approved",
    promotionTier: "featured",
    promotionActive: true,
  });
  assert.equal(boostReview.payload.tool.promotionActive, true);
  assert.equal(featuredReview.payload.tool.promotionActive, true);

  const sponsoredSearch = await searchCatalog(context, {
    q: sharedTag,
    includeSponsored: true,
  });
  assert.equal(sponsoredSearch.response.status, 200);
  assert.equal(sponsoredSearch.payload.results[0].id, featuredId);
  const featuredResult = sponsoredSearch.payload.results.find(
    (result) => result.id === featuredId,
  );
  const boostResult = sponsoredSearch.payload.results.find((result) => result.id === boostId);
  assert.equal(featuredResult.ranking.paidBoost, 15);
  assert.equal(featuredResult.isPaidPlacement, true);
  assert.equal(featuredResult.paidPlacement.tier, "featured");
  assert.equal(featuredResult.paidPlacement.label, "付费推广");
  assert.equal(boostResult.ranking.paidBoost, 8);
  assert.equal(boostResult.ranking.finalScore, boostResult.ranking.baseScore + 8);

  const unsponsoredSearch = await searchCatalog(context, {
    q: sharedTag,
    includeSponsored: false,
  });
  for (const result of unsponsoredSearch.payload.results) {
    assert.equal(result.ranking.paidBoost, 0);
    assert.equal(result.ranking.finalScore, result.ranking.baseScore);
    assert.equal(result.isPaidPlacement, false);
    assert.equal(result.paidPlacement, null);
  }

  const tierReset = await reviewProject(context, boostId, {
    promotionTier: "none",
  });
  assert.equal(tierReset.response.status, 200);
  assert.equal(tierReset.payload.tool.status, "approved");
  assert.equal(tierReset.payload.tool.promotionTier, "none");
  assert.equal(tierReset.payload.tool.promotionActive, false);

  const resetSearch = await searchCatalog(context, {
    q: sharedTag,
    includeSponsored: true,
  });
  const resetResult = resetSearch.payload.results.find((result) => result.id === boostId);
  assert.equal(resetResult.ranking.paidBoost, 0);
  assert.equal(resetResult.isPaidPlacement, false);
});

test("MCP supports initialization, tool listing, search, and recommendations", async () => {
  const store = new CatalogStore(":memory:");
  try {
    const initialized = await handleMessage(
      {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: LATEST_PROTOCOL_VERSION,
          capabilities: {},
          clientInfo: { name: "catalog-test", version: "1.0.0" },
        },
      },
      store,
    );
    assert.equal(initialized.result.protocolVersion, LATEST_PROTOCOL_VERSION);
    assert.equal(initialized.result.serverInfo.name, "tuoyu-mcp-catalog");
    assert.equal(initialized.result.capabilities.tools.listChanged, false);

    const listed = await handleMessage(
      {
        jsonrpc: "2.0",
        id: 2,
        method: "tools/list",
      },
      store,
    );
    assert.deepEqual(
      listed.result.tools.map((tool) => tool.name).sort(),
      ["recommend_tools", "search_tools"],
    );

    const sponsoredTag = `mcp-sponsored-${randomUUID().slice(0, 8)}`;
    const input = submissionInput({
      name: "MCP Sponsored Toolkit",
      category: "MCP 测试",
      tags: [sponsoredTag],
      useCases: ["通过 MCP 调用推荐工具"],
    });
    const submitted = store.submit(input);
    store.review(submitted.id, {
      status: "approved",
      promotionTier: "featured",
      promotionActive: true,
    });

    const searched = await handleMessage(
      {
        jsonrpc: "2.0",
        id: 3,
        method: "tools/call",
        params: {
          name: "search_tools",
          arguments: {
            query: sponsoredTag,
            include_sponsored: true,
          },
        },
      },
      store,
    );
    assert.equal(searched.result.isError, false);
    assert.equal(searched.result.structuredContent.sponsored_count, 1);
    assert.equal(searched.result.structuredContent.results[0].id, submitted.id);
    assert.equal(searched.result.structuredContent.results[0].ranking.paidBoost, 15);
    assert.equal(
      searched.result.structuredContent.results[0].paidPlacement.label,
      "付费推广",
    );
    assert.equal(
      JSON.parse(searched.result.content[0].text).results[0].isPaidPlacement,
      true,
    );

    const invalidRecommendation = await handleMessage(
      {
        jsonrpc: "2.0",
        id: 31,
        method: "tools/call",
        params: {
          name: "recommend_tools",
          arguments: {},
        },
      },
      store,
    );
    assert.equal(invalidRecommendation.error.code, -32602);
    assert.match(invalidRecommendation.error.message, /need is required/);

    const recommended = await handleMessage(
      {
        jsonrpc: "2.0",
        id: 4,
        method: "tools/call",
        params: {
          name: "recommend_tools",
          arguments: {
            need: "本地运行大模型并暴露 API",
            limit: 5,
          },
        },
      },
      store,
    );
    assert.equal(recommended.result.isError, false);
    assert.ok(recommended.result.structuredContent.result_count >= 1);
    assert.ok(
      recommended.result.structuredContent.results.some(
        (result) => result.name === "Ollama",
      ),
    );
  } finally {
    store.close();
  }
});

test("admin routes require the bearer token", async (t) => {
  const context = await startTestContext(t);

  const missing = await apiRequest(context, "/api/admin/tools");
  assert.equal(missing.response.status, 401);
  assert.equal(missing.payload.error, "unauthorized");

  const wrong = await adminRequest(context, "/api/admin/tools", {
    token: "wrong-token-1234567890",
  });
  assert.equal(wrong.response.status, 401);

  const accepted = await adminRequest(context, "/api/admin/tools");
  assert.equal(accepted.response.status, 200);
  assert.ok(Array.isArray(accepted.payload.tools));
});

test("submission API rejects malformed, unsafe, and oversized input", async (t) => {
  const context = await startTestContext(t);

  const unsupportedType = await apiRequest(context, "/api/catalog/submissions", {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(submissionInput()),
  });
  assert.equal(unsupportedType.response.status, 415);

  const invalidJson = await apiRequest(context, "/api/catalog/submissions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{",
  });
  assert.equal(invalidJson.response.status, 400);
  assert.equal(invalidJson.payload.error, "invalid_json");

  const unsafeUrl = await submitProject(
    context,
    submissionInput({
      repoUrl: "javascript:alert(1)",
      websiteUrl: "",
    }),
  );
  assert.equal(unsafeUrl.response.status, 400);
  assert.equal(unsafeUrl.payload.error, "validation_error");
  assert.ok(unsafeUrl.payload.details.some((detail) => detail.includes("http or https")));

  const overlongField = await submitProject(
    context,
    submissionInput({
      name: "x".repeat(101),
    }),
  );
  assert.equal(overlongField.response.status, 400);
  assert.ok(overlongField.payload.details.some((detail) => detail.includes("at most 100")));

  const oversizedBody = await submitProject(context, {
    ...submissionInput(),
    description: "x".repeat(110 * 1024),
  });
  assert.equal(oversizedBody.response.status, 413);
  assert.equal(oversizedBody.payload.error, "body_too_large");
});

test("SQLite catalog records survive a store restart", () => {
  const database = createTempDatabase();
  let firstStore = null;
  let secondStore = null;
  try {
    firstStore = new CatalogStore(database.dbPath);
    const submitted = firstStore.submit(submissionInput({ category: "持久化测试" }));
    firstStore.review(submitted.id, {
      status: "approved",
      reviewNote: "重启后仍应存在",
    });
    firstStore.close();
    firstStore = null;

    secondStore = new CatalogStore(database.dbPath);
    const restored = secondStore.getById(submitted.id, { publicOnly: true });
    assert.ok(restored);
    assert.equal(restored.status, "approved");
    assert.equal(restored.category, "持久化测试");
    assert.equal(restored.reviewNote, "重启后仍应存在");
  } finally {
    firstStore?.close();
    secondStore?.close();
    fs.rmSync(database.directory, { recursive: true, force: true });
  }
});

test("admins can permanently delete a project", async (t) => {
  const context = await startTestContext(t);
  const submitted = await submitProject(context, submissionInput());
  const id = submitted.payload.submission.id;

  await reviewProject(context, id, { status: "approved" });

  const deleted = await adminRequest(context, `/api/admin/tools/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  assert.equal(deleted.response.status, 200);
  assert.deepEqual(deleted.payload.deletion, { id, deleted: true });

  const publicLookup = await apiRequest(
    context,
    `/api/catalog/tools/${encodeURIComponent(id)}`,
  );
  assert.equal(publicLookup.response.status, 404);

  const adminList = await adminRequest(context, "/api/admin/tools");
  assert.equal(
    adminList.payload.tools.some((tool) => tool.id === id),
    false,
  );

  const deletedAgain = await adminRequest(
    context,
    `/api/admin/tools/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
  assert.equal(deletedAgain.response.status, 404);
});
