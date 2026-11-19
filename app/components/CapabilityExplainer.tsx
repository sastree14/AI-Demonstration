"use client";

import {ArrowUpRight,Bot,CheckCircle2,ShieldCheck,Sparkles,Workflow} from "lucide-react";
import {type View} from "@/lib/demo";

const definitions:Partial<Record<View,{question:string;automatic:string;ai:string;decision:string}>>={
 overview:{question:"What the CFO sees",automatic:"Reproducible KPIs and an exception summary.",ai:"Optional explanation of changes or risks.",decision:"Select a reporting period or review a draft."},
 data:{question:"How can we trust the inputs?",automatic:"File reading, source mapping, quality checks, lineage and reconciliation are rule-based.",ai:"Ask what a source column means, why a record was flagged or where a figure came from.",decision:"Investigate the exception before using the numbers."},
 workflows:{question:"What runs at 08:00, and who controls it?",automatic:"Scheduling, record extraction, fixed validation rules, calculations and time-stamped logs require no AI.",ai:"Ask why a task failed, request a different schedule or propose a new procedure.",decision:"Reconfigure, review, approve or reject only when authorised."},
 intelligence:{question:"Who calculates the figures?",automatic:"Formulas, scenario arithmetic and KPI values come from a controlled calculation engine.",ai:"Interpret a new KPI request or explain the financial implications of a scenario.",decision:"Verify assumptions and approve corporate metrics."},
 reports:{question:"Can the output look like our existing board pack?",automatic:"A versioned template controls layout, tables, included sections and recalculated KPI values.",ai:"Request a different writing tone, explain a variance or draft a revised narrative.",decision:"Review content and sign off before distribution."},
 agents:{question:"Why use AI at all?",automatic:"The underlying process has already saved actions, values and evidence without a model.",ai:"A specialised assistant can answer authorised questions and propose changes using that evidence.",decision:"Approve lasting changes to templates, metrics or schedules."},
 security:{question:"What changes for each signed-in person?",automatic:"A production backend would enforce verified user, role, entity, field and action permissions.",ai:"The assistant may explain a denial but cannot grant new permissions.",decision:"Administrators set policy; finance owners approve sensitive actions."},
 integrations:{question:"Must we replace the tools we already use?",automatic:"Adapters can read approved exports or APIs and preserve the source-of-truth system.",ai:"Optional language support adds explanations to the validated dataset.",decision:"Choose source systems, hosting, data policy and BI presentation layer."},
};
export default function CapabilityExplainer({view,onAsk}:{view:View;onAsk:()=>void}){
 const x=definitions[view];if(!x)return null;
 return <section className="capability-explainer" aria-label="How this capability works">
  <div className="capability-heading"><span className="eyebrow">IN PLAIN ENGLISH</span><h3>{x.question}</h3><span>What actually runs behind the screen</span></div>
  <div className="capability-columns"><div><span className="engine-chip deterministic"><Workflow size={13}/> AUTOMATION · NO AI</span><p>{x.automatic}</p></div><div><span className="engine-chip assisted"><Sparkles size={13}/> OPTIONAL AI</span><p>{x.ai}</p></div><div><span className="engine-chip decision"><ShieldCheck size={13}/> HUMAN CONTROL</span><p>{x.decision}</p></div></div>
  {view!=="agents"&&<button className="pilot-inline-link" onClick={onAsk}>Ask the simulated agent <ArrowUpRight size={14}/></button>}
 </section>;
}
