# Wigwam Storage — provisional finance operations demo

## Source basis (23 November 2026)
From the discussion transcribed by the user, Nick Grant asked for practical **implementation**, not only ongoing coaching, to assist the bookkeeper and enable her to become proficient with AI tools. He identified an accounts-payable logjam:

> Shared email inbox PDF → Hubdoc → Xero → ApprovalMax; manual hand-offs, missing POs and wrong-company details.

Nick subsequently confirmed the current systems: **Xero, Hubdoc, ApprovalMax, Power Automate, SharePoint, Stripe, GoCardless and Space Manager**; purchase orders in **Monday.com**.

Four priorities expressed by Nick:
1. Supplier invoice processing including correct company allocation.
2. Bank reconciliations across payment systems.
3. Quarterly reporting to investors.
4. Purchase orders and card spending controls.

He asked for implementation alongside Financial Controller Sarah Shaw and stipulated that **people remain in control of approvals and payments**.

Luke Finance referred Nick to an implementation partner and proposed discovery with Nick and Sarah. Do not imply the scope or pricing was agreed, or that all systems have accessible APIs. This demonstration uses synthetic entities and transaction amounts to illustrate workflow options.

## Live route
https://sastree14.github.io/AI-Demonstration/demos/wigwam-finance/

This route is independent of all other client demo pages, without links between client workspaces. The simple existence of a route is NOT an authentication control; do not load confidential customer material here.

## Suggested discovery walkthrough (12–18 minutes)
1. **Command centre:** show the first AP pilot and visible exceptions. Four workstreams mirror the supplied conversation.
2. **Supplier invoices:** review synthetic wrong-company invoice NS-7421, missing PO WR-2319, possible duplicate, PO overspend, and controller sign-off. Switch simulated perspective from Director to Financial Controller. Explain that no payment or Xero posting occurs.
3. **Bank reconciliations:** sample Stripe / GoCardless references and value discrepancies. Record a human investigation note.
4. **Quarterly investor pack:** show historical sample quarters vs an explicitly labelled Q4 forecast; export PDF using browser Print and CSV.
5. **POs and card spending:** view Monday.com PO placeholders and receipt/PO exceptions.
6. **Workflow blueprint:** describe proposed integrations and approval gates; simulate batch validation to route records to review or human sign-off, never auto-approval.
7. **Connected ecosystem:** show systems explicitly named by Nick, all labelled NOT CONNECTED.
8. **Finance AI guide:** rules-based explanatory chat only, not an LLM.
9. **Implementation plan:** propose evidence-gathering and a focused AP pilot, followed by expansion to reconciliation, reporting and spend controls. Adjust illustrative ROI assumptions only for discussion.

## Safety and implementation boundaries
- NO live Gmail, Outlook, SharePoint, Xero, Stripe, GoCardless, Hubdoc, ApprovalMax, Monday.com, Space Manager, or Power Automate connections.
- NO real document uploads, stored bank credentials, external email, ledger posting, payment execution, or autonomous approval.
- ALL invoices, legal entities (A/B/C), supplier names, POs, card spends, reconciliations, quarterly balances, percentages and ROI numbers are invented.
- A “Financial Controller view” in this public demo does NOT authenticate as Sarah. Production needs server-side accounts, least-privilege permissions, audit logs, API permission review and secure storage.
- State changes persist only in localStorage in the current browser and are resettable. Exception overrides are documented separately from approval.
- AI guidance consists of deterministic response logic, not a production agent. Do not claim autonomous source-aware reasoning.
- Investor-pack PDF is browser print-to-PDF. It is not a verified investor statement.

## Pre-implementation questions
- Number of legal entities, their bookkeeping identifiers and which invoices belong to whom?
- Weekly invoice volume, manual handling time, document format and exceptions?
- Existing Hubdoc/Xero/ApprovalMax routing configuration and actual API permissions?
- Monday.com PO authorisation and supplier reference rules?
- Card policy: available feed, thresholds and receipt requirements?
- Reconciliation source-of-truth across Stripe, GoCardless, bank and Space Manager?
- Quarterly board-pack templates, sign-offs, KPIs and data quality?
- Exact human roles for invoice, PO and payment approvals; do not bypass.
- Security/data-retention requirements and scope of the first pilot.

## Validation
`npm run typecheck`
`node --experimental-strip-types --test tests/wigwam-finance.test.mjs`
`GITHUB_PAGES=true npm run build`

Existing Finance Intelligence and AI Transformation routes are unchanged.
