# White-label AI Transformation Studio — demonstration guide

## Purpose
An isolated, **browser-only** sales demonstration for a fictional AI transformation consultancy. Intended to explain the workflow Kenny described: discovery calls, workflow mapping, AI opportunities, client proposal options, ROI, delivery roadmap and technical implementation partnerships.

The demo deliberately **does not connect to Awais' Finance Intelligence application**. The only client-facing route is /demos/ai-assessment/ within the existing GitHub Pages site.

### Suggested 15–20-minute product walkthrough
1. **Command center.** Pick the fictional Meridian Distribution case. Show a complete assessment and compare three fictional businesses.
2. **Discovery & intake.** Upload a text/PDF/DOCX interview extract or paste notes; review evidence before applying. Use the structured questionnaire as the second path. For unlabelled speech transcripts, the parser leaves fields missing instead of inventing answers.
3. **Process mapping.** Show the information-readiness gate, human exception lane, editing, reordering and adding stages.
4. **AI opportunities.** Inspect weighted scores and reasons. Approve/reject a suggestion and show rankings respond to consultant feedback.
5. **Proposal architect.** Compare a limited Proof of Value and a governed rollout. Numbers are **fictional sample customer project prices**, not the cost to develop this toolkit.
6. **ROI & economics.** Vary automation coverage, labour, infrastructure, licensing and staffing; inspect year-one and three-year results.
7. **Roadmap & pipeline.** Pick a package; show accountable milestones, capacity constraints, meeting actions and multi-client prioritisation.
8. **NDA & governance.** Prepare a **non-signature-ready** legal-review draft; see role matrix and implementation controls.
9. **Connected ecosystem.** Show Google/Microsoft file intake, calendars, CRM, databases, orchestration and LLM integration *as architecture proposals only*.
10. **Agent workspace & deliverables.** Ask a specialist a domain question and generate a configurable, print-to-PDF assessment.

## Product promises versus static demonstration
| Capability | This Pages demo | Required for production |
|---|---|---|
| Transcript upload | TXT, MD, VTT, SRT, CSV, JSON, DOCX and text-based PDF parsed in browser | Authenticated storage, encryption, consent, approved transcription provider |
| AI extraction | Exact, explicitly labelled facts only | LLM with provenance, review, redaction, refusal on low confidence |
| Mapping | Editable, gated deterministic stages | Connected company data, approvals, feedback versions |
| Recommendations | Explainable weighted rules, local feedback | Calibrated methodology with evidence, evaluation and review |
| AI chat | Deterministic context answers | Protected LLM + RAG + access-controlled tools |
| ROI | Editable assumptions and transparent formulas | Verified baseline and ongoing actual-vs-expected results |
| NDA | Unreviewed illustrative downloadable text | Qualified jurisdiction-specific legal drafting and signature workflow |
| Integrations | Clickable conceptual connectors, no network calls | OAuth, server-side policy, audit trails, rate limits, retry handling |
| Project records | localStorage only | Tenant-isolated database, roles, backups, deletion and retention |
| Client PDF | Browser print-to-PDF | Governed document service and approval/version registry |

### Safety and sales boundaries
- All organisations, people, amounts, timelines, agents and evidence are invented for this demonstration.
- **Never upload customer data, confidential calls, PII, NDA-protected material or real credentials to a publicly hosted demo.**
- Imported document contents are parsed within the browser; applied fields and transcripts may persist in browser storage. This is not a secured production data store.
- Consultant feedback changes local preferences. It does **not** train an AI model or deploy new software.
- Client proposal prices are scenario illustrations, not an offer by SC-Analytics, an estimate for building the white-label toolkit, or a fixed customer quotation.
- Lead conversion scores are ordinal heuristics, not probabilities validated on deal outcomes.
- An NDA template needs qualified legal review before signature.
- True production would require security and cost assessment for each integration, scope, role and country.

## Developer verification
Run:
- npm install
- npm run typecheck
- node --experimental-strip-types --test tests/assessment-engine.test.mjs
- GITHUB_PAGES=true npm run build

The existing GitHub Actions workflow exports the entire static Next.js site including the new nested route. No new repository or Pages site is needed.

## Expansion architecture
The prospective production solution should separate intake and extraction, tenant-scoped case database, mapping/versioned evidence, recommendation/approval service, ROI model registry, client document generation, deal CRM, integration adapters, meeting automation, and observability. Put LLM tool access behind a permission-enforced API; never rely on hidden links or browser role selectors as security.
