"use client";

import {useEffect,useMemo,useRef,useState} from "react";
import {
 Activity,ArrowDown,ArrowLeft,ArrowRight,BarChart3,Bot,BriefcaseBusiness,CalendarDays,Check,
 CheckCircle2,ChevronDown,ChevronRight,CircleAlert,ClipboardCheck,Clock3,Cloud,Database,Download,
 FileCheck2,FileDown,FileText,FileUp,FolderOpen,GitBranch,LayoutDashboard,LockKeyhole,Menu,
 MessageCircle,Plus,Printer,RefreshCw,Save,Search,Send,Settings2,ShieldCheck,SlidersHorizontal,
 Sparkles,Trash2,TrendingUp,Upload,Users,Workflow,X
} from "lucide-react";
import {
 type Case,type Module,type MapNode,type Preference,type Suggestion,type EventItem,
 samples,emptyCase,preferenceDefault,required,missing,readinessPct,defaultNodes,parseText,
 recommendations,economics,packages,prospect,plan,ndaText,fmt,compact,clamp
} from "./engine";
import css from "./assessment.module.css";

const sections:{name:string;items:{id:Module;name:string;icon:typeof LayoutDashboard}[]}[]=[
 {name:"WORKSPACE",items:[{id:"overview",name:"Command center",icon:LayoutDashboard},{id:"discovery",name:"Discovery & intake",icon:FileUp},{id:"mapping",name:"Process mapping",icon:Workflow}]},
 {name:"INTELLIGENCE",items:[{id:"assessment",name:"AI opportunities",icon:Sparkles},{id:"commercial",name:"Proposal architect",icon:BriefcaseBusiness},{id:"roi",name:"ROI & economics",icon:BarChart3},{id:"roadmap",name:"Implementation roadmap",icon:GitBranch},{id:"pipeline",name:"Portfolio intelligence",icon:TrendingUp}]},
 {name:"OPERATIONS",items:[{id:"governance",name:"NDA & governance",icon:ShieldCheck},{id:"integrations",name:"Connected ecosystem",icon:Cloud},{id:"agents",name:"Agent workspace",icon:Bot},{id:"deliverables",name:"Client deliverables",icon:FileText}]}
];
const riskChecks=["Data ownership and source permissions","Human approval for consequential decisions","Vendor / AI subprocessors reviewed","Retention and deletion policy","Authenticated role-based access","Logging and decision traceability","Customer acceptance criteria","Recovery and incident response"];
const connectors=[
 {name:"Microsoft 365 / Outlook",kind:"Call notes, inbox and document intake",icon:"mail",domain:"Discovery"},
 {name:"Google Drive / SharePoint",kind:"Governed document evidence and templates",icon:"drive",domain:"Knowledge"},
 {name:"Google Calendar / Calendly",kind:"Meeting slots, reminders and follow-ups",icon:"calendar",domain:"Meetings"},
 {name:"HubSpot / Salesforce",kind:"Qualified leads, pipeline and proposals",icon:"crm",domain:"Commercial"},
 {name:"ERP / Accounting",kind:"Financial transactions and operational records",icon:"erp",domain:"Operations"},
 {name:"Supabase / PostgreSQL",kind:"Cases, roles, audits and tenant data",icon:"db",domain:"Data"},
 {name:"n8n / API integrations",kind:"Task orchestration and approval workflows",icon:"workflow",domain:"Automation"},
 {name:"LLM and evaluation layer",kind:"Document-grounded assistance with guardrails",icon:"ai",domain:"Intelligence"}
];
type AgentKind="Discovery"|"Process Mapper"|"Automation Advisor"|"Commercial Strategist"|"ROI Analyst"|"Delivery Planner"|"Governance Advisor";
const agentProfiles:{id:AgentKind;subtitle:string;question:string}[]=[
 {id:"Discovery",subtitle:"Evidence extraction & follow-up questions",question:"What information is missing before mapping?"},
 {id:"Process Mapper",subtitle:"As-is stages, owners and exceptions",question:"Explain the critical human approval gate"},
 {id:"Automation Advisor",subtitle:"Opportunity scoring and prioritisation",question:"Which automation should be piloted first?"},
 {id:"Commercial Strategist",subtitle:"Proposal packaging and adoption barriers",question:"Why offer two delivery options?"},
 {id:"ROI Analyst",subtitle:"Sensitivity, infrastructure and staffing",question:"Explain the ROI calculation and assumptions"},
 {id:"Delivery Planner",subtitle:"Phasing, capacity and dependencies",question:"What should happen in the first two weeks?"},
 {id:"Governance Advisor",subtitle:"NDA, permissions and data access",question:"What security controls are required?"}
];
type Chat={agent:AgentKind;from:"user"|"agent";text:string};
type Saved={cases:Case[];selectedId:string;maps:Record<string,MapNode[]>;prefs:Preference;brand:string;events:EventItem[];checks:string[]};
const key="sc-kenny-assessment-demo-v2";
const reportDefaults=["Executive summary","Discovery evidence","Workflow map","Priority opportunities","Delivery options","ROI and sensitivities","Implementation roadmap","Security and approvals"];
const numeric:Partial<Record<keyof Case,string>>={employees:"Number of employees",revenue:"Annual revenue (USD)",weeklyVolume:"Items per week",minutes:"Minutes per item",hourlyCost:"Loaded hourly cost (USD)",setup:"Modelled implementation cost (USD)",infra:"Monthly infrastructure (USD)",licences:"Monthly software / API licences (USD)",staff:"Additional staffing per month (USD)"};
const intakeGroups:{name:string;fields:(keyof Case)[]}[]=[
 {name:"Organisation & opportunity",fields:["company","sector","employees","revenue","decisionMaker","objective"]},
 {name:"Operational discovery",fields:["process","owner","trigger","inputs","systems","steps","outputs","exceptions"]},
 {name:"Baseline for ROI",fields:["weeklyVolume","minutes","hourlyCost","setup","infra","licences","staff"]},
 {name:"Commercial qualification",fields:["notes","meeting"]}
];
const labels:Partial<Record<keyof Case,string>>={
 company:"Company name",sector:"Industry / sector",decisionMaker:"Decision maker",objective:"What outcome should improve?",
 process:"Process being assessed",owner:"Process owner",trigger:"What starts the process?",inputs:"What information does it need?",
 systems:"Systems used today",steps:"Current workflow steps (one per line)",outputs:"What should the process produce?",exceptions:"What goes wrong / requires approval?",
 notes:"Other discovery notes",meeting:"Meeting date"
};
const longFields=new Set<keyof Case>(["objective","steps","inputs","systems","outputs","exceptions","notes"]);
const fieldHint:Partial<Record<keyof Case,string>>={
 steps:"Example: receive request; validate information; send for review; publish output",
 exceptions:"Identify exceptions that must remain with a human",
 objective:"Include an observable business outcome, not only an AI feature"
};
const initialEvents:EventItem[]=[{id:"evt-0",date:"2026-11-19",title:"Illustrative discovery call",detail:"Example company; follow-up items and approvals require client confirmation.",kind:"meeting"}];
const join=(x:string[])=>x.length?x.join("; "):"None";
function getChatAnswer(agent:AgentKind,q:string,d:Case,pref:Preference,map:MapNode[],opp:Suggestion[]):string{
 const text=q.toLowerCase(),miss=missing(d);
 if(/missing|complete|information|question|transcript|data needed/.test(text)||agent==="Discovery"){
  return miss.length?"The discovery cannot be mapped yet. Please confirm: "+miss.slice(0,7).map(x=>x.label.toLowerCase()).join("; ")+". I will not invent missing interview facts.":"The mandatory discovery fields are complete. Verify the interview statements, source ownership, exceptions and expected outputs before approving the map.";
 }
 if(/process|workflow|hand.?off|mapping|approval/.test(text)||agent==="Process Mapper"){
  return "The current-state map contains "+map.length+" stages. It starts when '"+(d.trigger||"an unknown trigger")+"' and ends with '"+(d.outputs||"an undefined outcome")+"'. Human-review condition: "+(d.exceptions||"not documented")+". Edit or reorder nodes in Process mapping; decisions remain under reviewer control.";
 }
 if(/priorit|automati|pilot|opportunit/.test(text)||agent==="Automation Advisor"){
  const first=opp[0];return first?first.title+" is ranked first ("+first.score+"/100 under the current editable methodology). Rationale: "+first.reason+" Before implementing it, validate "+join(first.dependencies)+". This is a rules-based recommendation, not a trained prediction.":"Complete discovery before prioritisation.";
 }
 if(/roi|return|savings|staff|cost|expense|financial/.test(text)||agent==="ROI Analyst"){
  const e=economics(d);return "Illustrative baseline: "+e.hoursWeek.toFixed(1)+" hours/week; modelled annual labour capacity "+fmt(e.annualGross)+", yearly platform and staffing costs "+fmt(e.annualRun)+", implementation "+fmt(e.initial)+", and first-year net "+fmt(e.netYear)+". Assumes 80% of nominal freed time is realised. This does not prove cash savings or headcount reduction.";
 }
 if(/price|package|budget|proposal|commercial|two options|conversion/.test(text)||agent==="Commercial Strategist"){
  const x=packages(d);return "Two client-facing solution packages address budget and risk: "+x[0].name+" ("+fmt(x[0].price)+") and "+x[1].name+" ("+fmt(x[1].price)+"). These are fictitious project estimates for this example client's automation — not a quotation for building this consulting toolkit.";
 }
 if(/security|nda|privacy|legal|access|gdpr|role/.test(text)||agent==="Governance Advisor"){
  return "Prepare a reviewed mutual NDA, classify interview recordings and personal data, set retention/deletion terms, verify access permissions, review third-party AI subprocessors, and enforce per-tenant authorisation on a real backend. The draft NDA here is not signature-ready.";
 }
 if(/roadmap|timeline|implement|deliver|first two weeks/.test(text)||agent==="Delivery Planner"){
  return "Phase 1 is discovery and access (weeks 1–2), followed by signed-off workflow controls, pilot implementation, UAT, and a go/no-go decision. The project plan depends on operational capacity, the availability of "+(d.owner||"the owner")+" and approved data access.";
 }
 return "I can explain the process map, opportunity scores, indicative financial model, delivery options, governance and roadmap using this case. These answers use local deterministic logic. A production assistant would use a verified company knowledge base and human approvals.";
}
function downloadFile(name:string,text:string,mime="text/plain;charset=utf-8"){
 const blob=new Blob([text],{type:mime});
 const url=URL.createObjectURL(blob);
 const a=document.createElement("a");a.href=url;a.download=name;a.click();
 window.setTimeout(()=>URL.revokeObjectURL(url),2000);
}
export default function AssessmentDemo(){
 const [module,setModule]=useState<Module>("overview");
 const [cases,setCases]=useState<Case[]>(samples);
 const [selectedId,setSelectedId]=useState(samples[0].id);
 const [maps,setMaps]=useState<Record<string,MapNode[]>>({});
 const [prefs,setPrefs]=useState<Preference>(preferenceDefault);
 const [brand,setBrand]=useState("Your Consultancy");
 const [events,setEvents]=useState<EventItem[]>(initialEvents);
 const [checks,setChecks]=useState<string[]>([]);
 const [loaded,setLoaded]=useState(false);
 const [mobile,setMobile]=useState(false);
 const [notice,setNotice]=useState("");
 const [entryMode,setEntryMode]=useState<"transcript"|"form">("transcript");
 const [raw,setRaw]=useState("");
 const [fileName,setFileName]=useState("");
 const [evidence,setEvidence]=useState<{field:string;quote:string}[]>([]);
 const [extracted,setExtracted]=useState<Partial<Case>|null>(null);
 const [uploading,setUploading]=useState(false);
 const [selectedOpp,setSelectedOpp]=useState("orchestrate");
 const [coverage,setCoverage]=useState<number|null>(null);
 const [pilotMode,setPilotMode]=useState<"pilot"|"scale">("pilot");
 const [capacity,setCapacity]=useState(2);
 const [sort,setSort]=useState<"conversion"|"expansion"|"potential">("conversion");
 const [reportSections,setReportSections]=useState<string[]>(reportDefaults);
 const [ndaA,setNdaA]=useState("Your Consultancy LLC");
 const [ndaLaw,setNdaLaw]=useState("To be agreed");
 const [connected,setConnected]=useState<string[]>(["Google Drive / SharePoint"]);
 const [agent,setAgent]=useState<AgentKind>("Discovery");
 const [chat,setChat]=useState<Chat[]>([]);
 const [question,setQuestion]=useState("");
 const [actionTitle,setActionTitle]=useState("");
 const [actionDetail,setActionDetail]=useState("");
 const [feedbackText,setFeedbackText]=useState("");
 const [stepDraft,setStepDraft]=useState("");
 const [revision,setRevision]=useState<string|null>(null);
 const [traceExpanded,setTraceExpanded]=useState(false);
 const fileInput=useRef<HTMLInputElement|null>(null);
 useEffect(()=>{try{
  const t=localStorage.getItem(key);if(t){
   const s=JSON.parse(t) as Partial<Saved>;
   if(Array.isArray(s.cases)&&s.cases.length)setCases(s.cases);
   if(s.selectedId)setSelectedId(s.selectedId);
   if(s.maps)setMaps(s.maps);
   if(s.prefs)setPrefs(s.prefs);
   if(s.brand)setBrand(s.brand);
   if(s.events)setEvents(s.events);
   if(s.checks)setChecks(s.checks);
  }
 }catch{}setLoaded(true)},[]);
 useEffect(()=>{if(!loaded)return;try{localStorage.setItem(key,JSON.stringify({cases,selectedId,maps,prefs,brand,events,checks}));}catch{setNotice("Local browser storage is full. Download the case JSON to keep your work.")}},[loaded,cases,selectedId,maps,prefs,brand,events,checks]);
 const d=cases.find(c=>c.id===selectedId)||cases[0];
 const absent=useMemo(()=>missing(d),[d]);
 const ready=absent.length===0;
 const nodes=maps[d.id]||defaultNodes(d);
 const opportunity=useMemo(()=>recommendations(d,prefs),[d,prefs]);
 const offer=packages(d),econ=economics(d,coverage===null?d.coverage:coverage);
 const quality=readinessPct(d);
 const lead=prospect(d);
 const selected=opportunity.find(x=>x.id===selectedOpp)||opportunity[0];
 const results=useMemo(()=>[...cases].sort((a,b)=>prospect(b)[sort==="conversion"?"score":sort==="expansion"?"expansion":"potential"]-prospect(a)[sort==="conversion"?"score":sort==="expansion"?"expansion":"potential"]),[cases,sort]);
 const progress=[
  {name:"Discovery",status:quality===100?"Ready":"Missing data",done:quality===100,module:"discovery" as Module},
  {name:"Workflow map",status:ready?"Ready for approval":"Blocked",done:ready,module:"mapping" as Module},
  {name:"Assessment",status:ready?"Scored":"Awaiting intake",done:ready,module:"assessment" as Module},
  {name:"Commercial",status:"Two options",done:true,module:"commercial" as Module},
  {name:"Delivery plan",status:"Review required",done:false,module:"roadmap" as Module}
 ];
 const update=(patch:Partial<Case>)=>setCases(prev=>prev.map(c=>c.id===d.id?{...c,...patch}:c));
 const updateNodes=(items:MapNode[])=>setMaps(prev=>({...prev,[d.id]:items}));
 const announce=(message:string)=>{setNotice(message);};
 function navigate(next:Module){setModule(next);setMobile(false);setNotice("");}
 function newCase(){const x=emptyCase();setCases(c=>[...c,x]);setSelectedId(x.id);setModule("discovery");setRaw("");setExtracted(null);announce("Blank client workspace created. Complete the intake before mapping.");}
 function reset(){if(!window.confirm("Reset this fictional demo and discard local changes?"))return;setCases(samples);setSelectedId(samples[0].id);setMaps({});setPrefs(preferenceDefault);setBrand("Your Consultancy");setEvents(initialEvents);setChecks([]);setModule("overview");setRaw("");setExtracted(null);announce("Restored the demonstration examples.");}
 async function loadFile(file:File|null){
  if(!file)return;
  if(file.size>3*1024*1024){announce("For this static demo, upload files smaller than 3 MB.");return;}
  setUploading(true);setEvidence([]);setExtracted(null);
  try{
   const ext=(file.name.split(".").pop()||"").toLowerCase();
   let text="";
   if(ext==="docx"){const mammoth=await import("mammoth");const output=await mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()});text=output.value;}
   else if(ext==="pdf"){
    const pdfjs=await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc=new URL("pdfjs-dist/build/pdf.worker.min.mjs",import.meta.url).toString();
    const document=await pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer()),isEvalSupported:false}).promise;
    const pages:string[]=[];
    for(let i=1;i<=Math.min(document.numPages,30);i++){const page=await document.getPage(i);const items=await page.getTextContent();pages.push(items.items.map(it=>"str" in it?it.str:"").join(" "));}
    text=pages.join("\n");
   }else if(["txt","md","vtt","srt","csv","json"].includes(ext)){text=await file.text();}
   else throw Error("Supported: TXT, MD, VTT, SRT, CSV, JSON, DOCX and text-based PDF.");
   if(!text.trim())throw Error("No readable text found. Scanned-image PDFs need OCR, which is not part of this demo.");
   setRaw(text.slice(0,25000));setFileName(file.name);
   const extracted=parseText(text);
   setExtracted(extracted.patch);setEvidence(extracted.evidence);
   announce("Processed locally. Check every extracted field before applying it; unlabelled facts are not guessed.");
  }catch(e){announce(e instanceof Error?e.message:"Unable to process this file.");}
  finally{setUploading(false);}
 }
 function analyseRaw(){if(!raw.trim()){announce("Paste the call transcript or upload a file.");return;}const v=parseText(raw);setExtracted(v.patch);setEvidence(v.evidence);announce("Explicitly labelled fields extracted. Confirm before applying them.");}
 function applyExtracted(){if(!extracted)return;update({...extracted,source:fileName||"Pasted discovery transcript"});setExtracted(null);announce("Reviewed extraction added to this case. Complete any missing fields using the questionnaire.");}
 function setNode(id:string,patch:Partial<MapNode>){updateNodes(nodes.map(n=>n.id===id?{...n,...patch}:n));}
 function addNode(){const txt=stepDraft.trim();if(!txt){announce("Describe the step first.");return;}updateNodes([...nodes.slice(0,-1),{id:"manual-"+Date.now(),title:txt,detail:"Added with consultant review",owner:d.owner||"Process owner",kind:"action"},nodes[nodes.length-1]]);setStepDraft("");setPrefs(p=>({...p,notes:[...p.notes,"Added workflow step for "+d.company+": "+txt]}));announce("Stage added to the as-is map and noted as consultant feedback.");}
 function moveNode(i:number,delta:number){const dest=i+delta;if(dest<0||dest>=nodes.length)return;const next=[...nodes];[next[i],next[dest]]=[next[dest],next[i]];updateNodes(next);}
 function vote(s:Suggestion,accept:boolean){setPrefs(p=>({...p,accepted:accept?[...new Set([...p.accepted,s.id])]:p.accepted.filter(x=>x!==s.id),rejected:accept?p.rejected.filter(x=>x!==s.id):[...new Set([...p.rejected,s.id])],notes:feedbackText.trim()?[...p.notes,s.title+": "+feedbackText.trim()]:p.notes}));setFeedbackText("");announce("Methodology feedback saved locally; the opportunity ranking has been recomputed.");}
 function logEvent(){if(!actionTitle.trim())return;setEvents(x=>[{id:"event-"+Date.now(),date:new Date().toISOString().slice(0,10),title:actionTitle.trim(),detail:actionDetail.trim(),kind:"task"},...x]);setActionTitle("");setActionDetail("");announce("Action recorded for this demonstration.");}
 function ask(text?:string){const q=(text||question).trim();if(!q)return;const answer=getChatAnswer(agent,q,d,prefs,nodes,opportunity);setChat(prev=>[...prev,{agent,from:"user",text:q},{agent,from:"agent",text:answer}]);setQuestion("");}
 function exportJson(){downloadFile("assessment-"+(d.company||"client").toLowerCase().replace(/[^a-z0-9]+/g,"-")+".json",JSON.stringify({client:d,map:nodes,preferences:prefs,opportunities:opportunity,roi:econ,roadmap:plan(pilotMode),events},null,2),"application/json");}
 function exportNda(){downloadFile("mutual-nda-example.txt",ndaText(ndaA,d.company,d.process,ndaLaw));}
 function printPack(){navigate("deliverables");window.setTimeout(()=>window.print(),250);}
 const label=(field:keyof Case)=>numeric[field]||labels[field]||String(field);
 const input=(field:keyof Case)=>{
  const value=d[field];const t=typeof value==="number";const multi=longFields.has(field);
  return <label className={css.field} key={field}><span>{label(field)}{required.some(x=>x.key===field)&&<sup>*</sup>}</span>{multi?<textarea rows={field==="steps"?5:2} value={String(value)} placeholder={fieldHint[field]||""} onChange={e=>update({[field]:e.target.value})}/>:<input type={t?"number":"text"} min={t?0:undefined} step={t?"any":undefined} value={value} onChange={e=>update({[field]:t?Number(e.target.value):e.target.value})}/>}</label>
 };
 const header=(eyebrow:string,title:string,description:string,buttons?:React.ReactNode)=><div className={css.pageHeading}><div><p className={css.eyebrow}>{eyebrow}</p><h1>{title}</h1><p>{description}</p></div>{buttons&&<div className={css.headingActions}>{buttons}</div>}</div>;
 const tip=(text:string)=><div className={css.note}><CircleAlert size={15}/><span>{text}</span></div>;
 const btn=(name:string,fn:()=>void,style:"primary"|"secondary"|"ghost"="secondary")=><button className={style==="primary"?css.primary:style==="ghost"?css.ghost:css.secondary} onClick={fn} type="button">{name}<ArrowRight size={15}/></button>;
 let content:React.ReactNode=null;
 if(module==="overview")content=<>
  <div className={css.hero}><div><p className={css.eyebrow}>CONSULTING INTELLIGENCE / CLIENT WORKSPACE</p><h1>From first conversation to a confident decision.</h1><p>One accountable workflow for discovery, process mapping, AI opportunity analysis, economics, commercial options and delivery.</p><div className={css.heroActions}>{btn("Continue assessment",()=>navigate(quality<100?"discovery":"mapping"),"primary")}{btn("Open assessment report",()=>navigate("deliverables"))}</div><small>Designed as a white-label demonstration · Fictitious cases · No external AI connections</small></div><div className={css.heroAside}><span>ACTIVE OPPORTUNITY</span><strong>{d.company||"New client assessment"}</strong><div className={css.heroNumber}>{quality}<small>% discovery complete</small></div><div className={css.progress}><i style={{width:quality+"%"}}/></div><p>{absent.length?absent.length+" essential inputs remain unresolved.":"Minimum information is ready for process mapping."}</p></div></div>
  <div className={css.metrics}><div><small>Discovery readiness</small><strong>{quality}%</strong><span>{absent.length} unanswered mandatory fields</span></div><div><small>Candidate opportunities</small><strong>{ready?opportunity.length:"—"}</strong><span>Methodology-weighted priorities</span></div><div><small>Illustrative annual potential</small><strong>{compact(econ.annualGross)}</strong><span>Before ongoing costs and implementation</span></div><div><small>Commercial fit score</small><strong>{lead.score}/100</strong><span>Uncalibrated decision-support heuristic</span></div></div>
  <div className={css.twoColumns}><section className={css.panel}><div className={css.panelHeading}><div><p className={css.eyebrow}>ASSESSMENT PIPELINE</p><h2>Case progression</h2></div><span className={css.muted}>Five decision gates</span></div><div className={css.progressList}>{progress.map((x,i)=><button key={x.name} onClick={()=>navigate(x.module)}><span className={x.done?css.stageDone:css.stageNum}>{String(i+1).padStart(2,"0")}</span><div><strong>{x.name}</strong><small>{x.status}</small></div><ChevronRight size={17}/></button>)}</div></section>
   <section className={css.panel}><div className={css.panelHeading}><div><p className={css.eyebrow}>CONSULTANT NEXT ACTION</p><h2>{ready?"Validate the as-is process":"Resolve information gaps first"}</h2></div><ClipboardCheck size={20}/></div>{ready?<><p className={css.prose}>All mandatory intake fields are present. Review the map with {d.owner||"the process owner"} and confirm decisions, approvals and exception routes before recommending automation.</p>{btn("Review current workflow",()=>navigate("mapping"),"primary")}</>:<><p className={css.prose}>This workflow does not invent missing client information. Resolve the following questions before producing a decision-ready map.</p><div className={css.missingList}>{absent.slice(0,5).map(x=><div key={x.key}><CircleAlert size={14}/><span>{x.label}</span></div>)}</div>{btn("Complete guided discovery",()=>navigate("discovery"),"primary")}</>}</section></div>
  <section className={css.panel}><div className={css.panelHeading}><div><p className={css.eyebrow}>CONNECTED METHODOLOGY</p><h2>What the consultancy can deliver</h2></div><span className={css.muted}>One case · multiple disciplines</span></div><div className={css.capabilityGrid}>{[{icon:FileText,title:"Evidence-led discovery",desc:"Transcripts, questionnaire, source notes and missing-information gate",go:"discovery"},{icon:Workflow,title:"Editable workflow maps",desc:"Owners, decisions, handoffs, approvals and consultant feedback",go:"mapping"},{icon:Sparkles,title:"Prioritised use cases",desc:"Explainable recommendations with methodology controls",go:"assessment"},{icon:BriefcaseBusiness,title:"Two commercial pathways",desc:"Fit, adoption barriers and scoped customer proposals",go:"commercial"},{icon:BarChart3,title:"Transparent ROI models",desc:"Hours, infrastructure, staffing, payback and sensitivities",go:"roi"},{icon:Cloud,title:"Governed ecosystem",desc:"NDA, CRM, calendar, files, databases and approved AI agents",go:"integrations"}].map(x=>{const Icon=x.icon;return <button key={x.title} onClick={()=>navigate(x.go as Module)}><Icon size={20}/><strong>{x.title}</strong><small>{x.desc}</small><ArrowRight size={15}/></button>})}</div></section>
 </>;
 if(module==="discovery")content=<>
  {header("01 / CAPTURE & CLARIFY","Every good recommendation begins with the right questions.","Start from a meeting transcript or a guided consultation form. The platform highlights what is missing instead of filling gaps with guesses.",btn("Review process map",()=>navigate("mapping"),"primary"))}
  <div className={css.twoColumns}><section className={css.panel}><div className={css.panelHeading}><div><p className={css.eyebrow}>INPUT METHODS</p><h2>Discovery source</h2></div><span className={css.muted}>Browser-only processing</span></div><div className={css.segmented}><button className={entryMode==="transcript"?css.segmentActive:""} onClick={()=>setEntryMode("transcript")}>Transcript / file</button><button className={entryMode==="form"?css.segmentActive:""} onClick={()=>setEntryMode("form")}>Guided questionnaire</button></div>{entryMode==="transcript"?<>
   <button className={css.uploadZone} onClick={()=>fileInput.current?.click()}><Upload size={24}/><strong>{uploading?"Reading document…":fileName||"Drop in your meeting notes or transcript"}</strong><small>TXT, MD, VTT, SRT, CSV, JSON, DOCX or text-based PDF · up to 3 MB</small></button><input ref={fileInput} type="file" accept=".txt,.md,.vtt,.srt,.csv,.json,.docx,.pdf" hidden onChange={e=>loadFile(e.target.files?.[0]||null)}/><label className={css.field}><span>Or paste the interview text</span><textarea rows={9} value={raw} onChange={e=>setRaw(e.target.value)} placeholder={"Consultant: How does this process work?\nClient: ...\n\nFor exact field extraction, include labelled lines such as Company:, Process:, Inputs:, Steps:, Objective:."}/></label><button className={css.primary} onClick={analyseRaw}><Search size={15}/> Analyse stated information</button>
   {extracted&&<div className={css.extracted}><div className={css.panelHeading}><div><p className={css.eyebrow}>REVIEW BEFORE APPLYING</p><h3>{evidence.length} explicitly detected fields</h3></div><span className={css.muted}>No inferred facts</span></div>{evidence.length?evidence.map(x=><div key={x.field}><strong>{x.field}</strong><small>{x.quote}</small></div>):<p className={css.muted}>No reliably labelled fields identified. The transcript remains available; complete the questionnaire to structure the facts.</p>}<button className={css.primary} onClick={applyExtracted}><Check size={15}/> Apply reviewed extraction</button></div>}
  </>:<><p className={css.prose}>The questionnaire below gathers information needed for an auditable process map, prioritisation and economic case. Select a client and edit any value in place.</p><button className={css.secondary} onClick={()=>document.getElementById("assessment-questionnaire")?.scrollIntoView({behavior:"smooth"})}>Go to questions <ArrowDown size={15}/></button></>}
  {tip("Only test or fictional content should be uploaded to this public demonstration. Files are analysed in the browser, but edited case details may remain in local browser storage.")}
  </section><section className={css.panel}><div className={css.panelHeading}><div><p className={css.eyebrow}>COMPLETENESS GATE</p><h2>What the process agent needs</h2></div><span className={ready?css.statusGood:css.statusWarn}>{quality}% ready</span></div><div className={css.progress}><i style={{width:quality+"%"}}/></div><div className={css.requirements}>{required.map(x=><div key={x.key}><span className={absent.some(z=>z.key===x.key)?css.unchecked:css.checked}>{absent.some(z=>z.key===x.key)?"!":"✓"}</span><div><strong>{x.label}</strong><small>{x.why}</small></div></div>)}</div>{ready?<div className={css.success}><CheckCircle2 size={17}/> Mapping is unlocked. Confirm source accuracy with the client.</div>:<div className={css.warning}><CircleAlert size={17}/> {absent.length} inputs still need confirmation; recommendations should not be treated as approved.</div>}</section></div>
  <section className={css.panel} id="assessment-questionnaire"><div className={css.panelHeading}><div><p className={css.eyebrow}>STRUCTURED INTERVIEW</p><h2>Editable discovery record</h2></div><span className={css.muted}>Autosaved in this browser</span></div>{intakeGroups.map(g=><div className={css.formGroup} key={g.name}><h3>{g.name}</h3><div className={css.formGrid}>{g.fields.map(input)}</div></div>)}<div className={css.actions}>{btn("Review workflow mapping",()=>navigate("mapping"),"primary")}{btn("Export assessment JSON",exportJson)}</div></section>
 </>;
 if(module==="mapping")content=<>
  {header("02 / WORKFLOW MAPPING","Understand the work before automating it.","Build the current-state process from verified discovery information. Reorder stages, add human checks and capture your client's corrections.",btn("Score opportunities",()=>navigate("assessment"),"primary"))}
  {!ready?<section className={css.blocker}><LockKeyhole size={28}/><div><h2>Workflow map requires verified inputs</h2><p>We still need {absent.length} facts, including {absent.slice(0,4).map(x=>x.label.toLowerCase()).join(", ")}. The process agent will not manufacture missing information.</p>{btn("Return to discovery",()=>navigate("discovery"),"primary")}</div></section>:<>
   <div className={css.twoColumnsWide}><section className={css.panel}><div className={css.panelHeading}><div><p className={css.eyebrow}>AS-IS PROCESS · EDITABLE</p><h2>{d.process}</h2></div><span className={css.muted}>{nodes.length} stages</span></div><div className={css.mapFlow}>{nodes.map((n,i)=><div className={css.mapNode} key={n.id}><div className={css.nodeCounter}><span>{String(i+1).padStart(2,"0")}</span>{i<nodes.length-1&&<i/>}</div><div className={css.nodeBody}><div className={css.nodeTop}><span className={css.nodeKind}>{n.kind.toUpperCase()}</span><div><button title="Move up" disabled={i===0} onClick={()=>moveNode(i,-1)}>↑</button><button title="Move down" disabled={i===nodes.length-1} onClick={()=>moveNode(i,1)}>↓</button><button title="Remove stage" disabled={n.id==="trigger"||n.id==="output"} onClick={()=>updateNodes(nodes.filter(x=>x.id!==n.id))}><X size={14}/></button></div></div><input aria-label={"Stage "+(i+1)} value={n.title} onChange={e=>setNode(n.id,{title:e.target.value})}/><textarea aria-label={"Details for "+n.title} rows={2} value={n.detail} onChange={e=>setNode(n.id,{detail:e.target.value})}/><div className={css.nodeFoot}><label>Owner <input value={n.owner} onChange={e=>setNode(n.id,{owner:e.target.value})}/></label><select aria-label="Stage kind" value={n.kind} onChange={e=>setNode(n.id,{kind:e.target.value as MapNode["kind"]})}><option value="trigger">Trigger</option><option value="action">Action</option><option value="decision">Decision</option><option value="approval">Human approval</option><option value="output">Output</option></select></div></div></div>)}</div></section>
   <aside className={css.stickyColumn}><section className={css.panel}><p className={css.eyebrow}>PROCESS MAPPER / GUIDED SUGGESTION</p><h2>Keep a human exception route</h2><p className={css.prose}>The discovery mentions: <b>{d.exceptions}</b>. The methodology recommends an explicit human approval gate and auditable escalation.</p><div className={css.miniRecord}><span>Proposed owner</span><strong>{d.owner}</strong><span>Why</span><strong>Consequential exceptions must not be silently automated</strong></div><div className={css.actions}>{btn("Accept recommendation",()=>{if(!nodes.some(x=>x.id==="manual-gate"))updateNodes([...nodes.slice(0,-1),{id:"manual-gate",title:"Exception escalation with audit trail",detail:d.exceptions,owner:d.owner,kind:"approval"},nodes[nodes.length-1]]);setPrefs(p=>({...p,notes:[...p.notes,"Kept human escalation gate for "+d.company]}));announce("Approved map improvement recorded.");},"primary")}{btn("Discuss with agent",()=>{setAgent("Process Mapper");navigate("agents")})}</div></section>
   <section className={css.panel}><p className={css.eyebrow}>CONSULTANT CORRECTION</p><h2>Add a stage</h2><label className={css.field}><span>Describe the missing activity</span><textarea rows={3} value={stepDraft} onChange={e=>setStepDraft(e.target.value)} placeholder="e.g. Reviewer signs off invoice exception"/></label><button className={css.primary} onClick={addNode}><Plus size={15}/> Insert before output</button><p className={css.helper}>Edits remain in this case. Feedback is recorded in the local methodology history, not used to retrain a live model.</p></section></aside></div>
  </>}
 </>;
 if(module==="assessment")content=<>
  {header("03 / DECISION INTELLIGENCE","Select automation for business value.","Compare opportunities through a transparent, editable scoring model. Consultant acceptance and rejection refine the local ranking.",btn("Design commercial offer",()=>navigate("commercial"),"primary"))}
  {!ready&&<div className={css.warning}><CircleAlert size={16}/> Discovery is incomplete. Rankings are preliminary and must not be presented as validated.</div>}
  <div className={css.twoColumnsWide}><section className={css.panel}><div className={css.panelHeading}><div><p className={css.eyebrow}>OPPORTUNITY REGISTER</p><h2>Ranked use cases</h2></div><span className={css.muted}>Transparent weighted scores</span></div><div className={css.opportunityList}>{opportunity.map((o,i)=><button key={o.id} className={selected.id===o.id?css.opportunitySelected:css.opportunityItem} onClick={()=>setSelectedOpp(o.id)}><span>{String(i+1).padStart(2,"0")}</span><div><strong>{o.title}</strong><small>{o.category} · {o.weeks} weeks estimated component effort</small></div><b>{o.score}<small>/100</small></b><ChevronRight size={17}/></button>)}</div>{tip("Scores are scenario heuristics. They are not trained probability estimates or a substitute for a verified technical assessment.")}</section>
   <div><section className={css.panel}><div className={css.panelHeading}><div><p className={css.eyebrow}>RECOMMENDATION</p><h2>{selected.title}</h2></div><span className={css.score}>{selected.score}/100</span></div><p className={css.prose}>{selected.description}</p><div className={css.riskGrid}>{[["Impact",selected.impact],["Feasibility",selected.ease],["Readiness",selected.readiness],["Risk",selected.risk]].map(([name,v])=><div key={String(name)}><small>{name}</small><strong>{v}/5</strong></div>)}</div><p className={css.prose}><b>Reasoning:</b> {selected.reason}</p><p className={css.eyebrow}>DELIVERY DEPENDENCIES</p><div className={css.tagRow}>{selected.dependencies.map(x=><span key={x}>{x}</span>)}</div><label className={css.field}><span>Consultant feedback / preferred scope</span><textarea rows={2} value={feedbackText} onChange={e=>setFeedbackText(e.target.value)} placeholder="Explain what to keep, remove or reprioritise"/></label><div className={css.actions}><button className={css.primary} onClick={()=>vote(selected,true)}><Check size={15}/> Accept / prioritise</button><button className={css.secondary} onClick={()=>vote(selected,false)}><X size={15}/> Reject / deprioritise</button></div></section>
   <section className={css.panel}><div className={css.panelHeading}><div><p className={css.eyebrow}>KNOWLEDGE & METHODOLOGY</p><h2>Adjust scoring priorities</h2></div><Settings2 size={18}/></div>{([["impact","Business impact"],["ease","Implementation feasibility"],["readiness","Data readiness"],["risk","Risk containment"]] as const).map(([field,label])=><label className={css.rangeRow} key={field}><span>{label}<b>{prefs[field]}</b></span><input type="range" min="0" max="50" step="1" value={prefs[field]} onChange={e=>setPrefs({...prefs,[field]:Number(e.target.value)})}/></label>)}<p className={css.helper}>Approved feedback: {prefs.accepted.length} · Rejected: {prefs.rejected.length}. All changes are local, explainable and reversible.</p><button className={css.ghost} onClick={()=>setPrefs(preferenceDefault)}><RefreshCw size={14}/> Reset methodology</button></section></div></div>
 </>;
 if(module==="commercial")content=<>
  {header("04 / COMMERCIAL ARCHITECTURE","The right proposal for the right client.","Translate operational value and adoption constraints into two realistic customer-facing solution paths. Prices below are fictional example-project estimates.",btn("Inspect ROI assumptions",()=>navigate("roi"),"primary"))}
  <div className={css.metrics}><div><small>Client headcount</small><strong>{d.employees||"—"}</strong><span>Delivery and adoption scale</span></div><div><small>Annual revenue</small><strong>{compact(d.revenue)}</strong><span>Illustrative financial capacity</span></div><div><small>Qualification score</small><strong>{lead.score}/100</strong><span>Not a calibrated probability</span></div><div><small>Repeat-work potential</small><strong>{lead.expansion}/100</strong><span>Heuristic expansion indicator</span></div></div>
  <div className={css.twoColumns}><section className={css.panel}><p className={css.eyebrow}>BARRIERS & ADOPTION</p><h2>What could stop a decision?</h2><div className={css.barrierList}>{[{title:"Budget availability",desc:d.budgetFit<=2?"Require smaller scoped pilot and decision checkpoint.":"Offer value-based milestones and phased investment."},{title:"Decision authority",desc:d.authority<=2?"Identify an executive sponsor before a full proposal.":"Validate who signs the investment and governs delivery."},{title:"Operational disruption",desc:d.employees<100?"Limited staff capacity suggests low-change rollout.":"Confirm support capacity, rollout sequence and local champions."},{title:"Integration burden",desc:"Verify "+(d.systems||"unknown systems")+" and permission boundaries before pricing."}].map(x=><div key={x.title}><CircleAlert size={17}/><div><strong>{x.title}</strong><p>{x.desc}</p></div></div>)}</div><div className={css.formGrid}>{(["authority","urgency","budgetFit","repeatPotential"] as const).map(k=><label className={css.field} key={k}><span>{({authority:"Buying authority",urgency:"Urgency",budgetFit:"Budget alignment",repeatPotential:"Repeat-project potential"})[k]} (1–5)</span><input type="range" min="1" max="5" value={d[k]} onChange={e=>update({[k]:Number(e.target.value)})}/><small>{d[k]} / 5</small></label>)}</div></section>
  <section className={css.panel}><p className={css.eyebrow}>COMMERCIAL PATHS / EXAMPLE CLIENT AUTOMATION</p><h2>Two budgets, two risk profiles</h2><div className={css.packageList}>{offer.map(o=><button className={pilotMode===o.id?css.packageActive:css.package} key={o.id} onClick={()=>setPilotMode(o.id as "pilot"|"scale")}><span>{o.name}</span><strong>{fmt(o.price)}</strong><small>Indicative implementation · {o.window}</small><p>{o.scope}</p><span className={css.smallMonthly}>Illustrative operating costs: {fmt(o.monthly)}/mo</span></button>)}</div>{tip("These amounts illustrate what the consultancy could quote its own end customer for an automation engagement. They do NOT represent the cost of developing this white-label consulting platform.")}{btn("Build roadmap for selected option",()=>navigate("roadmap"),"primary")}</section></div>
 </>;
 if(module==="roi")content=<>
  {header("05 / FINANCIAL FEASIBILITY","Make the business case auditable.","Model hours, efficiency realisation, infrastructure, software licences, possible staffing and implementation investment.",btn("Build implementation roadmap",()=>navigate("roadmap"),"primary"))}
  <div className={css.metrics}><div><small>Annual productive capacity</small><strong>{econ.hoursYear.toFixed(0)} h</strong><span>Coverage × 80% realisation</span></div><div><small>Gross annual value</small><strong>{compact(econ.annualGross)}</strong><span>Not necessarily cash savings</span></div><div><small>First-year net</small><strong className={econ.netYear>=0?css.positive:css.negative}>{compact(econ.netYear)}</strong><span>After project and operating cost</span></div><div><small>Payback</small><strong>{econ.payback===null?"N/A":econ.payback.toFixed(1)+" mo"}</strong><span>Only if monthly net is positive</span></div></div>
  <div className={css.twoColumns}><section className={css.panel}><div className={css.panelHeading}><div><p className={css.eyebrow}>INTERACTIVE ASSUMPTIONS</p><h2>Test a different case</h2></div><SlidersHorizontal size={19}/></div><label className={css.rangeRow}><span>Automatable share<b>{coverage===null?d.coverage:coverage}%</b></span><input type="range" min="10" max="90" step="5" value={coverage===null?d.coverage:coverage} onChange={e=>setCoverage(Number(e.target.value))}/></label><div className={css.formGrid}>{(["weeklyVolume","minutes","hourlyCost","setup","infra","licences","staff"] as const).map(input)}</div><div className={css.actions}><button className={css.secondary} onClick={()=>{setCoverage(null);announce("Coverage reset to case baseline.");}}><RefreshCw size={14}/> Reset coverage</button></div><p className={css.helper}>Assumption: 52 weeks × minutes saved × 80% realisable capacity. No reduction in employee payroll is assumed merely because time is freed.</p></section>
   <section className={css.panel}><div className={css.panelHeading}><div><p className={css.eyebrow}>MODEL OUTPUT</p><h2>Economics and constraints</h2></div><span className={css.muted}>USD · illustrative</span></div><div className={css.financialTable}>{[["Base process workload",econ.hoursWeek.toFixed(1)+" hours/week"],["Realised hours per year",econ.hoursYear.toFixed(0)+" hours"],["Annual value of capacity",fmt(econ.annualGross)],["Annual infrastructure, licences & staff",fmt(econ.annualRun)],["Upfront implementation",fmt(econ.initial)],["Year-one net value",fmt(econ.netYear)],["Year-one ROI on total year-one cost",econ.roi.toFixed(1)+"%"],["Three-year cumulative net",fmt(econ.net3y)]].map(([k,v])=><div key={k}><span>{k}</span><strong>{v}</strong></div>)}</div><div className={css.formGroup}><h3>Financial interpretation</h3><p className={css.prose}>Payback assumes recurring benefit can actually be monetised. Savings may represent freed capacity rather than cash. Operating costs include all user-supplied infrastructure, licence and added staff assumptions. Testing sensitivity with real data would be required.</p></div></section></div>
 </>;
 if(module==="roadmap")content=<>
  {header("06 / IMPLEMENTATION ROADMAP","Turn recommendations into accountable delivery.","Plan based on operating capacity, technical dependencies, client approvals and the consultancy's delivery method.",btn("Generate executive report",()=>navigate("deliverables"),"primary"))}
  <div className={css.twoColumnsWide}><section className={css.panel}><div className={css.panelHeading}><div><p className={css.eyebrow}>IMPLEMENTATION PLAN</p><h2>{pilotMode==="pilot"?"Proof of Value":"Governed rollout"} roadmap</h2></div><span className={css.statusGood}>{plan(pilotMode).length} stages</span></div><div className={css.timeline}>{plan(pilotMode).map(x=><div key={x.id}><span className={css.timelineDot}>{x.id}</span><div><div className={css.timelineHead}><strong>{x.name}</strong><span>Weeks {x.weeks}</span></div><p>{x.output}</p><small>Accountable: {x.owner}</small></div></div>)}</div></section><aside className={css.stickyColumn}><section className={css.panel}><p className={css.eyebrow}>DELIVERY CAPACITY</p><h2>Operational reality</h2><label className={css.rangeRow}><span>Available technical contributors<b>{capacity}</b></span><input type="range" min="1" max="6" value={capacity} onChange={e=>setCapacity(Number(e.target.value))}/></label><p className={css.prose}>{capacity<=1?"Single-person delivery requires longer sequencing and fewer parallel integrations.":capacity<=3?"Small team: prioritise one workflow and one data source before expansion.":"Parallel development may reduce bottlenecks, subject to integration and review capacity."}</p><div className={css.miniRecord}><span>Scope option</span><strong>{offer.find(x=>x.id===pilotMode)?.name}</strong><span>Critical sponsor</span><strong>{d.decisionMaker||"Not identified"}</strong><span>Process approval</span><strong>{d.owner||"Not identified"}</strong></div>{btn("Change commercial scenario",()=>navigate("commercial"))}</section><section className={css.panel}><p className={css.eyebrow}>MEETINGS & FOLLOW-UPS</p><h2>Action log</h2><label className={css.field}><span>Next action</span><input value={actionTitle} onChange={e=>setActionTitle(e.target.value)} placeholder="Validate API permissions"/></label><label className={css.field}><span>Owner / meeting notes</span><textarea rows={2} value={actionDetail} onChange={e=>setActionDetail(e.target.value)} placeholder="Sponsor, due date and context"/></label><button className={css.primary} onClick={logEvent}><Plus size={14}/> Log next action</button><div className={css.smallEvents}>{events.slice(0,5).map(x=><div key={x.id}><b>{x.title}</b><span>{x.date} · {x.detail}</span></div>)}</div></section></aside></div>
 </>;
 if(module==="pipeline")content=<>
  {header("07 / PORTFOLIO INTELLIGENCE","Prioritise the right clients, not just the loudest opportunities.","Compare fictional prospect profiles by buying signals, expected repeat work, organisation scale and indicative customer-project value.",btn("Add a new client",newCase,"primary"))}
  <div className={css.panel}><div className={css.panelHeading}><div><p className={css.eyebrow}>MULTI-CLIENT VIEW</p><h2>Pipeline comparison</h2></div><label className={css.inlineSelect}>Rank by <select value={sort} onChange={e=>setSort(e.target.value as typeof sort)}><option value="conversion">Conversion propensity</option><option value="expansion">Repeat-project potential</option><option value="potential">Illustrative deal value</option></select></label></div><div className={css.tableScroll}><table><thead><tr><th>Client</th><th>Industry</th><th>Headcount</th><th>Annual revenue</th><th>Conversion score</th><th>Repeat potential</th><th>Project value</th><th></th></tr></thead><tbody>{results.map(x=>{const r=prospect(x);return <tr key={x.id}><td><strong>{x.company||"Unassigned client"}</strong><small>{x.decisionMaker||"Buyer unconfirmed"}</small></td><td>{x.sector||"—"}</td><td>{x.employees||"—"}</td><td>{compact(x.revenue)}</td><td><span className={css.scorePill}>{r.score}/100</span></td><td>{r.expansion}/100</td><td>{fmt(r.potential)}</td><td><button className={css.tableAction} onClick={()=>{setSelectedId(x.id);navigate("overview")}}>Open <ArrowRight size={13}/></button></td></tr>})}</tbody></table></div>{tip("Conversion and expansion scores are explainable prioritisation heuristics, not probabilities learned from completed sales. Real prediction would require historical wins/losses and calibration.")}</div>
 </>;
 if(module==="governance")content=<>
  {header("08 / TRUST BY DESIGN","Contracts, identity and accountability are part of delivery.","Prepare a legal-review NDA draft, define rights to customer information and preview the access model of a real multi-client application.",btn("Open technical architecture",()=>navigate("integrations"),"primary"))}
  <div className={css.twoColumns}><section className={css.panel}><div className={css.panelHeading}><div><p className={css.eyebrow}>MUTUAL NDA · DRAFT GENERATOR</p><h2>Prepare a confidentiality agreement</h2></div><FileCheck2 size={20}/></div><div className={css.formGrid}><label className={css.field}><span>Consultancy legal name</span><input value={ndaA} onChange={e=>setNdaA(e.target.value)}/></label><label className={css.field}><span>Governing law (to be reviewed)</span><input value={ndaLaw} onChange={e=>setNdaLaw(e.target.value)}/></label></div><div className={css.ndaPreview}><p>{ndaText(ndaA,d.company,d.process,ndaLaw).slice(0,1400)}…</p></div><button className={css.primary} onClick={exportNda}><Download size={15}/> Download editable NDA draft</button>{tip("This is not a signature-ready legal document. Use counsel to set jurisdiction, term, permitted disclosures, remedies and personal-data agreements.")}</section><section className={css.panel}><div className={css.panelHeading}><div><p className={css.eyebrow}>GOVERNANCE CHECKLIST</p><h2>Controls before connection</h2></div><span className={css.statusGood}>{checks.length}/{riskChecks.length} marked</span></div><div className={css.checks}>{riskChecks.map(x=><label key={x}><input type="checkbox" checked={checks.includes(x)} onChange={e=>setChecks(s=>e.target.checked?[...s,x]:s.filter(v=>v!==x))}/><span>{x}</span></label>)}</div><p className={css.helper}>Checklist ticks are local demonstration acknowledgements, not evidence of compliance.</p></section></div>
  <section className={css.panel}><div className={css.panelHeading}><div><p className={css.eyebrow}>TENANT & ROLE MODEL</p><h2>Who may access what?</h2></div><LockKeyhole size={19}/></div><div className={css.tableScroll}><table><thead><tr><th>Capability</th><th>Consultancy admin</th><th>Delivery specialist</th><th>Client sponsor</th><th>Reviewer</th></tr></thead><tbody>{[["Read assessment","✓","✓","✓","✓"],["Change methodology","✓","—","—","—"],["Edit delivery roadmap","✓","✓","View","View"],["Approve sensitive automation","✓","—","✓","✓"],["Export NDA / commercial terms","✓","—","Approved","—"],["Tenant-wide administration","✓","—","—","—"]].map(row=><tr key={row[0]}>{row.map((v,i)=><td key={i}>{v}</td>)}</tr>)}</tbody></table></div>{tip("Role selection in a static demo is not authentication. Production would require tenant isolation, server-enforced permissions, audit logs, encryption and controlled subprocessors.")}</section>
 </>;
 if(module==="integrations")content=<>
  {header("09 / INTEGRATIONS & SYSTEMS","An ecosystem, not an isolated AI chatbot.","The production design would connect approved meeting, document, CRM, operational and data services. This public demo never asks for credentials.",btn("Explore specialist agents",()=>navigate("agents"),"primary"))}
  <section className={css.panel}><div className={css.panelHeading}><div><p className={css.eyebrow}>SYSTEM ARCHITECTURE</p><h2>How information flows</h2></div><span className={css.statusWarn}>Illustrative connections only</span></div><div className={css.architecture}><div><FileUp size={23}/><strong>Meetings & files</strong><small>Transcripts · Form · Calendar · Drive</small></div><ArrowRight size={20}/><div><Database size={23}/><strong>Secure knowledge layer</strong><small>Records · Permissions · Source tracing</small></div><ArrowRight size={20}/><div><Bot size={23}/><strong>Specialist agents</strong><small>Validated tools · Approval gates</small></div><ArrowRight size={20}/><div><FileCheck2 size={23}/><strong>Client outputs</strong><small>CRM · Report · ROI · Roadmap</small></div></div></section>
  <div className={css.connectorGrid}>{connectors.map(x=><button key={x.name} className={connected.includes(x.name)?css.connectorOn:css.connector} onClick={()=>setConnected(p=>p.includes(x.name)?p.filter(a=>a!==x.name):[...p,x.name])}><div><Cloud size={22}/><span>{x.domain}</span></div><strong>{x.name}</strong><small>{x.kind}</small><span className={connected.includes(x.name)?css.statusGood:css.statusNeutral}>{connected.includes(x.name)?"In scope (mock)":"Add to scope"}</span></button>)}</div>{tip("Clicking an integration only updates the illustrative delivery scope. No authorisation, API request, database connection or cloud workflow occurs.")}
  <section className={css.panel}><div className={css.panelHeading}><div><p className={css.eyebrow}>A REAL IMPLEMENTATION WOULD NEED</p><h2>Data contracts, not just connectors</h2></div></div><div className={css.capabilityGrid}>{[{title:"1. Sources & legal basis",text:"Classify recorded calls, consent, NDA, document ownership and retention."},{title:"2. Tenant & identity",text:"SSO, organisation isolation and reviewer roles enforced server-side."},{title:"3. Governed AI",text:"Grounding, citations, tests, tool permissions and human approval."},{title:"4. Operations",text:"Retries, idempotent workflows, failure alerts and cost monitoring."},{title:"5. Audit & change control",text:"Versioned assessment rules, user feedback, decisions and releases."},{title:"6. Success measurement",text:"Baseline metrics, pilot acceptance and measured ROI after rollout."}].map(x=><div key={x.title} className={css.archDetail}><strong>{x.title}</strong><p>{x.text}</p></div>)}</div></section>
 </>;
 if(module==="agents")content=<>
  {header("10 / SPECIALIST WORKSPACE","A team of assistants with defined responsibilities.","Ask domain questions about this assessment. The demonstration uses local, deterministic explanations; live LLMs would require connected, authorised services.",btn("Inspect opportunity scores",()=>navigate("assessment")))}
  <div className={css.agentLayout}><section className={css.panel}><p className={css.eyebrow}>CONSULTING AGENTS</p><h2>Choose a specialist</h2><div className={css.agentList}>{agentProfiles.map((x,i)=><button className={agent===x.id?css.agentActive:css.agentItem} key={x.id} onClick={()=>setAgent(x.id)}><span className={css.agentAvatar}>{["DI","PM","AA","CS","RI","DP","GA"][i]}</span><div><strong>{x.id}</strong><small>{x.subtitle}</small></div><ChevronRight size={15}/></button>)}</div></section><section className={css.chatPanel}><div className={css.chatHeader}><span className={css.agentAvatar}><Bot size={18}/></span><div><strong>{agent}</strong><small>Case context: {d.company||"New assessment"} · Demonstration logic</small></div><span className={css.statusWarn}>No live LLM</span></div><div className={css.chatHistory}>{!chat.some(x=>x.agent===agent)&&<div className={css.chatWelcome}><Sparkles size={26}/><h2>What do you need to understand?</h2><p>Each specialist explains its evidence, dependencies, risks and decision rules. Choose a question to explore the current case.</p><div>{agentProfiles.filter(x=>x.id===agent).map(x=><button key={x.id} onClick={()=>ask(x.question)}>{x.question}</button>)}</div></div>}{chat.filter(x=>x.agent===agent).map((m,i)=><div key={i} className={m.from==="user"?css.myMessage:css.agentMessage}><small>{m.from==="user"?"YOU":agent.toUpperCase()}</small><p>{m.text}</p></div>)}</div><form className={css.chatInput} onSubmit={e=>{e.preventDefault();ask()}}><input value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Ask about readiness, ROI, recommendations, delivery or governance..." aria-label="Ask specialist"/><button type="submit" disabled={!question.trim()}><Send size={17}/></button></form><div className={css.chatDisclaimer}><ShieldCheck size={13}/> Evidence-based demonstration responses. No model calls, external actions or secret data.</div></section></div>
 </>;
 if(module==="deliverables")content=<>
  {header("11 / CLIENT DELIVERABLES","Turn the assessment into an executive decision.","Select the sections, review assumptions and export a client-friendly document. All figures and businesses are fictional.",<><button className={css.secondary} onClick={exportJson}><Download size={15}/> Export case JSON</button><button className={css.primary} onClick={printPack}><Printer size={15}/> Print / Save PDF</button></>)}
  <div className={css.reportGrid}><aside className={css.reportOptions}><div className={css.panel}><p className={css.eyebrow}>REPORT SECTIONS</p><h2>What should the client see?</h2><div className={css.checks}>{reportDefaults.map(s=><label key={s}><input type="checkbox" checked={reportSections.includes(s)} onChange={e=>setReportSections(prev=>e.target.checked?[...prev,s]:prev.filter(x=>x!==s))}/><span>{s}</span></label>)}</div>{tip("Everything in this report is derived from the fictitious workspace and is not a verified consultancy deliverable.")}</div></aside>
  <article className={css.reportDocument}><div className={css.reportMasthead}><strong>{brand.toUpperCase()}</strong><span>AI TRANSFORMATION ASSESSMENT / SAMPLE</span></div><div className={css.reportCover}><p>MANAGEMENT ADVISORY · INTERACTIVE CASE</p><h2>{d.company||"Client"}<br/>Transformation opportunity review</h2><span>{d.sector||"Industry to confirm"} · Report prepared for {d.decisionMaker||"management"}</span><div><strong>ILLUSTRATIVE ASSESSMENT</strong><span>{quality}% discovery readiness</span></div></div><div className={css.reportPaper}>
   {reportSections.includes("Executive summary")&&<section><h3>01 / Executive summary</h3><p>Assessing {d.process||"an unconfirmed business process"} across {d.sector||"the client organisation"}, with the objective of {d.objective||"defining measurable business value"}.</p><p>Completeness: {quality}%. Qualification score: {lead.score}/100 (heuristic only). This report is a decision-support demonstration, not a contracted diagnosis.</p></section>}
   {reportSections.includes("Discovery evidence")&&<section><h3>02 / Discovery evidence</h3><p><b>Owner:</b> {d.owner||"Unconfirmed"} · <b>Systems:</b> {d.systems||"Unconfirmed"}</p><p><b>Trigger:</b> {d.trigger||"Unconfirmed"} · <b>Exception policy:</b> {d.exceptions||"Unconfirmed"}</p>{absent.length>0&&<p>Outstanding questions: {absent.map(x=>x.label).join(", ")}.</p>}</section>}
   {reportSections.includes("Workflow map")&&<section><h3>03 / Process workflow</h3>{!ready?<p>Process map withheld pending required discovery fields.</p>:<ol>{nodes.map(n=><li key={n.id}><strong>{n.title}</strong> — {n.owner}. {n.detail}</li>)}</ol>}</section>}
   {reportSections.includes("Priority opportunities")&&<section><h3>04 / Priority recommendations</h3>{opportunity.slice(0,4).map(x=><p key={x.id}><b>{x.title} · {x.score}/100</b> — {x.description}</p>)}</section>}
   {reportSections.includes("Delivery options")&&<section><h3>05 / Illustrative customer project options</h3>{offer.map(x=><p key={x.id}><b>{x.name}: {fmt(x.price)}</b> initial · {fmt(x.monthly)}/mo operating · {x.window}. {x.scope}</p>)}</section>}
   {reportSections.includes("ROI and sensitivities")&&<section><h3>06 / Impact and financial sensitivity</h3><p>Annual nominal freed value, applying an 80% realisation factor: {fmt(econ.annualGross)}. Annual operating costs: {fmt(econ.annualRun)}. Initial investment: {fmt(econ.initial)}. First-year net: {fmt(econ.netYear)}. Assumed automation coverage: {coverage===null?d.coverage:coverage}%.</p><p>Figures exclude unverified revenue uplift, payroll reductions and tax effects.</p></section>}
   {reportSections.includes("Implementation roadmap")&&<section><h3>07 / Implementation plan</h3>{plan(pilotMode).map(x=><p key={x.id}><b>Weeks {x.weeks} · {x.name}:</b> {x.output}. Owner: {x.owner}.</p>)}</section>}
   {reportSections.includes("Security and approvals")&&<section><h3>08 / Governance and readiness</h3><p>Controls acknowledged: {checks.length}/{riskChecks.length}. Confirm NDA, data minimisation, tenant isolation, human approvals, privacy terms, integration permissions and client acceptance before delivery.</p></section>}
  </div><footer className={css.reportFooter}>SYNTHETIC DATA · UNVERIFIED SCENARIO ESTIMATES <span>CONFIDENTIAL EXAMPLE / NOT FOR CONTRACTING</span></footer></article></div>
 </>;
 return <div className={css.shell}>
  <aside className={mobile?css.sidebarOpen:css.sidebar}><div className={css.sidebarBrand}><div className={css.monogram}>T<span>.</span></div><div><strong>TRANSFORMATION</strong><small>STUDIO / WHITE-LABEL DEMO</small></div><button className={css.closeMobile} onClick={()=>setMobile(false)} aria-label="Close menu"><X size={19}/></button></div>
   <div className={css.sideClient}><small>ACTIVE CLIENT</small><strong>{d.company||"New client assessment"}</strong><span>{d.sector||"Discovery required"}</span></div>
   <nav>{sections.map(s=><div className={css.navGroup} key={s.name}><p>{s.name}</p>{s.items.map(x=>{const Icon=x.icon;return <button className={module===x.id?css.navActive:css.navItem} key={x.id} onClick={()=>navigate(x.id)}><Icon size={17}/><span>{x.name}</span>{module===x.id&&<i/>}</button>})}</div>)}</nav>
   <div className={css.sidebarFoot}><div><ShieldCheck size={17}/><span>Public showcase / fictional data</span></div><small>All tools run locally · No client access or external AI</small></div>
  </aside>
  {mobile&&<button className={css.mobileBackdrop} onClick={()=>setMobile(false)} aria-label="Dismiss navigation"/>}
  <div className={css.mainColumn}><header className={css.topbar}><div className={css.topLeft}><button className={css.mobileToggle} onClick={()=>setMobile(true)}><Menu size={20}/></button><span>CLIENT ADVISORY</span><ChevronRight size={13}/><strong>{sections.flatMap(x=>x.items).find(x=>x.id===module)?.name}</strong></div><div className={css.topRight}><span className={css.simulated}><i/>SIMULATION</span><select value={selectedId} onChange={e=>{setSelectedId(e.target.value);setCoverage(null);setExtracted(null);setRaw("");setEvidence([]);}} aria-label="Select fictional client">{cases.map(x=><option value={x.id} key={x.id}>{x.company||"New client"}</option>)}</select><button onClick={newCase} title="New assessment"><Plus size={17}/></button></div></header>
  <main className={css.workspace}>
    <div className={css.contextBar}><div><span>YOUR BRAND</span><input aria-label="Consultancy display name" value={brand} onChange={e=>setBrand(e.target.value)} maxLength={35}/></div><div><span>PROSPECT</span><strong>{d.company||"Not assigned"}</strong></div><div><span>DISCOVERY</span><strong>{quality}% complete</strong></div><button onClick={reset} title="Reset all synthetic cases"><RefreshCw size={14}/> Reset demo</button></div>
    {notice&&<div role="status" className={css.notice}><CheckCircle2 size={17}/><span>{notice}</span><button onClick={()=>setNotice("")} aria-label="Close notification"><X size={16}/></button></div>}
    {content}
   <footer className={css.footer}><span>Transformation Studio · White-label concept · Browser-local state · Fictional companies and values</span><span>No live model, scheduling, databases, legal advice or provider integrations</span></footer>
  </main></div>
 </div>;
}
