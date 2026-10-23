# Microsoft Store China Publishing Guide

Updated: October 22, 2026

## Current Status

The project is currently a locally runnable, installable PWA. It has not been submitted to Microsoft Store and does not have an active Partner Center app identity, signed MSIX package, Store product ID, or subscription add-on ID.

Therefore, the local plan preview cannot be used to claim that real subscriptions or a Store listing are complete. Without a Microsoft developer account, a Partner Center app identity, and certification materials, the repository alone cannot perform a direct publication.

The PWA foundation now includes:

- `manifest.webmanifest`
- 192×192, 512×512, and maskable 512×512 PNG icons
- A root-scope service worker
- Offline fallback for the workspace and catalog shells
- Explicit exclusion of `/api/`, `admin.html`, `admin.js`, and `admin.css` from offline caching
- CSP support for the manifest and service worker

## Mandatory Prerequisites

| Item | Current status | Completion criteria |
| --- | --- | --- |
| Microsoft developer account | Not confirmed | Complete individual or organization verification and confirm eligibility to publish in China |
| Partner Center app | Not created | Reserve the app name and obtain Package Identity and Publisher ID |
| Windows package | Not generated | Generate and sign a submittable MSIX/AppX from the prepared PWA |
| Public HTTPS service | Not deployed | Production domain, HTTPS, health checks, backup, and monitoring |
| Privacy-policy URL | Not deployed | Publish `PRIVACY.md` at a stable public URL and add contact details |
| Support page | Not established | Support email, issue reporting, privacy requests, and subscription-support workflow |
| Store subscription products | Not created | Monthly/yearly add-ons, market pricing, trial, and purchase-receipt validation |
| Store assets | Not complete | Icons, screenshots, store copy, age rating, and system requirements |
| China compliance review | Not complete | Operator, domain, content, privacy, consumer-rights, and payment-flow review |

## 1. Partner Center Identity

1. Decide whether the operating entity is an individual or a business and prepare documents that match that entity.
2. Register or sign in to Microsoft Partner Center and complete developer-account verification.
3. Reserve the application name "TuoYu". Partner Center controls the reservation result.
4. Choose the Windows app type: native Windows package, packaged PWA, or another Store-supported package format.
5. Read the actual Package Identity, Publisher ID, and Store ID from the Store submission API or the Partner Center product-identity page. Do not submit handwritten placeholders.

## 2. App Packaging

For the current web stack, first evaluate the official process for packaging a PWA as MSIX:

- Deploy to a stable HTTPS domain.
- Add a Web App Manifest with 192×192, 512×512, and maskable icons.
- Add a service worker or otherwise satisfy the offline requirements of the chosen packaging tool.
- Verify installation, uninstallation, window sizing, deep links, and system back behavior.
- Verify clipboard, external-link, and new-window behavior in the Windows container.
- Generate MSIX/AppX with a Microsoft-recommended PWA packaging tool.
- Repackage with the app identity required by Partner Center instead of retaining an anonymous test identity.
- Regress on Windows 10/11, at 100%/150%/200% scaling, and across different screen sizes.

Never commit Partner Center passwords, code-signing certificates, private keys, or Store access tokens to the Git repository.

## 3. Store Products, Subscriptions, and Payout

Before charging real customers:

1. Create monthly and annual Creator and Pro add-ons in Partner Center.
2. Record the actual Store add-on IDs and map them to in-app plans.
3. Integrate the official Store purchase flow; the browser must never fabricate a successful purchase.
4. Store and validate purchase receipts, subscription status, expiry, cancellation, and refund status on the server.
5. Bind the seven-day trial to an account or server-side record so clearing `localStorage` cannot repeatedly renew eligibility.
6. Clearly disclose price, billing period, renewal, cancellation, refund, and trial rules on the product page.
7. Show the final tax-inclusive CNY price before purchase, subject to the actual Store checkout page.
8. Test purchase, duplicate purchase, restore purchase, cancellation, expiry, refund, offline launch, and network recovery.

For revenue settlement:

1. Complete the Partner Center developer identity verification.
2. Complete the payout profile, tax profile, and bank-account verification.
3. Confirm that the account role can access Earnings and payout reports.
4. Track gross customer orders and Microsoft's net earnings separately.
5. Reconcile store fees, tax, refunds, chargebacks, holds, and bank receipts.

Microsoft does not send the customer's gross payment directly to an ordinary personal bank account. It posts payable developer earnings in Partner Center and pays the verified account after the applicable requirements and payment cycle are met. See [STORE_PAYOUT.md](./STORE_PAYOUT.md).

The `localStorage` plan switcher in the current app must remain labeled as a local preview until all of the above is operational.

## 4. Privacy and Support

Prepare at least the following before submission:

- A public HTTPS privacy-policy page
- A public HTTPS support or FAQ page
- A durable support email for privacy, subscription, and refund questions
- The operator's legal name, contact information, and address details required by applicable law
- A data-processing inventory covering cloud hosting, databases, model APIs, email, logs, error monitoring, and Store services
- Data export, deletion, and account-closure procedures
- Security-incident response and user-notification procedures
- Confirmation of applicable ICP filing and similar requirements when hosting on mainland China infrastructure or using a mainland China domain

`PRIVACY.md`, `SUBSCRIPTION_TERMS.md`, and `PRICING.md` are launch drafts, not final public pages that have completed regulatory filing or legal review.

## 5. Store Listing Assets

Recommended Store information:

- App name: TuoYu.
- Positioning: An AI channel-distribution and search-discovery workspace for software, models, and open-source projects.
- Core features: Project intake, channel matching, content generation, review scheduling, and AI index packs.
- Supported language: English; list additional languages only when localization is complete.
- Category: Developer tools or Business.
- System requirements, architecture, and supported Windows versions.
- Age-rating questionnaire.
- Desktop screenshots sized 1440×900 or larger.
- At least one screenshot showing project overview, Content Studio, Discovery page, and plan usage.
- Icons and promotional artwork that do not misleadingly combine third-party trademarks.

Store copy must not claim that the app guarantees recommendations from ChatGPT, Claude, or Gemini, controls AI rankings, or injects results into models. Accurate wording should describe improving the completeness of project facts and the likelihood of being correctly understood and cited.

## 6. China-Specific Review

Before releasing to users in mainland China, the operator must review the actual entity and business against:

- Clarity of the operating entity, app name, and trademark use
- Completeness of paid-product pages and consumer-rights disclosures
- Privacy policy, personal-information processing rules, and protections for minors
- Domain, server, ICP filing, and cybersecurity obligations
- Requirements applicable to generative AI, internet information, and content distribution
- Software, model, open-source licenses, and third-party platform terms
- Tax, invoice, refund, and Store settlement processes
- Consistency of CNY pricing, promotions, and annual-plan displays with Store products

This checklist supports engineering preparation and does not replace legal, tax, or compliance advice.

## 7. Submission and Validation

Recommended sequence:

1. Complete the public deployment and privacy/support URLs.
2. Complete PWA installation and Windows offline regression testing.
3. Reserve the app name and app identity in Partner Center.
4. Create Store subscription add-ons and integrate server-side receipt validation.
5. Generate a Store test package and pass the Windows App Certification Kit.
6. Submit to a private audience or flight group and verify purchase and restore-purchase flows.
7. Upload the production MSIX, listing copy, screenshots, age rating, and privacy materials.
8. Select the China market and submit for certification.
9. After certification passes, publish through Partner Center. Do not claim the app is live before approval.

## 8. Acceptance Tests

Verify at least the following before production submission:

- No horizontal overflow at 1440, 390, or 320 pixel widths
- Monthly/yearly plan switching, trial, quota, downgrade, and expiry states
- Persistence of projects, generated content, queue, and usage after refresh
- No partial generation or incorrect quota deduction when limits are exceeded
- Modal close behavior, Escape key, backdrop clicks, and focus handling
- Store purchase cancellation, failure, repeated clicks, and network interruption
- Restore purchase, refund, expiry, and sign-in-again flows
- No real API keys, personal information, or signing private keys in the package
- No `work/` files, test screenshots, OAuth helper scripts, or Git metadata in the package

## 9. Information Still Required from the Product Owner

To proceed with an actual submission, the product owner must provide or confirm:

- A Microsoft Partner Center developer account with operational access
- The final operating entity, support email, and public domain
- The app name and Package Identity
- Microsoft Store monthly/yearly product IDs
- Whether China pricing will use the reference prices in this document
- Production privacy policy, support page, and customer-support workflow
- Private credentials required for signing and publishing
