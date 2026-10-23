# TuoYu (Rita): AI Distribution Workbench and MCP Tool Catalog

**Help software, models, and open-source projects reach more AI platforms and content channels, while making their public facts easier for AI search and recommendation systems to understand.**

TuoYu is for individual developers and small teams who need one repeatable workflow for project positioning, channel selection, channel-specific content, publication review, and AI discoverability checks. Its agent is named **Rita**.

The product has two connected entry points:

- **Rita distribution workspace:** analyzes a software, model, or open-source project; recommends a channel sequence; creates channel-native drafts; and keeps every external publishing action behind review.
- **TuoYu MCP tool catalog:** gives MCP clients such as Claude and Cursor a structured discovery layer through `search_tools` and `recommend_tools`. Creators submit projects, administrators review them, and eligible paid placements receive a capped, clearly disclosed ranking boost.

This is not a second, conflicting product dataset. The workspace handles research, planning, and content production. The MCP catalog handles structured discovery and recommendations. Both share the same rules: review before publishing, relevance before promotion, and disclosure for every paid placement.

**Important boundary:** TuoYu improves project clarity, distribution readiness, and machine-readable discoverability. It does not inject a result into ChatGPT, Gemini, Claude, Cursor, or another platform's ranking, and it cannot guarantee a recommendation or citation.

## Best For

- Indie developers preparing a CLI, SDK, desktop app, library, or other open-source release
- Model teams publishing weights, datasets, a model card, or an interactive demo to Hugging Face
- Maintainers whose documentation is complete but whose project is still hard to discover
- MCP server authors who need structured catalog discovery in addition to a repository
- Small teams that want a review-first distribution checklist instead of publishing ad hoc

## Not For

- Bulk spam, fake reviews, astroturfing, or attempts to manipulate a platform's ranking
- Anyone looking for a guaranteed number-one AI recommendation
- Fully unattended publishing to every service without credentials, approval, or a supported integration
- A replacement for GitHub Releases, Hugging Face Hub, a CMS, or a full social-media scheduler
- Large-scale enterprise campaign management, attribution, or procurement workflows

## The Problem TuoYu Solves

Project distribution is usually fragmented. Source code lives on GitHub, model metadata lives on a model hub, MCP tools are listed in a separate directory, launch content is scheduled somewhere else, and AI-search visibility is measured with yet another product. This makes it difficult for a small team to keep the project facts, audience, links, and claims consistent across every surface.

TuoYu brings those decisions into one workflow. It starts with a canonical project profile, recommends the channels that fit the project type, generates content for each channel, requires review before external action, and produces structured facts that public pages and MCP clients can reuse.

| Capability | Manual multi-channel workflow | Social-media scheduler | Generic MCP directory | SEO / AI-visibility checker | TuoYu + Rita |
| --- | --- | --- | --- | --- | --- |
| Project and channel-fit analysis | Manual | No | No | Partial | Yes |
| Channel-specific content drafts | Manual | Yes | No | No | Yes |
| Review-first publishing records | Manual | Partial | No | No | Yes |
| MCP-native tool discovery | No | No | Yes | No | Yes |
| AI discoverability checks and fact packs | Manual | No | No | Partial | Yes |
| Disclosed paid catalog placement | N/A | Usually not applicable | Varies | N/A | Yes |
| Main limitation | High maintenance | Does not improve project metadata | Does not plan distribution | Measures but does not publish | Early-stage product with local-first storage |

## What Rita Does

- Reads a project's URL, name, one-line value proposition, and target audience to build an initial distribution profile
- Determines the optimal sequence of GitHub, Hugging Face, developer communities, AI platforms, and content channels
- Generates channel-specific content and recommends discoverability improvements
- Routes content through review, scheduling, and manual publishing records without bypassing publisher approval
- Helps projects publish complete, stable, machine-readable facts so AI search and answer systems are more likely to understand and cite them correctly

Rita improves a project's clarity and discoverability. It does not inject rankings directly into AI products. See the sections below for detailed capabilities and limits.

## Typical Workflows

### Launch an open-source developer tool

1. Add the GitHub repository, one-line value proposition, target user, and core use case.
2. Let Rita compare GitHub, developer communities, product directories, content channels, and AI-facing channels for fit.
3. Generate a README-oriented fact sheet, a concise launch post, a technical walkthrough, and channel-specific variants.
4. Review the claims and links, then publish through the supported API, browser-assisted, or manual workflow.
5. Run the AI discovery checks against the same canonical project facts and record whether relevant AI answers mention the project.

### Publish a model or dataset

1. Start with the model card, license, intended use, limitations, evaluation details, and canonical repository link.
2. Plan the relationship between the GitHub repository, Hugging Face model or dataset page, demo, and supporting content.
3. Generate a model-card improvement checklist and content that consistently explains the model's audience and constraints.
4. Use the MCP catalog when the model also exposes a tool, API, or agent capability that an MCP client should discover.

### Improve discoverability after launch

1. Audit canonical links, audience, use cases, comparison content, FAQs, update dates, and structured data.
2. Create a machine-readable project fact pack for the repository, website, README, or model card.
3. Test real non-brand questions such as "What is a suitable tool for this workflow?" instead of only searching for the project name.
4. Track mentions, recommendation position, source coverage, and the exact claims an AI system uses.
5. Fix missing or inconsistent facts before buying distribution or promotion.

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
- Installable PWA shell with a manifest, application icons, and offline-safe static caching
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

Microsoft collects Store customer payments and later settles the developer share through Partner Center after fees, applicable taxes, refunds, and adjustments. The developer must complete identity, tax, payout-profile, and bank-account verification before funds can be paid out. See [STORE_PAYOUT.md](./STORE_PAYOUT.md) for the end-to-end flow and go-live requirements.

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

## FAQ

### Is TuoYu an MCP server or a distribution application?

Both are part of the same product. The browser application is the Rita distribution workspace. `src/mcp-server.js` is a local stdio MCP server that exposes the reviewed tool catalog to compatible AI clients.

### Can ChatGPT, Claude, or Cursor automatically use the catalog?

Only after a compatible client is configured to start the MCP server and the client chooses to call `search_tools` or `recommend_tools`. TuoYu cannot force an AI product to call the tool, include its results, or place a project first.

### How does a creator submit a project?

Use the catalog page to provide a name, description, project and repository links, category, tags, and use cases. New submissions start as `pending`. They do not appear in public search or MCP results until an administrator approves them.

### Does paying for promotion override relevance?

No. A project must already match the query, category, or use case. Approved projects can then receive a disclosed `+8` or `+15` boost. Callers can pass `include_sponsored: false` to remove all promotion boosts. Every promoted result exposes `isPaidPlacement`, `paidBoost`, and `paidPlacement.label`.

### Does TuoYu push a project directly into every AI model?

No. Rita helps prepare, publish, and structure project information for supported channels. AI products use separate retrieval and ranking systems. TuoYu does not have a back door into those rankings and does not describe an MCP listing as an official AI-platform recommendation.

### Can I test whether the documentation change helped?

Yes. Choose a real project, ask the same non-brand question on the same AI platforms before and after the documentation change, and record whether the project was mentioned, its position, the sources cited, the date, and the visible model or search mode. The included validation workbook is designed for that before-and-after comparison.

### Which MCP clients are supported?

The server follows the MCP stdio protocol and is documented for Claude and Cursor. Any client that supports stdio MCP servers, tool discovery, and `tools/call` can use the same interface. See [MCP.md](./MCP.md) for configuration and protocol details.

### Is this ready for unattended public production?

Not yet. The current build is an MVP with local SQLite and browser storage. Public deployment still needs authentication, rate limiting, CAPTCHA or equivalent anti-spam controls, remote MCP transport and authorization where applicable, payment verification, monitoring, backups, and operational security.

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

The project has not been submitted to Microsoft Store and cannot be listed solely from the local project. The installable PWA foundation is now present: manifest, 192/512/maskable icons, root-scope service worker, offline app-shell fallback, and explicit exclusion of catalog API/admin responses from the cache.

Actual publication still requires a Partner Center developer account, app identity, a signed MSIX package, a public HTTPS deployment, public privacy and support URLs, Store subscription products, server-side purchase validation, final screenshots, and certification. See [STORE_PUBLISHING.md](./STORE_PUBLISHING.md) and [STORE_PAYOUT.md](./STORE_PAYOUT.md) for the remaining steps.

## Suggested Next Phase

1. Add project metadata ingestion for the GitHub API, Hugging Face API, and website Open Graph data.
2. Integrate an LLM content service that uses verified project facts as its retrieval source and returns structured channel content.
3. Prioritize adapters for GitHub releases and Hugging Face model-card/repository updates.
4. Add team review, publishing windows, and versioned channel-content guidelines.
