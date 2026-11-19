"use client";

import {useState} from "react";
import {ArrowRight,ArrowUpRight,Bot,CheckCircle2,ChevronLeft,ChevronRight,Clock3,Database,FileCheck2,FileText,LockKeyhole,Play,ShieldCheck,SlidersHorizontal,Sparkles,Workflow,AlertTriangle,Check,Users} from "lucide-react";
import {money,roles,type Role,type View,type Metrics,type Schedule} from "@/lib/demo";

type Props={
 role:Role;
 metrics:Metrics;
 entityLabel:string;
 hasIssue:boolean;
 approval:"pending"|"approved"|"rejected";
 runNumber:number;
 schedules:Schedule[];
 onNavigate:(view:View)=>void;
 onRoleChange:(role:Role)=>void;
 onRun:()=>void;
 onReview:()=>void;
 onApprove:()=>void;
};
type Step={name:string;time:string;title:string;intro:string;automatic:string[];ai:string[];evidence:string;target:View;button:string};
const steps:Step[]=[
 {name:"01 · Collect",time:"INPUTS",title:"Bring finance data together",intro:"Start with one agreed section of the group board pack and only the approved exports it depends on.",automatic:["Import a planning Excel/CSV export and general-ledger extract.","Map entities, periods, currencies and column definitions.","Keep the reference back to each source and reporting period."],ai:["Ask where a figure originated or what source was used.","Request an explanation of a spreadsheet field or a data exception."],evidence:"Source register, mapped fields and data-lineage reference",target:"data",button:"Inspect sources"},
 {name:"02 · Validate",time:"CONTROL GATE",title:"Detect discrepancies before reporting",intro:"The control engine checks the data before allowing a draft to move towards approval.",automatic:["Check required fields, formats, definitions and reconciliation totals.","Flag an illustrative $12,500 mismatch rather than silently correcting it.","Store the validation result and the exception reference."],ai:["Ask why a validation failed and which rule was applied.","Request a plain-English explanation for the controller."],evidence:"Exception QA-17 / GL-2205, rule and reviewer status",target:"workflows",button:"Inspect control trail"},
 {name:"03 · Calculate",time:"OUTPUT",title:"Calculate KPIs and assemble a draft",intro:"Financial figures are produced by repeatable calculations. The optional AI layer helps interpret and customise them.",automatic:["Calculate revenue, EBITDA, budget variance and margin using fixed formulas.","Generate a reproducible board-pack section from a corporate template.","Apply the selected entity and reporting period."],ai:["Explain a variance using authorised evidence, without inventing causes.","Propose a new KPI or a different commentary style for approval."],evidence:"Formula definitions, report version and synthetic result",target:"intelligence",button:"Try KPIs and scenarios"},
 {name:"04 · Review",time:"SIGN-OFF",title:"Review and authorise the output",intro:"The final authority stays with finance: exceptions, commentary and draft publication can be reviewed.",automatic:["Place the draft and evidence into a review queue.","Record the approver, version and decision on a real implementation.","Publish only after all required controls pass."],ai:["Ask how long the run took or why a figure was included.","Request a filter, an omitted section or an alternative executive summary."],evidence:"Review queue, approval decision and audit trail",target:"reports",button:"Open board-pack studio"},
];
export default function PilotWalkthrough({role,metrics,entityLabel,hasIssue,approval,runNumber,schedules,onNavigate,onRoleChange,onRun,onReview,onApprove}:Props){
 const [active,setActive]=useState(0);
 const step=steps[active];
 const finance=role!=="sales";
 const canEdit=roles[role].edit;
 const canApprove=roles[role].approve;
 return <div className="pilot-experience">
  <div className="pilot-hero">
   <div className="pilot-hero-copy">
    <p className="pilot-overline"><span className="pilot-dot"/> FINANCE REPORTING · INTERACTIVE WORKFLOW</p>
    <h1>Financial reporting, <span>from source to approval.</span></h1>
    <p>Follow a quarterly reporting workflow from example ERP and spreadsheet data to validation, calculated indicators and reviewer approval. The figures are calculated by software; optional AI assistance is illustrated separately.</p>
    <div className="pilot-hero-buttons"><button className="btn primary" onClick={()=>{setActive(0);document.getElementById("pilot-process")?.scrollIntoView({behavior:"smooth",block:"start"})}}>Open workflow guide <ArrowRight size={16}/></button>{role!=="sales"&&<button className="btn secondary" onClick={()=>onNavigate("reports")}><FileText size={16}/> View sample board pack</button>}</div>
    <p className="pilot-hero-foot">Interactive simulation · Fictional company and figures · No live AI or ERP connection</p>
   </div>
   <div className="pilot-hero-card">
     <div className="pilot-mini-heading"><span>REPORTING WORKFLOW</span><FileCheck2 size={19}/></div>
     <p className="pilot-quote">Quarterly board pack · Financial performance section</p>
     <div className="pilot-mini-divider"/>
     <div className="pilot-target"><Clock3 size={17}/><div><strong>Example sources</strong><small>ERP general ledger and Excel budget workbook, represented by synthetic data.</small></div></div>
     <div className="pilot-target"><ShieldCheck size={17}/><div><strong>Workflow output</strong><small>Validated KPIs, an exception register, a report draft and a review decision.</small></div></div>
   </div>
  </div>
  <div className="pilot-rule"><strong>A clear division of labour</strong><div className="pilot-rule-item"><span className="engine-chip deterministic"><Workflow size={14}/> AUTOMATION · NO AI REQUIRED</span><p>Scheduling, extraction, reconciliation, arithmetic, report assembly and audit events.</p></div><div className="pilot-rule-item"><span className="engine-chip assisted"><Sparkles size={14}/> AI · WHEN NEEDED</span><p>Questions, explanations, draft language, suggested formulas and changes requiring approval.</p></div></div>
  <section className="pilot-path" id="pilot-process">
   <div className="pilot-section-head"><div><p className="eyebrow">FOUR-STEP WORKFLOW GUIDE</p><h2>From source data to a reviewed report</h2><p>Select a step to inspect its automatic actions, optional AI assistance and the evidence recorded along the way.</p></div><span className="pilot-progress">{active+1} of 4</span></div>
   <div className="pilot-tabs" role="tablist" aria-label="Board pack workflow stages">{steps.map((s,i)=><button key={s.name} role="tab" aria-selected={active===i} className={active===i?"selected":""} onClick={()=>setActive(i)}><span className="pilot-step-index">{String(i+1).padStart(2,"0")}</span><span>{s.name.split(" · ")[1]}</span></button>)}</div>
   <div className="pilot-stage">
    <div className="pilot-stage-top"><span className="eyebrow">{step.time} / STAGE {active+1}</span><span className="pilot-stage-number">0{active+1}</span></div>
    <h3>{step.title}</h3><p className="pilot-stage-intro">{step.intro}</p>
    <div className="pilot-dual">
     <div className="pilot-lane"><span className="engine-chip deterministic"><Workflow size={14}/> DETERMINISTIC SOFTWARE</span><ul>{step.automatic.map(t=><li key={t}><Check size={15}/><span>{t}</span></li>)}</ul></div>
     <div className="pilot-lane"><span className="engine-chip assisted"><Sparkles size={14}/> OPTIONAL AI ASSISTANT</span><ul>{step.ai.map(t=><li key={t}><Bot size={15}/><span>{t}</span></li>)}</ul><button className="pilot-inline-link" onClick={()=>onNavigate("agents")}>Try simulated agent questions <ArrowUpRight size={14}/></button></div>
    </div>
    <div className="pilot-stage-bottom"><div className="pilot-evidence"><FileCheck2 size={18}/><span><strong>Recorded evidence</strong>{step.evidence}</span></div><div className="pilot-stage-actions">{finance&&<button className="btn secondary" onClick={()=>onNavigate(step.target)}>{step.button} <ArrowUpRight size={15}/></button>}<button className="btn primary" onClick={()=>setActive((active+1)%4)}>{active===3?"Restart walkthrough":"Next step"} <ChevronRight size={16}/></button></div></div>
   </div>
  </section>
  <section className="pilot-try">
   <div className="pilot-section-head"><div><p className="eyebrow">INTERACTIVE SYSTEM CONTROLS</p><h2>Change a setting and inspect the result</h2><p>Changes in this section update the simulated workspace in your browser. They do not connect to or modify external systems.</p></div></div>
   <div className="pilot-actions-grid">
    <div className="pilot-action-card"><div className="pilot-action-icon"><Users size={22}/></div><h3>See what each employee can access</h3><p>A group executive, local manager and sales representative do not need the same data, agents or approval powers.</p><label className="field">Simulate signed-in user<select value={role} onChange={e=>onRoleChange(e.target.value as Role)}><option value="ceo">Group CEO · group-wide</option><option value="cfo">Group CFO · full finance</option><option value="manager">Regional finance · Europe only</option><option value="sales">Sales employee · no group finance</option></select></label><div className="pilot-card-result"><LockKeyhole size={16}/><span>{finance?role==="manager"?"Only Europe finance. Cannot modify schedules or approve packs.":"Group finance visible, subject to the configured approval permissions.":"Finance KPIs, group workflows and board pack are not available to this persona."}</span></div><button className="pilot-inline-link" onClick={()=>onNavigate("security")}>How enterprise access would be enforced <ArrowUpRight size={14}/></button></div>
    <div className="pilot-action-card"><div className="pilot-action-icon"><Clock3 size={22}/></div><h3>Reconfigure or execute a task</h3><p>A finance owner changes frequency, time and time zone from the UI. A scheduler would then use the updated configuration.</p><div className="pilot-card-result"><Clock3 size={16}/><span>Daily close · {schedules[0]?.time} · {schedules[0]?.zone} · {schedules[0]?.frequency}</span></div><div className="pilot-buttons"><button className="btn secondary" onClick={()=>onNavigate("workflows")} disabled={!finance}>Edit the schedule</button><button className="btn primary" onClick={onRun} disabled={!canEdit}><Play size={15}/> Run sample</button></div><small>{canEdit?"Execution creates a new sample trace.":"Your simulated role cannot execute corporate workflows."}</small></div>
    <div className="pilot-action-card"><div className="pilot-action-icon"><ShieldCheck size={22}/></div><h3>Inspect and control publication</h3><p>Review an exception, inspect evidence and approve the board pack only if authorised and the control gate is clear.</p><div className="pilot-card-result"><AlertTriangle size={16}/><span>Control exception: {hasIssue?"$12,500 awaiting review":"waiver acknowledged (demo only)"} · Pack: {approval}</span></div><div className="pilot-buttons"><button className="btn secondary" disabled={!canApprove||!hasIssue} onClick={onReview}>Acknowledge exception</button><button className="btn primary" disabled={!canApprove||hasIssue||approval==="approved"} onClick={onApprove}><Check size={15}/> Approve draft</button></div><small>{!canApprove?"Finance approval is restricted for this role.":hasIssue?"A live workflow would require reconciling or formally resolving the exception before sign-off.":"Review acknowledgement in this demo is not proof that financial entries reconcile."}</small></div>
   </div>
  </section>
  {finance?<section className="pilot-result"><div><p className="eyebrow">EXAMPLE OUTPUT · AUTHORISED VIEW</p><h2>Calculated results and source traceability</h2><p>The figures below are recalculated from fictional records. Open the corresponding page to inspect supporting data and assumptions.</p></div><div className="pilot-result-metrics"><div><small>Revenue · current scope</small><strong>{money(metrics.revenue,true)}</strong></div><div><small>Budget variance</small><strong>{money(metrics.variance,true)}</strong></div><div><small>EBITDA</small><strong>{money(metrics.ebitda,true)}</strong></div><div><small>Visible entity</small><strong className="pilot-entity">{entityLabel}</strong></div></div><div className="pilot-result-actions"><button className="btn primary" onClick={()=>onNavigate("reports")}><FileText size={16}/> View / print report</button><button className="btn secondary" onClick={()=>onNavigate("agents")}><Bot size={16}/> Ask how it was produced</button><span className="pilot-muted">Run reference FIN-2026-{String(runNumber).padStart(3,"0")}</span></div></section>:<section className="pilot-result pilot-restricted"><LockKeyhole size={25}/><div><h2>Finance outputs are hidden from this role</h2><p>In production, signed identity and backend record-level checks would prevent retrieval — not merely hide this card.</p></div><button className="btn secondary" onClick={()=>onNavigate("agents")}>Open Sales Agent</button></section>}
  <div className="pilot-later"><div><p className="eyebrow">SIMULATION DETAILS</p><h3>What is simulated and what requires a connected system</h3><p><strong>In this demo:</strong> sample source records, calculations, configurable report sections, scheduled-task settings, role views and illustrative approval history run inside your browser.</p><p><strong>In a real implementation:</strong> ERP connectors, authenticated users, backend permissions, persistent schedules, auditable approvals, real AI agents and Power BI integration require additional infrastructure and configuration.</p></div><button className="btn secondary" onClick={()=>onNavigate("expansion")}>View advanced capabilities <ArrowRight size={16}/></button></div>
 </div>;
}
