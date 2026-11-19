# CFO presentation guide — finance reporting pilot

**Audience:** Awais Rehman, manufacturing-group CFO and finance controller.
**Positioning:** An interactive product **concept** built by SC-Analytics, with fictional data. It is not a deployed client pilot, AI service or ERP integration.

## 30-second opening
> Awais described a recurring board-pack preparation problem that may take around two weeks, although the current baseline has not yet been independently verified. Rather than replacing your finance systems, we propose to take **one section** of the board pack and make the source extraction, validation, calculations and draft report repeatable and inspectable. Your finance team retains approval.

## A simple 6-minute walkthrough

1. **Start here · CFO pilot** (60 seconds): explain the two lanes. Blue is **deterministic automation** (no model required). Purple is **optional AI** for ad hoc questions, report changes and interpreting the verified outputs. Click the four stages in order: collect, validate, calculate, review.
2. **Data foundations** (45 seconds): show synthetic Excel/ERP references, the source table and the intentionally injected **$12,500** reconciliation discrepancy. Click **Inspect evidence**.
3. **Finance automation** (60 seconds): show the daily close schedule. Change the time and save; run the sample. Expand the execution log. The timestamps and duration are examples, not a benchmark.
4. **Quantitative intelligence** (45 seconds): move revenue/cost scenario sliders. Enter the formula variance / 3 and explain: the model can *interpret the request*, but a controlled engine must *calculate* the figure.
5. **Board pack studio** (90 seconds): choose **Q3 2026**, switch writing style, remove a section and use **Print / Save PDF**. Reiterate that final publication requires controller review and exception handling. The sample remains entirely local.
6. **Agent workspace** (40 seconds): ask “Which sources were used?” and “How long did the task take?”. Distinguish the **preprogrammed simulated answer** from a future, connected AI agent that would retrieve real run evidence.
7. **Access & governance** (45 seconds): switch from Group CFO to Sales Representative. Verify that finance modules disappear. Show that a production system must enforce this in the backend rather than by hiding navigation.
8. **Beyond the pilot · CFO FAQs** (optional): open only if the CFO asks about broader possibilities (Power BI, custom permissions, multi-agent coordination, AI security, data retention, cash forecasting, audit, schedule modifications).

## Five decisions to agree before a real pilot
- Identify the **one board-pack section** and its business owner.
- Confirm authoritative exports, permissions and an allowed data sample.
- Agree finance definitions, reconciliation rules and exceptions policy.
- Establish measurable baseline: effort, cycle time, defects, repeatability, review.
- Agree parallel-run comparison and sign-off/acceptance requirements.

## What you must not claim
- No customer financial data or live ERP integrations are connected.
- No actual LLM or Agents SDK is running in the public demo; the chat is scripted.
- The role switcher is a **simulation**, not real authentication or tenant isolation.
- The $12,500 problem, run times, KPIs and process history are **synthetic**.
- No guaranteed savings, compliance certifications, accounting sign-off or uptime commitments.
- OpenAI API data are not used for model training by default, but API retention, logging and contracts still require client due diligence.

## Technical narrative for deeper questions
- A scheduled worker runs deterministic ETL and financial controls.
- Every run persists provenance, rule version, elapsed time, results and exceptions.
- A controlled document generator applies the company's approved templates.
- A scoped optional AI agent answers questions and proposes changes using approved tools and evidence.
- The backend validates every read/write with identity, permissions and human approval where required.
- Existing ERP, SQL Server, CRM or Power BI can remain the source/presentation layer subject to approved integration.

**Commercial principle:** The first engagement is about **credible reporting evidence**, not a large-scale multi-agent transformation promise. Later opportunities require their own business cases and separate agreement.
