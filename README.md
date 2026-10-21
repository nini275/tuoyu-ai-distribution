# TuoYu - Rita AI Project Distribution and MCP Tool Catalog

An AI channel-distribution prototype for software, models, and open-source projects. Rita is TuoYu's AI distribution agent. It evaluates each project's positioning and channel fit, creates channel-specific content, and routes every external publishing action through review and scheduling.

The project also provides an MCP tool catalog that other AI clients can call. Creators can submit software, models, or open-source projects. After administrator review, a project can receive a clearly disclosed promotion boost. MCP clients such as Claude and Cursor can call `search_tools` and `recommend_tools`.

This is not a second, conflicting product dataset. The Rita workspace handles project analysis and content distribution, while the MCP catalog helps other AI systems discover projects through structured data. Both share the same product principles: review before publishing, and always disclose paid placement. Catalog data is stored in server-side SQLite, while workspace drafts remain in local browser storage.

## What Rita Does

- Reads a project's URL, name, one-line value proposition, and target audience to build an initial distribution profile
- Determines the optimal sequence of GitHub, Hugging Face, developer communities, AI platforms, and content channels
- Generates channel-specific content and recommends discoverability improvements
- Routes content through review, scheduling, and manual publishing records without bypassing publisher approval
- Helps projects publish complete, stable, machine-readable facts so AI search and answer systems are more likely to understand and cite them correctly

Rita improves a project's clarity and discoverability. It does not inject rankings directly into AI products. See the sections below for detailed capabilities and limits.

## Quick Start

Node.js `22.13.0` or later is required because the catalog uses Node's built-in `node:sqlite`.

Clone the repository and start the local server:

```powershell
git clone https://github.com/nini275/tuoyu-ai-distribution.git
cd tuoyu-ai-distribution

$env:TUOYU_ADMIN_TOKEN = "Replace with a random token of at least 16 characters"
node .\server.js
```

On macOS or Linux:

```bash
git clone https://github.com/nini275/tuoyu-ai-distribution.git
cd tuoyu-ai-distribution

export TUOYU_ADMIN_TOKEN="Replace with a random token of at least 16 characters"
node ./server.js
```

Open:

- Workspace: `http://127.0.0.1:4173`
- MCP tool catalog: `http://127.0.0.1:4173/catalog.html`
- Review admin: `http://127.0.0.1:4173/admin.html`

Common commands:

```bash
npm run mcp:catalog
npm run check
npm test
```

See [MCP.md](./MCP.md) for MCP client configuration, tool parameters, and promotion disclosure rules.

## Project Structure

```text
.
├── index.html / app.js              Rita project distribution workspace
├── catalog.html / catalog.js        Creator search and project submission page
├── admin.html / admin.js            Token-protected catalog review admin
├── server.js                        HTTP static server and catalog API
├── src/
│   ├── api.js                       Public submission, search, and admin API
│   ├── mcp-server.js                stdio MCP server
│   └── catalog/
│       ├── store.js                 SQLite storage, review, and queries
│       ├── scoring.js               Relevance, base scores, and promotion boosts
│       ├── validation.js            Submission and admin update validation
│       └── seed.js                  Approved sample projects
├── test/catalog.test.js             API, SQLite, ranking, and MCP tests
├── MCP.md                           Claude and Cursor setup guide
└── data/catalog.sqlite              Local runtime database (not committed to Git)
```

## Current Capabilities

- Project intake and local rule-based analysis
- Project publishing-status filters
- Channel-fit scoring and distribution-order recommendations
- Channel-specific copy for 14 AI model, developer, and content channels
- Content editing, copying, review, custom scheduling, and manual publishing records
- AI Search Discovery page with discoverability checks, question simulations, and optimization actions
- Machine-readable project fact cards, FAQ prompts, and JSON-LD structured data
- Local plan previews and usage limits for Free, Creator, and Pro
- Seven-day Pro trial, monthly quota resets, and data retention after plan downgrade
- Local browser persistence
- Responsive desktop and mobile layouts
- MCP `search_tools` and `recommend_tools` tools
- Project submission, manual review, suspension, rejection, and permanent deletion
- Category, tag, use-case, and keyword search
- Base scoring using GitHub stars, update recency, description quality, and profile completeness
- Transparent `boost` and `featured` promotion tiers
- Admin bearer-token protection, session storage, and review notes

## MCP Catalog and Promotion Rules

Projects enter the catalog with a `pending` status by default. They do not appear in API or MCP search results until approved.

The ranking formula is:

```text
finalScore = baseScore + paidBoost
```

Promotion tiers are simulated with local flags and do not involve real payment:

| Promotion tier | Boost |
| --- | ---: |
| `none` | 0 |
| `boost` | +8 |
| `featured` | +15 |

Promotion weighting follows these rules:

- Only approved projects can receive a promotion boost.
- A project must first match the keyword, category, or use case.
- Callers can pass `include_sponsored: false` to disable all promotion boosts.
- Every promoted result includes `isPaidPlacement`, `paidBoost`, and `paidPlacement.label`.
- TuoYu cannot control whether clients such as Claude, Cursor, or ChatGPT call a tool or how they present an answer.

The public submission API is an MVP and does not yet include CAPTCHA, rate limiting, or anti-spam services. These are required before a public production deployment.

## Plans and Payment Prototype

| Plan | Monthly | Yearly | User projects | Monthly channel content | Monthly AI index packs |
| --- | ---: | ---: | ---: | ---: | ---: |
| Free | ¥0 | ¥0 | 1 | 20 | 1 |
| Creator | ¥49 | ¥399 | 10 | 300 | Unlimited |
| Pro | ¥149 | ¥1,299 | 50 | 2,000 | Unlimited |

Billing rules:

- Annual plans are priced at ten times the monthly rate.
- Each successfully generated channel version consumes one unit; the three starter versions created during project intake also count toward the monthly quota.
- Each successful AI index pack generation or regeneration consumes one unit.
- Quotas reset on the first day of each natural month in China Standard Time. Unused quota does not roll over.
- The app validates the full batch before generation. If quota is insufficient, no content is generated and no quota is deducted.
- Downgrading a plan never deletes existing projects or content. It only blocks new actions that exceed the new plan's limits.
- The Pro trial lasts seven days and can be used once per local workspace.

Plan switching in the current build is a local preview and **does not create a real charge**. After launch, payment, renewal, cancellation, and refunds should be handled by Microsoft Store, with purchase receipts verified by a trusted server. See [PRICING.md](./PRICING.md) and [SUBSCRIPTION_TERMS.md](./SUBSCRIPTION_TERMS.md) for details.

## Local Data Boundaries

The current version has no account system or cloud sync. Data falls into two categories:

- Rita workspace projects, content, queues, index packs, plan previews, and usage are stored in browser `localStorage` under `tuoyu-distribution-workspace-v1`.
- MCP catalog submissions, reviews, metrics, and promotion flags are stored in local SQLite at `data/catalog.sqlite` by default.

This means:

- Data does not automatically sync across devices.
- Clearing browser site data removes the local workspace and resets trial eligibility.
- Clearing `data/catalog.sqlite` removes catalog submissions, reviews, and promotion records.
- `localStorage` must not be treated as proof of payment.
- A production Microsoft Store build must verify purchase receipts and enforce critical quota controls on a trusted server.

The catalog database is excluded by `.gitignore`. Do not commit local submissions or admin tokens to Git. See [PRIVACY.md](./PRIVACY.md) for privacy boundaries.

## AI Search Discovery Capabilities and Limits

The AI Discovery page helps improve the likelihood that AI search and answer systems can find, correctly understand, recommend, and cite a project. It checks canonical links, positioning, target audience, content coverage, independent sources, update dates, and machine-readable index packs. It also simulates how well project facts match real software-selection questions.

Generated index packs can be synchronized to a project website, README, model card, or another stable public page. They do not inject a ranking directly into ChatGPT, Gemini, Claude, or other products, and cannot guarantee first place in those products. Whether and how each platform retrieves, ranks, and cites content depends on its undisclosed and constantly changing retrieval systems.

## Production Publishing Integrations

Channels in the project use one of three modes:

- `API integration`: Requires the platform's OAuth or API credentials
- `Browser-assisted`: Requires an authenticated user session and step-by-step confirmation
- `Manual publishing`: Requires the user to complete the platform submission directly

The first release does not publish automatically without authorization or simulate successful external publishing. For production, add server-side channel adapters, a credential vault, action audit logs, and pre-publish policy checks. Never place platform secrets in the browser.

## Names, Licensing, and Rights

- Original code and documentation are licensed under [Apache License 2.0](./LICENSE). Attribution details are in [NOTICE](./NOTICE).
- Copyright boundaries for original content, interfaces, and creative work are described in [COPYRIGHT.md](./COPYRIGHT.md).
- The names "TuoYu" and "Rita", the project logo, and source-identifying visual combinations are governed by [TRADEMARK.md](./TRADEMARK.md). Apache-2.0 does not grant trademark rights, and the current policy does not claim that any mark is registered.
- Third-party icons and licenses are listed in [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).
- Project materials entered or prepared for publication by users remain the property of their respective rights holders. Publishers must confirm that they have the rights required to use and publish the relevant software, models, images, text, and trademarks.

## Microsoft Store Status

The project has not been submitted to Microsoft Store and cannot be listed solely from the local static project. Actual publication still requires a Partner Center developer account, app identity, MSIX/PWA packaging, public privacy and support URLs, Store pricing and subscription products, purchase-receipt validation, screenshots, and certification. See [STORE_PUBLISHING.md](./STORE_PUBLISHING.md) for the complete checklist.

## Suggested Next Phase

1. Add project metadata ingestion for the GitHub API, Hugging Face API, and website Open Graph data.
2. Integrate an LLM content service that uses verified project facts as its retrieval source and returns structured channel content.
3. Prioritize adapters for GitHub releases and Hugging Face model-card/repository updates.
4. Add team review, publishing windows, and versioned channel-content guidelines.
