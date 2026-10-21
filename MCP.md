# TuoYu MCP Tool Catalog

The TuoYu MCP catalog is a local-first discovery service for software, models, and open-source projects. It exposes two read-only tools to MCP clients:

- `search_tools`: Searches approved projects by keyword, category, or use case.
- `recommend_tools`: Returns ranked project recommendations for a user task, including ranking details.

The current version is a working MVP. It does not directly control the final response of Claude, Cursor, ChatGPT, or another AI client. Each client decides whether to call the tools, how to use the returned data, and how to present it.

## How It Works

```text
Creator browser
  catalog.html
       |
       v
Node HTTP API  ---- SQLite: data/catalog.sqlite
       |                    |
       |                    v
  admin.html          src/mcp-server.js
                            |
                            v
               Claude / Cursor / other MCP clients
```

The catalog page, admin console, and MCP server share the same SQLite database. New submissions start as `pending` and enter MCP search results only after an administrator changes their status to `approved`.

## Requirements

- Node.js `22.13.0` or later
- A client that supports stdio MCP servers
- No npm dependencies; the current implementation uses Node's built-in HTTP server and `node:sqlite`

Start the HTTP server and review admin first:

```powershell
$env:TUOYU_ADMIN_TOKEN = "Replace with a random token of at least 16 characters"
node .\server.js
```

Open:

- Tool catalog: `http://127.0.0.1:4173/catalog.html`
- Review admin: `http://127.0.0.1:4173/admin.html`

The server listens only on `127.0.0.1` by default. To deploy it on another host, explicitly set `HOST`, but add authentication, TLS, a reverse proxy, rate limiting, and audit logging first.

## Cursor Configuration

Repository-level configuration belongs in `.cursor/mcp.json`; global configuration belongs in `.cursor/mcp.json` under your home directory. Replace `<ABSOLUTE_PATH_TO_REPOSITORY>` with the absolute path to your clone:

```json
{
  "mcpServers": {
    "tuoyu-catalog": {
      "command": "node",
      "args": [
        "<ABSOLUTE_PATH_TO_REPOSITORY>/src/mcp-server.js"
      ],
      "env": {
        "TUOYU_DB_PATH": "<ABSOLUTE_PATH_TO_REPOSITORY>/data/catalog.sqlite"
      }
    }
  }
}
```

If `node` is not on `PATH`, replace `node` with the absolute path to your Node.js executable.

The shorter configuration is sufficient when the default catalog database path is acceptable:

```json
{
  "mcpServers": {
    "tuoyu-catalog": {
      "command": "node",
      "args": [
        "C:\\absolute\\path\\to\\src\\mcp-server.js"
      ]
    }
  }
}
```

## Claude Desktop Configuration

On Windows, edit:

```text
%APPDATA%\Claude\claude_desktop_config.json
```

Add:

```json
{
  "mcpServers": {
    "tuoyu-catalog": {
      "command": "node",
      "args": [
        "C:\\absolute\\path\\to\\src\\mcp-server.js"
      ],
      "env": {
        "TUOYU_DB_PATH": "C:\\absolute\\path\\to\\data\\catalog.sqlite"
      }
    }
  }
}
```

Restart Claude Desktop after saving the configuration. Client versions may move configuration files or settings screens, so always consult the documentation for the installed version.

## Local Debugging

Start the stdio server directly:

```powershell
npm run mcp:catalog
```

You can also point `TUOYU_DB_PATH` to an isolated test database:

```powershell
$env:TUOYU_DB_PATH = "C:\absolute\path\to\data\catalog-test.sqlite"
npm run mcp:catalog
```

The stdio server does not use an HTTP port. Clients exchange JSON-RPC messages over standard input and output. Never write debug logs to standard output because that will corrupt the MCP protocol. The current implementation writes diagnostics to standard error.

## `search_tools`

Purpose: Find approved projects by keyword, category, or use case.

Parameters:

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `query` | string | No | Project name, technology term, or task description, up to 500 characters |
| `category` | string | No | Exact category, for example `Agent platforms` |
| `use_case` | string | No | Specific use case, up to 300 characters |
| `limit` | integer | No | 1 to 50, default 10 |
| `include_sponsored` | boolean | No | Whether promotion boosts are allowed, default `true` |

Example call:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "search_tools",
    "arguments": {
      "query": "run large language models locally",
      "category": "Model runtimes",
      "limit": 5,
      "include_sponsored": true
    }
  }
}
```

## `recommend_tools`

Purpose: Return candidate projects for a specific user task. Results are first filtered for relevance, then scored by quality and any disclosed promotion boost.

Parameters:

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `need` | string | Yes | User task or goal, 2 to 500 characters |
| `category` | string | No | Optional exact category |
| `limit` | integer | No | 1 to 20, default 5 |
| `include_sponsored` | boolean | No | Whether promotion boosts are allowed, default `true` |

Example call:

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "recommend_tools",
    "arguments": {
      "need": "Find a tool that runs large language models locally and exposes an API",
      "limit": 3,
      "include_sponsored": true
    }
  }
}
```

## Response Structure

Each result contains at least:

```json
{
  "id": "project ID",
  "name": "Project name",
  "description": "Project description",
  "links": {
    "website": "https://example.com",
    "repository": "https://github.com/example/project"
  },
  "category": "Model runtimes",
  "tags": ["llm", "local"],
  "useCases": ["run large language models locally"],
  "github": {
    "stars": 12345,
    "lastUpdated": "2026-10-01T00:00:00.000Z"
  },
  "review": {
    "status": "approved",
    "reviewedAt": "2026-10-02T00:00:00.000Z"
  },
  "isPaidPlacement": true,
  "paidPlacement": {
    "tier": "boost",
    "disclosed": true,
    "label": "Paid promotion"
  },
  "ranking": {
    "relevanceScore": 82,
    "qualityScore": 61,
    "baseScore": 71.5,
    "paidBoost": 8,
    "finalScore": 79.5,
    "isPaidPlacement": true
  }
}
```

The top-level response also includes `result_count`, `sponsored_count`, and `ranking_policy`.

## Ranking and Promotion Rules

Ranking formula:

```text
finalScore = baseScore + paidBoost
```

The base score uses the following signals:

- GitHub stars: 35%
- Update recency: 30%
- Description quality: 25%
- Profile completeness: 10%

Relevance is combined with the quality score to produce `baseScore`. Promotion tiers are:

| `promotionTier` | Boost |
| --- | ---: |
| `none` | 0 |
| `boost` | +8 |
| `featured` | +15 |

Constraints:

- Only `approved` projects can receive a promotion boost.
- A project must first pass keyword, category, or use-case relevance filtering.
- Setting `include_sponsored: false` forces every `paidBoost` to `0`.
- `isPaidPlacement`, `paidBoost`, and `paidPlacement.label` always disclose promotion status.
- Clients that display promoted results should show `paidPlacement.label` as well. Promoted placement must not be described as an objective platform ranking or official endorsement.

The current "paid" state is a local promotion-flag simulation. The submission endpoint does not charge a fee, and the admin console does not call a payment or settlement service.

## HTTP API

Public endpoints:

- `GET /api/health`
- `GET /api/catalog/search?q=&category=&useCase=&limit=&includeSponsored=`
- `GET /api/catalog/categories`
- `GET /api/catalog/tools/:id`
- `POST /api/catalog/submissions`

Admin endpoints require:

```http
Authorization: Bearer <TUOYU_ADMIN_TOKEN>
```

- `GET /api/admin/tools?status=pending`
- `PATCH /api/admin/tools/:id`
- `DELETE /api/admin/tools/:id`

Example admin update:

```json
{
  "status": "approved",
  "promotionTier": "boost",
  "promotionActive": true,
  "githubStars": 12345,
  "lastUpdated": "2026-10-01T00:00:00.000Z",
  "reviewNote": "Verified the link, license, and GitHub metrics"
}
```

Delete a project:

```http
DELETE /api/admin/tools/PROJECT_ID
Authorization: Bearer <TUOYU_ADMIN_TOKEN>
```

Deletion is permanent and removes the project's review record, metrics, and promotion status. The admin interface asks for confirmation before executing the request.

## Current Limits

This is a local MVP, not a public hosting platform. A production launch must add:

- Rate limiting, CAPTCHA, anti-spam, and abuse monitoring for the public submission endpoint
- An administrator identity system, least privilege, action auditing, and token rotation
- Server-side verification or real-time synchronization for GitHub stars and update dates
- Remote MCP transport, OAuth, tenant isolation, and quotas
- Payment orders, promotion expiry, refunds, and invoice status
- Delete auditing, accidental-deletion recovery, project corrections, and appeal response times
- A production privacy policy, terms of service, operator identity, and support contact

Until these requirements are complete, do not claim that the project supports real payments, is recommended by major AI platforms, or can control the final response of any AI client.
