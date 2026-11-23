/* Browser-only, transparent methodology. Every company is fictional. */
export type Module="overview"|"discovery"|"mapping"|"assessment"|"commercial"|"roi"|"roadmap"|"pipeline"|"governance"|"integrations"|"agents"|"deliverables";
export type Case={
 id:string;company:string;sector:string;employees:number;revenue:number;systems:string;process:string;
 owner:string;trigger:string;inputs:string;steps:string;outputs:string;exceptions:string;objective:string;
 weeklyVolume:number;minutes:number;hourlyCost:number;coverage:number;setup:number;infra:number;licences:number;staff:number;
 decisionMaker:string;authority:number;urgency:number;budgetFit:number;repeatPotential:number;
 notes:string;transcript:string;source:string;meeting:string;
};
export type MapNode={id:string;title:string;detail:string;owner:string;kind:"trigger"|"action"|"decision"|"approval"|"output"};
export type Preference={impact:number;ease:number;readiness:number;risk:number;accepted:string[];rejected:string[];notes:string[]};
export type Suggestion={id:string;title:string;category:string;description:string;impact:number;ease:number;readiness:number;risk:number;score:number;reason:string;dependencies:string[];weeks:string};
export type EventItem={id:string;date:string;title:string;detail:string;kind:"meeting"|"decision"|"task"};
export const fmt=(v:number)=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(Number.isFinite(v)?v:0);
export const compact=(v:number)=>new Intl.NumberFormat("en-US",{notation:"compact",style:"currency",currency:"USD",maximumFractionDigits:1}).format(Number.isFinite(v)?v:0);
export const clamp=(v:number,lo:number,hi:number)=>Math.min(hi,Math.max(lo,v));
export const required:{key:keyof Case;label:string;why:string}[]=[
 {key:"company",label:"Client company",why:"Identify the assessment"},
 {key:"sector",label:"Industry",why:"Select sector controls"},
 {key:"process",label:"Business process",why:"Define the workflow scope"},
 {key:"owner",label:"Process owner",why:"Assign responsibility"},
 {key:"trigger",label:"Start event / trigger",why:"Identify the workflow entry"},
 {key:"inputs",label:"Information inputs",why:"Trace source evidence"},
 {key:"systems",label:"Applications / systems",why:"Assess integration feasibility"},
 {key:"steps",label:"As-is steps",why:"Build a defensible process map"},
 {key:"outputs",label:"Desired outputs",why:"Specify the outcome"},
 {key:"exceptions",label:"Exception / approval rules",why:"Retain human oversight"},
 {key:"objective",label:"Business objective",why:"Align recommendations"},
 {key:"weeklyVolume",label:"Weekly case volume",why:"Estimate automation impact"},
 {key:"minutes",label:"Handling minutes per case",why:"Estimate process effort"}
];
export const emptyCase=():Case=>({id:"custom-"+Date.now(),company:"",sector:"",employees:0,revenue:0,systems:"",process:"",owner:"",trigger:"",inputs:"",steps:"",outputs:"",exceptions:"",objective:"",weeklyVolume:0,minutes:0,hourlyCost:0,coverage:55,setup:0,infra:0,licences:0,staff:0,decisionMaker:"",authority:3,urgency:3,budgetFit:3,repeatPotential:3,notes:"",transcript:"",source:"Guided discovery",meeting:""});
export const samples:Case[]=[
 {id:"meridian",company:"Meridian Distribution",sector:"Distribution & wholesale",employees:125,revenue:24600000,systems:"Dynamics 365, SharePoint, Outlook and Excel",process:"Supplier invoice reconciliation and approval",owner:"Accounts Payable Manager",trigger:"Supplier sends invoice by email",inputs:"Supplier invoice PDFs, purchase orders in Dynamics, goods-receipt records",steps:"Register incoming invoice\nExtract invoice fields\nMatch to purchase order and delivery receipt\nFlag mismatch or duplicate\nObtain finance approval\nPost transaction and retain evidence",outputs:"Verified entry, exception log, approval record",exceptions:"Missing PO, invoice mismatch, duplicate or vendor change require human sign-off",objective:"Reduce invoice cycle time and prevent duplicate payments",weeklyVolume:210,minutes:18,hourlyCost:44,coverage:65,setup:38000,infra:300,licences:250,staff:0,decisionMaker:"CFO",authority:5,urgency:4,budgetFit:4,repeatPotential:5,notes:"Prefers pilot first. Exception approvals cannot be automatic.",meeting:"2026-11-19",source:"Example call transcript",transcript:"CONSULTANT: What is taking the most time?\nCFO: Supplier invoices. We process around 210 each week, 18 minutes per invoice. We use Dynamics, Excel and Outlook.\nCONSULTANT: What information is needed?\nCFO: PDF invoices, purchase orders and receipt confirmations.\nCONSULTANT: Who is responsible?\nCFO: The AP manager. Missing POs, duplicates and discrepancies need human approval.\nCONSULTANT: What outcome matters?\nCFO: Faster cycles, reduced duplicate payment risk and an audit trail."},
 {id:"lark",company:"Lark Hospitality Group",sector:"Hospitality",employees:76,revenue:8600000,systems:"PMS, Google Sheets, Gmail",process:"Guest inquiry triage and booking follow-ups",owner:"Head of Guest Operations",trigger:"Incoming website form or shared-inbox request",inputs:"Guest emails, booking records, property availability, approved FAQs",steps:"Receive guest enquiry\nClassify intent\nCheck availability\nDraft response\nEscalate sensitive requests\nLog booking follow-up",outputs:"Draft answer, qualified booking opportunity and exception queue",exceptions:"Refunds, complaints and exceptions to room pricing require supervisor review",objective:"Respond faster without weakening service quality",weeklyVolume:480,minutes:9,hourlyCost:30,coverage:45,setup:19500,infra:160,licences:220,staff:0,decisionMaker:"COO",authority:4,urgency:3,budgetFit:3,repeatPotential:5,notes:"Guest tone and reputational risk important.",meeting:"2026-11-18",source:"Example intake form",transcript:""},
 {id:"northstar",company:"Northstar Components",sector:"Manufacturing",employees:240,revenue:62500000,systems:"SAP, SQL Server, Power BI and CSV",process:"Demand planning and replenishment decisions",owner:"Supply Chain Director",trigger:"Weekly demand plan refresh",inputs:"SKU sales history, inventory by location, supplier lead times and purchase orders",steps:"Collect ERP data\nReconcile SKU and warehouse identifiers\nPrepare demand baseline\nReview lead times and constraints\nRecommend purchase quantities\nObtain purchasing approval",outputs:"Forecast, exception alerts and authorised replenishment plan",exceptions:"High-value purchases, stockouts and supplier disruptions need human approval",objective:"Reduce stockouts and excess inventory while preserving service levels",weeklyVolume:94,minutes:65,hourlyCost:56,coverage:50,setup:82000,infra:520,licences:700,staff:950,decisionMaker:"COO",authority:3,urgency:5,budgetFit:4,repeatPotential:4,notes:"Validate historical data and forecast accuracy before deployment.",meeting:"2026-11-17",source:"Example workshop",transcript:""}
];
export const preferenceDefault:Preference={impact:32,ease:25,readiness:25,risk:18,accepted:[],rejected:[],notes:[]};
export const missing=(d:Case)=>required.filter(f=>{const v=d[f.key];return typeof v==="number"?v<=0||!Number.isFinite(v):!String(v||"").trim()});
export const readinessPct=(d:Case)=>Math.round(100*(required.length-missing(d).length)/required.length);
export const defaultNodes=(d:Case):MapNode[]=>[
 {id:"trigger",title:d.trigger||"Trigger unknown",detail:"Entry event",owner:d.owner||"Owner required",kind:"trigger"},
 {id:"inputs",title:"Validate source information",detail:d.inputs||"Sources not yet identified",owner:d.owner||"Process team",kind:"action"},
 ...d.steps.split(/\n|;|→/).map(s=>s.trim()).filter(Boolean).slice(0,10).map((s,i):MapNode=>({id:"node-"+i,title:s,detail:"Derived from reviewed discovery",owner:d.owner||"Process team",kind:/review|check|match|verify|approv|escalat|reconcil/i.test(s)?"decision":"action"})),
 {id:"human",title:"Human review & exception gate",detail:d.exceptions||"Missing escalation rules",owner:d.owner||"Process owner",kind:"approval"},
 {id:"output",title:"Verified output",detail:d.outputs||"Output not defined",owner:d.owner||"Process team",kind:"output"}
];
/* A rule-based parser only recognises explicit labelled lines; all other information requires validation. */
export function parseText(text:string){
 const patch:Partial<Case>={transcript:text.slice(0,25000),source:"Uploaded discovery transcript"};
 const evidence:{field:string;quote:string}[]=[];
 const expressions:{field:keyof Case;regex:RegExp}[]=[
  {field:"company",regex:/(?:company|client|business)\s*:\s*([^\n]+)/i},
  {field:"sector",regex:/(?:industry|sector)\s*:\s*([^\n]+)/i},
  {field:"process",regex:/(?:process|workflow)\s*:\s*([^\n]+)/i},
  {field:"owner",regex:/(?:owner|process owner)\s*:\s*([^\n]+)/i},
  {field:"trigger",regex:/(?:trigger|starts when)\s*:\s*([^\n]+)/i},
  {field:"systems",regex:/(?:systems|tools|software)\s*:\s*([^\n]+)/i},
  {field:"inputs",regex:/(?:inputs|sources)\s*:\s*([^\n]+)/i},
  {field:"steps",regex:/(?:steps|current workflow)\s*:\s*([^\n]+)/i},
  {field:"outputs",regex:/(?:outputs|results)\s*:\s*([^\n]+)/i},
  {field:"exceptions",regex:/(?:exceptions|manual approvals)\s*:\s*([^\n]+)/i},
  {field:"objective",regex:/(?:objective|goal)\s*:\s*([^\n]+)/i}
 ];
 for(const x of expressions){const m=text.match(x.regex);if(m&&m[1].trim()){(patch as Record<string,unknown>)[x.field]=m[1].trim().slice(0,550);evidence.push({field:x.field,quote:m[0].slice(0,140)})}}
 const num:{field:keyof Case;regex:RegExp}[]=[
 {field:"employees",regex:/(?:employees|headcount)\s*:\s*([\d,]+)/i},
 {field:"revenue",regex:/(?:annual revenue|turnover)\s*:\s*\$?([\d,]+)/i},
 {field:"weeklyVolume",regex:/(?:weekly volume|cases per week)\s*:\s*([\d,]+)/i},
 {field:"minutes",regex:/(?:minutes per case|minutes per item)\s*:\s*([\d.]+)/i},
 {field:"hourlyCost",regex:/(?:hourly cost|loaded rate)\s*:\s*\$?([\d.]+)/i}
 ];
 for(const x of num){const m=text.match(x.regex);if(m){const n=Number(m[1].replace(/,/g,""));if(n>0&&Number.isFinite(n)){(patch as Record<string,unknown>)[x.field]=n;evidence.push({field:x.field,quote:m[0]})}}}
 const addObserved=(field:keyof Case,regex:RegExp,number=false)=>{
  if((patch as Record<string,unknown>)[field])return;
  const m=text.match(regex);if(!m)return;
  const raw=(m[1]||"").trim();if(!raw)return;
  if(number){const v=Number(raw.replace(/,/g,""));if(!Number.isFinite(v)||v<=0)return;(patch as Record<string,unknown>)[field]=v;}
  else (patch as Record<string,unknown>)[field]=raw.slice(0,360);
  evidence.push({field,quote:"From call: "+m[0].trim().slice(0,130)});
 };
 // Conversational patterns are only suggested when directly evidenced by wording.
 addObserved("weeklyVolume",/\b(?:process|handle|receive)\s+(?:around|roughly|about|approximately)?\s*([\d,]+)\s*(?:each|per|a)\s*week/i,true);
 addObserved("weeklyVolume",/\b([\d,]+)\s+(?:invoices|orders|requests|tickets|cases)\s+(?:each|per|a)\s+week\b/i,true);
 addObserved("minutes",/\b([\d.]+)\s+minutes?\s+(?:per|each|an)\s+(?:invoice|request|order|case|item)\b/i,true);
 addObserved("systems",/\b(?:we use|we work with|using)\s+([^.;\n]{4,110})/i);
 addObserved("owner",/\b(the\s+(?:AP|finance|operations|process|accounts payable)\s+manager)\b/i);
 addObserved("inputs",/\b(PDF invoices[^.\n]{0,110})/i);
 addObserved("exceptions",/\b(Missing [^.\n]{10,150}human approval)\b/i);
 return {patch,evidence};
}
export function recommendations(d:Case,p:Preference):Suggestion[]{
 const txt=(d.process+" "+d.objective+" "+d.sector+" "+d.systems).toLowerCase();
 const has=(...a:string[])=>a.some(s=>txt.includes(s));
 const large=d.weeklyVolume>150?1:0;
 const ts=[
  {id:"capture",title:"Document & intake automation",category:"Data intake",description:"Validate incoming requests, extract fields and request missing evidence.",impact:3+large,ease:5,readiness:d.inputs?5:2,risk:2,weeks:"2–4",reason:"Higher-volume intake can benefit from structured extraction.",dependencies:["Document schema","Sample accuracy checks","Privacy review"]},
  {id:"reconcile",title:"Cross-system reconciliation",category:"Data quality",description:"Compare source records, flag discrepancies and preserve traceable evidence.",impact:has("invoice","finance","reconcil","erp")?5:3,ease:4,readiness:d.systems?4:2,risk:3,weeks:"3–5",reason:"Multiple source systems introduce mapping and exception risks.",dependencies:["Source identifiers","Validation rules","Exception owner"]},
  {id:"orchestrate",title:"Approval workflow orchestration",category:"Operations",description:"Automate handoffs while reserving exceptions and approvals for people.",impact:5,ease:4,readiness:d.owner?4:2,risk:3,weeks:"4–6",reason:"Named process owners and repetitive steps support controlled orchestration.",dependencies:["Approval authority","Audit evidence","SLA thresholds"]},
  {id:"assistant",title:"Knowledge-assisted response drafting",category:"AI assistant",description:"Draft grounded responses from approved materials with human validation.",impact:has("guest","customer","enquiry","inquiry")?5:3,ease:3,readiness:3,risk:4,weeks:"4–7",reason:"Responses must be checked against an approved knowledge base.",dependencies:["Document ownership","Access permissions","Model evaluation"]},
  {id:"forecast",title:"Forecasting & scenario decisions",category:"Predictive analytics",description:"Estimate demand with confidence ranges and human-set decision constraints.",impact:has("demand","stock","planning","forecast")?5:3,ease:2,readiness:has("sap","sql")?4:2,risk:4,weeks:"6–10",reason:"Forecasts require adequate history, validation and operational constraints.",dependencies:["Historical data","Backtests","Decision rules"]},
  {id:"report",title:"Executive reporting & alerts",category:"Decision support",description:"Consolidate KPIs, monitoring and configurable executive summaries.",impact:4,ease:5,readiness:4,risk:2,weeks:"3–5",reason:"A governed reporting layer improves visibility into review outcomes.",dependencies:["KPI definitions","Refresh schedule","Distribution rights"]}
 ];
 return ts.map(x=>{
  const denom=Math.max(1,p.impact+p.ease+p.readiness+p.risk);
  const score=clamp(Math.round((x.impact*p.impact+x.ease*p.ease+x.readiness*p.readiness+(6-x.risk)*p.risk)/(5*denom)*100)+(p.accepted.includes(x.id)?8:0)-(p.rejected.includes(x.id)?23:0),0,100);
  return {...x,score};
 }).sort((a,b)=>b.score-a.score);
}
export type Economics={hoursWeek:number;hoursYear:number;annualGross:number;annualRun:number;initial:number;netYear:number;roi:number;payback:number|null;net3y:number};
export function economics(d:Case,coverage=d.coverage,initial=d.setup,staff=d.staff):Economics{
 const hoursWeek=d.weeklyVolume*d.minutes/60;
 const hoursYear=hoursWeek*52*clamp(coverage,0,95)/100*.8;
 const annualGross=hoursYear*d.hourlyCost;
 const annualRun=12*(d.infra+d.licences+staff);
 const netYear=annualGross-annualRun-initial;
 const monthly=annualGross/12-annualRun/12;
 return {hoursWeek,hoursYear,annualGross,annualRun,initial,netYear,roi:(initial+annualRun)>0?netYear/(initial+annualRun)*100:0,payback:monthly>0?initial/monthly:null,net3y:annualGross*3-annualRun*3-initial};
}
export function packages(d:Case){
 const baseline=Math.max(6500,d.setup||d.weeklyVolume*d.minutes/60*160);
 const a=Math.round(baseline*.55/500)*500,b=Math.round(baseline/500)*500;
 return [{id:"pilot",name:"Option A · Proof of Value",price:a,monthly:Math.round((d.infra+d.licences)*.65/25)*25,window:"4–6 weeks",scope:"One workflow; one system; human review; baseline KPIs."},{id:"scale",name:"Option B · Governed Rollout",price:Math.max(a*1.5,b),monthly:d.infra+d.licences+d.staff,window:"10–16 weeks",scope:"Multiple workflows; integrations; monitoring; adoption; governance."}];
}
export function prospect(d:Case){
 const size=clamp(Math.round(d.employees/55),1,5);
 const financial=clamp(Math.round(d.revenue/9500000),1,5);
 const score=clamp(Math.round((d.authority*.32+d.urgency*.26+d.budgetFit*.29+(size+financial)/2*.13)*20),10,95);
 const expansion=clamp(Math.round((d.repeatPotential*.55+size*.25+financial*.2)*20),10,95);
 return {score,expansion,potential:Math.round((d.setup||15000)*(1+d.repeatPotential*.13))};
}
export function plan(mode:"pilot"|"scale"="pilot"){
 return [
 {id:"01",name:"Discovery and permissions",weeks:"1–2",owner:"Consultant / client sponsor",output:"Approved scope, NDA, data contracts"},
 {id:"02",name:"Workflow and controls",weeks:"2–3",owner:"Process owner / architect",output:"Signed-off workflow map and acceptance criteria"},
 {id:"03",name:"Implementation and integration",weeks:mode==="pilot"?"3–5":"3–8",owner:"Technical delivery partner",output:"Validated workflow, trace and review queue"},
 {id:"04",name:"UAT and quality gates",weeks:mode==="pilot"?"5–6":"8–11",owner:"Client reviewer / QA",output:"Benchmark, exception tests, UAT approval"},
 {id:"05",name:mode==="pilot"?"Pilot decision":"Rollout and adoption",weeks:mode==="pilot"?"6":"11–16",owner:"Client management",output:mode==="pilot"?"Go / no-go decision":"Training, monitoring and handover"}
 ];
}
export function ndaText(a:string,b:string,purpose:string,law:string){
 return "MUTUAL NON-DISCLOSURE AGREEMENT — UNREVIEWED EXAMPLE\n\nParties: "+(a||"[Consultancy legal name]")+" and "+(b||"[Client legal name]")+"\nPurpose: "+(purpose||"[Assessment purpose]")+"\nEffective date: [TO BE AGREED]\n\n1. Confidential information means information identified as confidential or reasonably understood as such in context.\n2. Use is limited to the stated purpose and need-to-know authorised personnel under equivalent confidentiality duties.\n3. Exclusions: public, previously lawfully known, independently developed or lawfully obtained from a third party.\n4. Protect disclosures using commercially reasonable controls and agreed retention periods.\n5. If legally compelled to disclose, give lawful notice and minimise disclosure.\n6. Return or delete material at the end of discussions, subject to legal retention obligations.\n7. IP, licences, non-solicitation, liability and confidentiality survival: [PARTIES TO AGREE].\n8. Governing law: "+(law||"[To be agreed]")+".\n9. Personal data, AI subprocessors, consent and transfers require a separate data-protection assessment and appropriate agreement.\n\nParty A signature: ___________________\nParty B signature: ___________________\n\nILLUSTRATIVE DRAFT ONLY — NOT FOR SIGNATURE WITHOUT LEGAL COUNSEL AND COMPLETING ALL TERMS.";
}
