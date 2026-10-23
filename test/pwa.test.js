const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { once } = require("node:events");
const test = require("node:test");

const { createTuoyuServer } = require("../server");

function createTempDatabase() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "tuoyu-pwa-"));
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
    adminToken: "pwa-test-admin-token-1234567890",
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");

  const address = server.address();
  const context = {
    ...database,
    server,
    origin: `http://127.0.0.1:${address.port}`,
  };
  t.after(() => closeTestContext(context));
  return context;
}

function readPngSize(buffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  assert.deepEqual(buffer.subarray(0, 8), signature);
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

test("PWA manifest, icons, service worker, and security headers are served", async (t) => {
  const context = await startTestContext(t);

  const manifestResponse = await fetch(`${context.origin}/manifest.webmanifest`);
  assert.equal(manifestResponse.status, 200);
  assert.equal(
    manifestResponse.headers.get("content-type"),
    "application/manifest+json; charset=utf-8",
  );
  assert.match(manifestResponse.headers.get("content-security-policy"), /manifest-src 'self'/);
  assert.match(manifestResponse.headers.get("content-security-policy"), /worker-src 'self'/);
  const manifest = await manifestResponse.json();
  assert.equal(manifest.id, "/");
  assert.equal(manifest.start_url, "/");
  assert.equal(manifest.scope, "/");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.theme_color, "#205fd7");
  assert.deepEqual(
    manifest.icons.map((icon) => [icon.sizes, icon.purpose]),
    [
      ["192x192", "any"],
      ["512x512", "any"],
      ["512x512", "maskable"],
    ],
  );

  const expectedIcons = new Map([
    ["/icons/icon-144.png", [144, 144]],
    ["/icons/icon-180.png", [180, 180]],
    ["/icons/icon-192.png", [192, 192]],
    ["/icons/icon-512.png", [512, 512]],
    ["/icons/icon-maskable-512.png", [512, 512]],
  ]);
  for (const [pathname, dimensions] of expectedIcons) {
    const response = await fetch(`${context.origin}${pathname}`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "image/png");
    const size = readPngSize(Buffer.from(await response.arrayBuffer()));
    assert.deepEqual([size.width, size.height], dimensions);
  }

  const serviceWorkerResponse = await fetch(`${context.origin}/service-worker.js`);
  assert.equal(serviceWorkerResponse.status, 200);
  assert.equal(
    serviceWorkerResponse.headers.get("content-type"),
    "text/javascript; charset=utf-8",
  );
  assert.equal(serviceWorkerResponse.headers.get("service-worker-allowed"), "/");
  const serviceWorker = await serviceWorkerResponse.text();
  assert.match(serviceWorker, /pathname\.startsWith\("\/api\/"\)/);
  assert.match(serviceWorker, /pathname === "\/admin\.html"/);
  assert.match(serviceWorker, /NAVIGATION_FALLBACKS/);

  const indexResponse = await fetch(`${context.origin}/`);
  assert.equal(indexResponse.status, 200);
  const index = await indexResponse.text();
  assert.match(index, /rel="manifest" href="\.\/manifest\.webmanifest"/);
  assert.match(index, /name="theme-color" content="#205fd7"/);
  assert.match(index, /apple-touch-icon/);

  const appResponse = await fetch(`${context.origin}/app.js`);
  assert.equal(appResponse.status, 200);
  const app = await appResponse.text();
  assert.match(app, /serviceWorker\.register\("\.\/service-worker\.js", \{ scope: "\.\/" \}\)/);
});

test("API responses remain outside the offline application shell", async (t) => {
  const context = await startTestContext(t);
  const response = await fetch(`${context.origin}/api/catalog/search?q=ollama`);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("service-worker-allowed"), null);
});
