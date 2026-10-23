# Microsoft Store Payout Guide

Updated: October 22, 2026

## Short Answer

Customers do not pay TuoYu's personal or company bank account directly.

For Store-based purchases, Microsoft collects the customer payment first. Microsoft then records the developer's share in Partner Center as earnings after applicable Store fees, taxes, refunds, chargebacks, and other adjustments. Once the account, tax, and payout requirements are satisfied and the balance becomes payable, Microsoft sends the payout to the verified bank account configured by the developer.

```text
Customer payment
  -> Microsoft Store checkout and tax handling
  -> Store fee and applicable adjustments
  -> Partner Center Earnings
  -> Tax and payout verification
  -> Verified individual or company bank account
```

The exact Store fee, payout threshold, payment cycle, supported payout method, settlement currency, tax treatment, and China-specific bank requirements must be read from the current Partner Center and Microsoft's official terms. They can change and depend on the account type and market.

## One-Time Partner Center Setup

Before Microsoft can pay the developer:

1. Complete developer-account identity verification for the correct individual or legal entity.
2. Complete the Partner Center payout profile with the legal name and address that match the verified entity.
3. Complete the applicable tax forms and tax-profile review.
4. Add a supported bank account in Partner Center and complete any ownership or identity verification Microsoft requests.
5. Enable the security settings required for financial access. Microsoft describes roles such as Owner and Financial Contributor as having access to earnings information.
6. Monitor the Partner Center **Earnings** and payment reports for approved revenue, adjustments, holds, and failed-payment actions.

Do not send bank-account details, tax identifiers, identity documents, passwords, or one-time codes through TuoYu, GitHub issues, or ordinary email. Enter them only in the appropriate Microsoft Partner Center flow.

Official references:

- [Earnings overview](https://learn.microsoft.com/en-us/partner-center/earnings/earnings-overview)
- [Earnings payments](https://learn.microsoft.com/en-us/partner-center/earnings/earnings-payments)
- [Payout FAQ](https://learn.microsoft.com/en-us/partner-center/marketplace-offers/payout-faq)
- [Set up payout account and tax forms](https://learn.microsoft.com/en-us/partner-center/account-settings/set-up-your-payout-account-and-tax-forms)

## How a TuoYu Subscription Should Work

Creator and Pro are currently local UI previews. They do not charge money and do not prove entitlement.

After the Partner Center app identity exists:

1. Create the monthly and annual Creator and Pro add-ons in Partner Center.
2. Configure market pricing, including the intended tax-inclusive CNY price for China.
3. Replace the local preview buttons with the official Microsoft Store purchase flow.
4. Send the Store purchase result to a trusted server for receipt and entitlement validation.
5. Bind plan status, renewal date, cancellation, expiry, refund, and quota enforcement to the server record.
6. Allow Store services to handle renewal, cancellation, and refund state rather than trusting `localStorage`.
7. Test purchase, duplicate purchase, restore purchase, cancellation, expiry, refund, offline launch, and failed network recovery.

No purchase should be treated as successful until the Store result and, where required, the server-side receipt validation both succeed.

The current safeguards intentionally keep this copy visible:

> Microsoft Store subscription not connected

That label must remain until real Store product IDs and receipt validation are implemented.

## What Counts as Revenue

The Partner Center earnings report is the source of truth for Store revenue. Gross customer payments are not the same as developer proceeds.

Depending on the transaction and market, the amount available for payout can be reduced by:

- Microsoft Store service fees or revenue share
- Sales tax, VAT, GST, and similar taxes
- Refunds and returns
- Chargebacks and fraud adjustments
- Withholding tax
- Currency conversion and bank charges, where applicable
- Corrections, reserves, or amounts on hold

For accounting, reconcile orders and adjustments in Partner Center with the developer's bank statements and tax records. Do not calculate revenue solely from the prices shown in the TuoYu UI.

## China Operating and Tax Checklist

Before selecting China as a Store market, confirm with a qualified accountant or adviser:

- The correct publishing entity and whether revenue should belong to an individual or a company
- Whether the verified bank account and payout currency are supported for that entity
- China tax registration, invoicing, foreign-currency, and bookkeeping obligations
- Price display and consumer-rights requirements
- Privacy, cybersecurity, ICP/domain, and content-distribution obligations
- Whether the Store agreement, app category, and planned paid promotion model are permitted

This document is an engineering and operations checklist, not tax or legal advice.

## Paid Placement Is a Separate Business

The MCP catalog's `boost` and `featured` values are simulation flags. They do not collect payment.

Paid placement revenue is separate from Microsoft Store app-subscription revenue. Before accepting real money from creators:

1. Define the promoted placement product, duration, market, exclusions, and approval rules.
2. Add an order, payment, invoice, refund, dispute, and advertiser-verification system.
3. Select a compliant payment provider for the operating entity and market.
4. Keep paid ranking clearly disclosed and never label it as an organic recommendation.
5. Add rate limits, anti-fraud checks, abuse review, and the ability to suspend deceptive listings.
6. Confirm that the payment and advertising model complies with Microsoft Store policies and applicable advertising, consumer-protection, tax, and platform rules.

Microsoft Store payout for the TuoYu app is not an automatic checkout or settlement system for unrelated third-party paid placement. Do not repurpose Store checkout for an unrelated promotion product without confirming the applicable Store policy.

## Go-Live Gate

Do not claim that customer payments or payouts are live until all of these are true:

- Partner Center identity, tax, and payout profiles are verified.
- The bank account is accepted by Microsoft.
- Store add-ons exist and have final CNY prices.
- The app uses the official Store purchase flow.
- Server-side receipt validation and entitlement enforcement are deployed.
- Refund, cancellation, expiry, and restore-purchase flows have passed testing.
- Earnings and payout reports are visible to the correct financial role.
- Public privacy, support, and subscription terms are available at stable HTTPS URLs.
