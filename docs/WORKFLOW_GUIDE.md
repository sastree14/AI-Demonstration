# Finance Intelligence — Functional Demonstration Guide

This is a self-contained, browser-only illustration of a finance-reporting workspace using **synthetic data**. It does not use a language model, connect to an ERP or enforce production authentication.

## Guided reporting workflow

Open **Workflow guide · 4 steps**. Select each stage to inspect how data moves through the system.

1. **Collect:** source workbook and ERP extracts, entity/period mapping, source references.
2. **Validate:** field checks, quality rules, and an intentionally injected **$12,500 reconciliation exception**.
3. **Calculate:** deterministic revenue, EBITDA, margin and budget-variance metrics; prepare a report section.
4. **Review:** inspect evidence, acknowledge the sample discrepancy and simulate report approval using a permitted role.

The blue **Automation · No AI required** lane explains tasks carried out by code: scheduling, extraction, validation, calculations, trace and report assembly. The purple **AI · When needed** lane illustrates potential natural-language requests and explanations. No AI is running.

## Explore controls in the workspace

- **Finance automation:** change a schedule, trigger a local sample execution and inspect the step-by-step run record.
- **Board pack studio:** change reporting period, select organisational scope, edit sections and narrative style, print to PDF.
- **Quantitative intelligence:** adjust scenario parameters; create a controlled KPI such as `variance / 3` using the local formula parser.
- **Agent workspace:** use the predefined simulated questions about sources, execution duration, results and access.
- **Access & governance:** switch between CEO, CFO, regional finance and sales personas to illustrate different visible modules and actions.
- **System capabilities & settings:** browse searchable documentation covering user permissions, integration, future deployment controls, reporting preferences and optional AI.

## Interpreting the simulation

| Component | What happens here | Required in a connected system |
|---|---|---|
| User roles | Manual persona selector | Verified SSO/OAuth and backend authorisation |
| Data inputs | Synthetic fixture; optional local CSV | Approved ERP, SQL and file connectors |
| Scheduling | Browser-local configuration | Persistent scheduler and worker |
| Execution trace | Representative, scripted events | Real tool and task logs with timestamps |
| KPI calculations | Local deterministic expressions | Validated, versioned formulas over authorised data |
| Report PDF | Browser Print / Save PDF | Corporate document generation and distribution |
| Agent conversations | Predefined responses | Authenticated model with scoped tools and evidence |
| Approval | Local state change | Server-side checks, immutable audit and sign-off workflow |
| Security | Explanatory UI only | User, entity, field and resource policies |

## Dataset and limitations

Aurelia Manufacturing is fictional. The figures, data errors, timings, approval labels and role permissions are illustrative. The static browser bundle must not contain confidential business data. Marking the sample exception as acknowledged does not correct the underlying ledger. Production processing and AI privacy/retention depend on the selected vendor, endpoints, hosting and contractual configuration.

Run locally with Node.js 20+:

```bash
npm install
npm run dev
```

Or visit https://sastree14.github.io/AI-Demonstration/ .
