# Finance Intelligence — AI Demonstration

**SC-Analytics | Prepared as a finance-transformation concept for Awais Rehman / CFO discussions.**

A polished **Next.js 16** interactive demonstration of the finance-automation operating model. This is a **fully simulated, synthetic-data proof of concept**, not an AI agent, not a financial system, and not a production security implementation.

## Four capabilities in one application

The four workstreams follow the SC-Analytics technical partnership discussion:

1. **Data foundations** — representative Excel/CSV, ERP and bank sources, lineage, browser-only CSV import, record scope and a reconciliation exception.
2. **Reliable finance automation** — editable simulated schedules, one-click simulated execution, seven inspectable audit steps, approval/rejection workflow and run-duration explanations.
3. **Quantitative intelligence** — financial scenario sliders, deterministic KPI calculations, safe custom-formula interpreter (no `eval`/code execution), metric registry and regional scope.
4. **Decision-facing interfaces** — native finance charts, executive board pack, editable sections, report-writing tone, print-to-PDF and BI-embedding illustration.

The app additionally includes a role-based **Agent Workspace** (CEO, Group CFO, EMEA Finance Manager, Sales Representative); a deterministic chat simulator that answers questions about evidence, formulas, timings and access; governance explanations; and illustrated adapters for Power BI, Salesforce, HubSpot, SAP/Dynamics and SQL.

### Example guided demo (8–12 minutes)

1. Start as **Group CEO**, show the consolidated revenue/budget chart and four capabilities.
2. Open **Data foundations**; inspect the lineage and the intentional $12,500 ledger exception. Review the evidence.
3. Open **Finance automation**; edit the 08:00 Dubai schedule and run a simulated procedure; click each execution step. Approve the draft if acting as CFO/CEO.
4. Open **Quantitative intelligence**; vary revenue and direct costs, then save a custom KPI with `variance / 3` and watch the preview update.
5. Open **Board pack studio**; change narrative tone, disable Closing recommendations, filter to Aurelia Gulf and print to PDF.
6. Open **Agent workspace**; ask “How long did the task take?”, “Which sources were used?” and “Why is revenue below budget?”.
7. Change role to **Sales Representative**: finance modules disappear; the Sales Agent cannot disclose payroll/group finance. Explain that production permissions would be enforced server-side, not by browser visibility.
8. Open **Integrations**: demonstrate how a secured connector could link to SAP, HubSpot, SQL and Power BI without requiring a CRM migration.

## Run locally

Requirements: Node.js 20.9+ (22 recommended).

```bash
npm install
npm run dev
```

Then visit `http://localhost:3000`. For a production-style build:

```bash
npm run typecheck
npm run build
```

`next.config.ts` uses `output: "export"`, generating a static `out/` directory suitable for hosting as a static demonstration. No environment variables or API keys are needed. This repository includes **no real OpenAI API calls, no Agents SDK invocation and no backend database**.

## Important scope and safety limitations

- **All company names, people, figures, execution steps, audit references and role permissions are synthetic.** Aurelia Manufacturing is fictional.
- Role switching is **not authentication**. Client-side hiding is **not authorization**. The synthetic dataset is shipped in the JavaScript bundle and must not contain confidential information.
- Agent conversations are **deterministic simulated responses** based on predefined rules; the app does not perform model inference or learn autonomously.
- CSV import happens locally in the browser. This dependency-free prototype reads simple CSV exports from Excel, not `.xlsx` workbooks; no data is uploaded.
- Saved schedules, KPI definitions and template preferences use `localStorage`, not a job scheduler. They are specific to the user's browser and can be reset by clearing site storage.
- The deliberate reconciliation exception is a **scenario fixture**, not an actual financial validation.
- Report printing uses the browser print dialog for "Save as PDF"; no finance PDF distribution occurs.
- The connector catalog and Power BI canvas are illustrative placeholders, not live integrations.
- OpenAI API data-use/retention statements require separate verification for the actual contract, account, model and integration configuration. **This prototype cannot certify security or compliance.**

### Production requirements before real customer data

Implement server-verified SSO/OAuth, identity- and tenant-scoped policies, field-/record-level permissions, secure connector credentials, structured audit/event storage, immutable approval events, a durable scheduler/worker, source reconciliation, vendor data-processing reviews, data residency and incident handling. Use a versioned safe KPI DSL rather than executing user-provided arbitrary source code. Finance-domain owners must sign off finance rules and calculated figures.

## Source / commercial distinction

Awais confirmed an active opportunity to meet the Group CFO and mentioned **reporting, live artifacts and board packs as a likely T1**. The four capability labels used in this demo come from the earlier SC-Analytics technical partnership discussion. This demonstration is **not** an agreed scope, a signed delivery commitment, a representation of an existing client deployment or a replacement for functional discovery and acceptance criteria.

Built to communicate the potential of a tailored finance workflow—not to misrepresent a working enterprise agent.