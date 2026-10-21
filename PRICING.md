# Pricing and Usage Limits

Effective date: October 21, 2026

This document describes the plans, prices, usage calculations, and local-preview rules in the TuoYu prototype. The current build is not connected to Microsoft Store products or purchase-receipt validation. Switching plans in the app does not create a real charge and does not mean a subscription has been purchased.

## Plans

Prices are in Chinese yuan (CNY). The table below shows reference prices planned for Microsoft Store in China. After release, the final price, taxes, and promotions shown on the Store product page take precedence.

| Plan | Monthly | Yearly | User projects | Channel content | AI index packs |
| --- | ---: | ---: | ---: | ---: | ---: |
| Free | ¥0 | ¥0 | 1 | 20 per month | 1 per month |
| Creator | ¥49 / month | ¥399 / year | 10 | 300 per month | Unlimited |
| Pro | ¥149 / month | ¥1,299 / year | 50 | 2,000 per month | Unlimited |

Annual pricing equals ten monthly payments. Based on the reference prices:

- Creator annual billing saves ¥189 compared with 12 monthly payments, equivalent to about ¥33 per month.
- Pro annual billing saves ¥489 compared with 12 monthly payments, equivalent to about ¥108 per month.

## Usage Units

### User Projects

Each user-created project that is not demo data and remains in the workspace consumes one project slot. Built-in demo projects do not count against plan limits.

Adding a new project automatically generates up to three starter channel versions. These are real channel-content assets and count toward the monthly channel-content quota.

### Channel Content

Each successfully generated channel version consumes one unit:

- Generating content for three channels in one operation consumes three units.
- Regenerating content for an existing project is not free; each newly generated channel version consumes a unit.
- Starter channel versions created during project intake count according to the number actually generated.
- Editing, copying, adding to the queue, scheduling, and marking content as published do not consume additional channel-content units.

If the remaining quota cannot cover the full batch, the app blocks generation before it starts. The prototype does not generate partial content and does not charge failed batches.

### AI Index Packs

Each successful generation or regeneration of an AI index pack consumes one unit. Regeneration creates a new generation record, so it consumes one unit even when project facts have not changed. Copying or reading an existing index pack does not consume quota.

## Resets and Downgrades

- Monthly quotas reset at the start of each natural month in China Standard Time (`Asia/Shanghai`).
- Unused quota does not roll over.
- Downgrading a plan does not delete existing projects, content assets, queue records, or index packs.
- After a downgrade, existing data above the new plan limits remains viewable, while actions that would exceed the limits, such as adding projects or generating content or index packs, are paused.
- Microsoft Store billing records, not the browser's local clock, determine annual-plan validity.

## Seven-Day Pro Trial

The current prototype offers one seven-day Pro trial per local workspace:

- Pro project, channel-content, and index-pack quotas are available during the trial.
- When the trial expires, the workspace automatically displays the Free plan and retains existing data.
- A production subscription system must bind trial eligibility on the server to a Microsoft Store account or verified workspace. Browser-local storage alone is not an acceptable anti-abuse mechanism.
- If the Microsoft Store product page does not display a trial, this document must not be treated as an active promotional commitment.

## Local Preview

Until Store products and purchase-receipt validation are complete:

- "Preview Free" and "Preview this plan" only change the plan and limits displayed in the local workspace.
- They do not request payment, create a real subscription, or enable automatic renewal.
- Clearing browser site data resets local plan state, usage, and trial records.
- Local plan state cannot unlock a production paid service or serve as proof of purchase.

A production build must rely on purchase receipts returned by Microsoft Store and validate subscription status, expiry, and refund state on a trusted server. Browser `localStorage` is only interface cache and must not be the authoritative authorization source.

## Payment, Renewal, and Refunds

After a production subscription launches, Microsoft Store should handle purchases, renewals, cancellations, and refunds. Available options depend on the configured Store products and applicable consumer law.

A completed monthly or annual billing period generally is not automatically refunded when the user cancels, but service continues through the end of the paid period or the date specified in the Store billing record. Mandatory consumer rights are not limited by this document.

## Changes

When plans or quotas change materially, the project team should update this document and the in-app notices before launch and provide required notice to existing subscribers under applicable law and Microsoft Store policy. The price and terms displayed by Microsoft Store when the user confirms a purchase are final.

## Related Documents

- [Subscription Terms](./SUBSCRIPTION_TERMS.md)
- [Privacy Notice](./PRIVACY.md)
- [Microsoft Store Publishing Guide](./STORE_PUBLISHING.md)
- [Copyright Notice](./COPYRIGHT.md)
