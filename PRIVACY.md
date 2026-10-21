# TuoYu Privacy Notice

Effective date: October 21, 2026

This notice applies to the TuoYu workspace, TuoYu MCP tool catalog, catalog review admin, and local MCP server included with the project. The current build is a local-first minimum viable product (MVP), not an online service that has completed public-deployment compliance work.

## 1. Data Currently Processed

### Rita Workspace

Project drafts, channel copy, review status, schedules, publishing records, plan previews, and usage information in the workspace are stored in browser `localStorage`. This data is primarily processed by the browser and is not automatically uploaded to TuoYu servers when the workspace is used.

The workspace storage key is `tuoyu-distribution-workspace-v1`. Clearing browser site data removes these local records and may reset local trial eligibility.

### MCP Tool Catalog

When a creator submits a project, the following information is sent to the local service hosting the site and stored in a SQLite database:

- Project name, description, category, tags, and use cases
- GitHub or website links
- GitHub stars and latest update date supplied by the creator
- Submission time, review status, review notes, and promotion flags
- System-generated internal project ID and automated review flags

The default database path is `data/catalog.sqlite`. Catalog data is used for public search, MCP tool responses, review administration, and transparent promotion boosts. Approved project information may be read by the catalog website and MCP clients.

### Review Admin

The administrator token is stored only in the current tab's `sessionStorage` and is removed when the tab closes or the administrator signs out. Administrators can use the local service to read records, change review status, adjust promotion flags, or permanently delete catalog records.

### Payments and Accounts

The current build has no real payments, account system, or cloud sync, and it does not collect bank-card details, billing addresses, or other payment credentials. Plan switching and promotion tiers on the page are local product previews or administrative flags and do not create charges.

## 2. Processing Purposes

The data described above is used only to:

- Provide project submission, review, search, and MCP recommendation features
- Calculate and explain project base scores and promotion boosts
- Prevent duplicate submissions and conflicts involving third-party project links
- Manage review records, promotion disclosure, and project deletion
- Preserve workspace content that users intentionally create

The current build does not integrate advertising profiles, cross-site tracking, or behavioral-analytics services, and it does not sell personal information.

## 3. Storage Location and Sharing

The current deployment listens only on `127.0.0.1` by default, and data is normally stored on the machine running the project. Unless the operator intentionally deploys the service publicly or configures third-party infrastructure, data is not automatically transmitted to another server.

When an MCP client calls the local MCP server, it reads approved projects from the same SQLite database. The client's own privacy policy governs how it uses and displays returned content. GitHub, project websites, and other third-party links process visit data independently.

If cloud databases, payments, email, analytics, or remote MCP services are added in the future, this notice must be updated before activation with the provider, processing location, and scope of sharing.

## 4. Retention and Deletion

- Users control browser workspace data, which remains until they clear site data or use in-app deletion features.
- Catalog projects remain until an administrator deletes them, the operator stops the service, or the database is cleared.
- Administrators can delete individual projects. After permanent deletion, the website and MCP search no longer return the project.
- Deleting the database file clears the entire local catalog, including review and promotion records.
- A production public deployment must provide clear channels to request deletion, correction, and consent withdrawal, along with verifiable retention periods.

## 5. Data Quality and Correction

Submitters must ensure that project names, links, descriptions, metrics, and trademark information are accurate. The current MVP does not provide submitter accounts, CAPTCHA, or an online correction workflow. A public deployment should provide at least a support email, identity verification, correction handling, and response times for appeals.

If project information changes, is no longer public, changes license, or the submitter loses publishing authorization, the operator should suspend or delete the relevant record.

## 6. Security Measures and Limits

The project uses an administrator bearer token, request-body size limits, JSON Content-Type validation, baseline security headers, and local SQLite storage. These measures do not constitute production-grade security. Before a public deployment, add:

- HTTPS, a reverse proxy, rate limiting, CAPTCHA, and anti-spam controls
- An administrator identity system, least privilege, auditing, and token rotation
- Database backup, recovery, and encryption at rest or disk-encryption policies
- Vulnerability response, log redaction, deletion verification, and incident-notification procedures

## 7. Minors

The Service is intended for software, model, and open-source project creators and developers. It is not designed specifically for minors and does not intentionally collect personal information from minors.

## 8. Operator and Contact Information

The current local MVP does not have a public operating entity or privacy contact email. Before public or Microsoft Store release, this section must include the operator's legal name, registered address, support email, data-processing locations, and response times.

Until that information is added, this version must not be described as a production service ready to collect personal information from the public.

## 9. Updates

This notice and its effective date must be updated when data types, processing purposes, deployment methods, or third-party services change. Material changes in a production product should be handled through prominent notice and a renewed consent process.
