# Finance Intelligence — AI Demonstration

**SC-Analytics | Prepared as a finance-transformation concept for Awais Rehman / CFO discussions.**

An executive-first **Next.js 16** interactive demonstration of one controlled board-pack workflow, with advanced capabilities available for follow-up questions. This is a **fully simulated, synthetic-data proof of concept**, not an AI agent, not a financial system, and not a production security implementation.

## Start with the CFO pilot, not the technical catalogue

**Live demo:** https://sastree14.github.io/AI-Demonstration/

The new landing screen **Start here · CFO pilot** walks through four stages:

1. **Collect** — selected ERP and Excel exports.
2. **Validate** — schema checks, source mapping and a $12,500 example reconciliation exception.
3. **Calculate** — deterministic KPIs, budget variance and a reproducible report section.
4. **Review** — controller/CFO sign-off and a traceable audit record.

Each stage clearly distinguishes **deterministic automation (no AI needed)**, **optional AI assistance** and **human approval**. The original modules remain usable as detailed demonstrations. The final tab, **Beyond the pilot · CFO FAQs**, contains a three-phase expansion roadmap, a user-role sandbox and **32 searchable CFO questions** on permissions, security, reporting, scheduling, governance, data retention, custom formulas, ERP/Power BI and future FP&A.

**Presentation script:** [docs/CFO_PILOT_WALKTHROUGH.md](docs/CFO_PILOT_WALKTHROUGH.md) — a six-minute walkthrough with claims to avoid and five decisions to agree before a real pilot.

The demonstration supports a **Q3 2026** board-pack filter (with six-month and October options). This prevents mixing quarter-labelled figures with six-month totals. An open exception blocks illustrative approval until the reviewer acknowledges it; acknowledgement is explicitly not ledger correction.

## Four capabilities in one application

The four workstreams follow the SC-Analytics technical partnership discussion:

1. **Data foundations** — representative Excel/CSV, ERP and bank sources, lineage, browser-only CSV import, record scope and a reconciliation exception.
2. **Reliable finance automation** — editable simulated schedules, one-click simulated execution, seven inspectable audit steps, approval/rejection workflow and run-duration explanations.
3. **Quantitative intelligence** — financial scenario sliders, deterministic KPI calculations, safe custom-formula interpreter (no `eval`/code execution), metric registry and regional scope.
4. **Decision-facing interfaces** — native finance charts, executive board pack, editable sections, report-writing tone, print-to-PDF and BI-embedding illustration.

The app additionally includes a role-based **Agent Workspace** (CEO, Group CFO, EMEA Finance Manager, Sales Representative); a deterministic chat simulator that answers questions about evidence, formulas, timings and access; governance explanations; and illustrated adapters for Power BI, Salesforce, HubSpot, SAP/Dynamics and SQL.

### Suggested six-minute CFO route

Follow the guided landing page first: **Collect → Validate → Calculate → Review**. Then demonstrate **Finance automation** schedule changes, the **Q3 Board pack** and the simulated **Agent workspace** questions. Show **Access & governance** with a sales persona and reserve **Beyond the pilot · CFO FAQs** for advanced questions.

The complete narration and caveats are in [docs/CFO_PILOT_WALKTHROUGH.md](docs/CFO_PILOT_WALKTHROUGH.md).

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
## Optional free live demo (GitHub Pages)

This repository includes `.github/workflows/pages.yml`, a static GitHub Pages deployment workflow. The first attempt can fail with HTTP 404 until the repository owner enables Pages.

1. In [Repository Settings → Pages](https://github.com/sastree14/AI-Demonstration/settings/pages), set **Build and deployment → Source → GitHub Actions**.
2. Open [Actions → Publish static finance demonstration](https://github.com/sastree14/AI-Demonstration/actions/workflows/pages.yml) and choose **Run workflow** (or push another change to `main`).
3. After a successful deployment, the expected site is **https://sastree14.github.io/AI-Demonstration/**.

The normal **Verify finance demonstration** workflow runs TypeScript and Next.js build checks automatically. The site is a browser-only concept with synthetic data and no API keys.
