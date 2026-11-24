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

## Guided release — end-to-end client-story workflow

The new **Guided AP walkthrough** in the first sidebar group is the recommended commercial starting point. It uses **shared application state** so updates propagate to Supplier invoices, the dashboard, audit trail and CSV export.

1. Open Command centre in Director view to explain the **business-value hypothesis**, not validated savings.
2. Click **Run guided AP walkthrough**. Choose **Receive a new sample invoice** to generate fictional invoice \`NS-DEMO-6041\` (subsequent clicks create separate numbered samples).
3. Inspect the visually rendered fictional invoice — document legal entity B, proposed accounting entity A, and a PO belonging to entity B. Fields are synthetic test values, not actual PDF extraction.
4. In Director view the corrections are disabled. Click **Switch to Controller**, correct the legal entity and run the validation. Wrong-company, duplicate and PO-supplier/PO-entity mismatches are **hard stops**, regardless of justification notes.
5. Check that the invoice moves to **Awaiting human approval**. Click **Record human approval** from the simulated Controller perspective.
6. Only after approval, click **Download approved invoice CSV**. The local review file includes the flag **NOT SENT TO XERO**. The demo records staging in local state and updates its dashboard. It neither posts accounts nor initiates payments.
7. Open Supplier invoices to inspect this case and all others; correct the deliberately problematic \`NS-7421\` for a second example.
8. Explore reconciliations and record a documented difference review. An investigation note does not change or force reconciliation of source ledger balances.
9. Open investor reporting and customise the fictional quarterly pack. Controller can record a review note of at least 20 characters; changes to period, report sections or financial-case state invalidate that review. PDF is always an illustrative draft (never a factual investor statement).
10. Inspect PO and card policy checks, integrations, explainability guide and implementation priorities. In the guide ask for a particular invoice ID or “explain this invoice” for a deterministic context-aware answer.
11. Click **Reset scenario** to clear local financial-case decisions before another sales presentation.

The Director perspective focuses on commercial value and oversight. Financial Controller perspective permits **simulated** edits, exception notes, invoice approvals and report review. This selector is not real authentication.

### Quality and integrity acceptance checks
- Entity, supplier/PO and duplicate problems cannot be waived by free-text note.
- Only eligible missing-PO or overspend exceptions can proceed with Controller justification and separate final approval.
- Approved or staged invoice fields cannot be silently changed.
- Xero-staging export is available only to Controller after approval and cannot be repeated for an already staged case.
- Card spending checks existence, PO entity, amount and receipt evidence.
- Quarterly pack remains clearly fictional and any changed underlying status invalidates its simulated review.
- All steps are local browser interactions; none sends emails, bank instructions, Xero writes or approval requests.
- Tests run in TypeScript, Node unit tests and desktop/mobile Playwright smoke tests. The same smoke suite checks the existing Awais and Kenny demos for regressions.

## Suggested discovery walkthrough (12–18 minutes)
1. **Command centre:** show the first AP pilot and visible exceptions. Four workstreams mirror the supplied conversation.
2. **Supplier invoices:** review synthetic wrong-company invoice NS-7421, missing PO WR-2319, possible duplicate, PO overspend and Controller sign-off. A separate approved-only CSV staging step never posts to Xero. Switch simulated perspective from Director to Financial Controller. Explain that no payment or Xero posting occurs.
3. **Bank reconciliations:** sample Stripe / GoCardless references and value discrepancies. Record a human investigation note.
4. **Quarterly investor pack:** show historical sample quarters vs an explicitly labelled Q4 forecast; export PDF using browser Print and CSV.
5. **POs and card spending:** view Monday.com PO placeholders and receipt/PO exceptions.
6. **Workflow blueprint:** describe proposed integrations and approval gates; simulate batch validation to route records to review or human sign-off, never auto-approval.
7. **Connected ecosystem:** show systems explicitly named by Nick, all labelled NOT CONNECTED.
8. **Finance AI guide:** rules-based explanatory chat only, not an LLM.
9. **Implementation plan:** propose evidence-gathering and a focused AP pilot, followed by expansion to reconciliation, reporting and spend controls. Adjust illustrative ROI assumptions only for discussion.

## Safety and implementation boundaries
- NO live Gmail, Outlook, SharePoint, Xero, Stripe, GoCardless, Hubdoc, ApprovalMax, Monday.com, Space Manager, or Power Automate connections.
- NO real document uploads, stored bank credentials, external email, ledger posting, payment execution, or autonomous approval. The synthetic invoice preview is rendered in HTML, not parsed from a genuine PDF.
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

## Meeting route (12 minutes)
- 0–2: Open Command centre as Director. Compare today's inbox/Hubdoc/Xero/ApprovalMax hand-offs with one controlled AP pilot. Open the assumptions behind annual hours released. Ask Nick which manual step consumes most time.
- 2–7: Receive a new sample in Guided AP walkthrough. Inspect the PDF, extracted company and Monday.com PO. Show that the Director cannot approve. As Controller, correct the company, run checks and explicitly sign off. Download the staging CSV, then open the updated command centre.
- 7–9: Open Connected ecosystem and inspect the settlement comparison. In Finance specialists run the reconciliation sample STR-1029; open its workflow and document the difference. The source amounts never change.
- 9–11: Inspect a missing card receipt, then select a quarter in Investor reporting. Show Xero, collections, occupancy and the review note before printing the fictional pack.
- 11–12: In Implementation plan, ask Sarah for sample invoice volume, handling time, actual PO rules and who owns each approval. Use those inputs to scope the first AP pilot. Dates, scope and costs require separate agreement.

The seven proposed specialist examples read the same selected invoice, settlement, card or reporting quarter as their linked workspaces. Running a specialist changes no financial record. The nine-stage evidence trail can be inspected in any order; actual mutations still require the workflow controls. Sample PO checks compare against the authorised value without an implicit tolerance.
