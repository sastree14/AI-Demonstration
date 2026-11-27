"use client";

import {useEffect,useMemo,useState} from "react";
import {
 AlertCircle,ArrowDownRight,ArrowRight,ArrowUpRight,BarChart3,Bell,BookOpen,Bot,BriefcaseBusiness,
 Check,CheckCircle2,ChevronDown,ChevronRight,ClipboardCheck,Clock3,Cloud,Database,Download,
 FileCheck2,FileDown,FileSearch,FileText,GitBranch,Inbox,LayoutDashboard,Link2,LockKeyhole,
 Mail,Menu,MessageCircle,Plus,RefreshCw,Search,Send,Settings2,ShieldCheck,SlidersHorizontal,
 Sparkles,TrendingUp,Upload,Users,WalletCards,Workflow,Waypoints,X
} from "lucide-react";
import {
 type Invoice,type InvoiceStatus,type BankLine,type CardSpend,type Audit,type EntityId,
 entities,seedInvoices,seedBank,cardSpends,purchaseOrders,investorPeriods,scenarios,
 money,moneyPrecise,entityName,invoiceIssues,canRoute,canApprove,bankCheck,cardIssues,
 investorMetrics,calculateRoi,csv,safeDownload,canStage
} from "./engine";
import css from "./wigwam.module.css";
import {SystemMap,Specialists} from "./OperationsDesk";
import GuidedJourney from "./GuidedJourney";
import DiscoveryPresentation from "./DiscoveryPresentation";

type Screen="discovery"|"agents"|"overview"|"journey"|"invoices"|"reconciliations"|"reporting"|"spend"|"automation"|"integrations"|"assistant"|"roadmap";
type Role="director"|"controller";
type Conversation={id:string;from:"user"|"assistant";text:string};
type Store={invoices:Invoice[];bank:BankLine[];cards:CardSpend[];audit:Audit[];reportReview?:{signature:string;note:string}|null;reportNote?:string};
const storageKey="sc-wigwam-finance-provisional-v1";
const menuGroups:{title:string;items:{id:Screen;label:string;icon:typeof LayoutDashboard}[]}[]=[
 {title:"MEETING PRESENTATION",items:[{id:"discovery",label:"Discovery presentation",icon:Workflow}]},
 {title:"INTERACTIVE EXAMPLES",items:[
  {id:"overview",label:"Command centre",icon:LayoutDashboard},
  {id:"journey",label:"Guided AP walkthrough",icon:Waypoints},
  {id:"invoices",label:"Supplier invoices",icon:Inbox},
  {id:"reconciliations",label:"Bank reconciliations",icon:GitBranch},
  {id:"reporting",label:"Investor reporting",icon:BarChart3},
  {id:"spend",label:"POs & card spending",icon:WalletCards}
 ]},
 {title:"AUTOMATION & DELIVERY",items:[
  {id:"agents",label:"Potential AI assistants",icon:Bot},
  {id:"automation",label:"Workflow blueprint",icon:Workflow},
  {id:"integrations",label:"Connected ecosystem",icon:Cloud},
  {id:"assistant",label:"Finance AI guide",icon:Bot},
  {id:"roadmap",label:"Implementation plan",icon:ClipboardCheck}
 ]}
];
const names:Record<Screen,string>={
 discovery:"Discovery presentation",agents:"Potential AI assistants",overview:"Command centre",journey:"Guided AP walkthrough",invoices:"Supplier invoices",reconciliations:"Bank reconciliations",reporting:"Investor reporting",
 spend:"POs & card spending",automation:"Workflow blueprint",integrations:"Connected ecosystem",assistant:"Finance AI guide",roadmap:"Implementation plan"
};
const phases=[
 {n:"01",title:"Shared finance inbox",owner:"Shared email (provider unconfirmed)",detail:"Supplier PDFs arrive by email. The exact inbox provider, existing rules and required document fields need confirmation",state:"Source intake"},
 {n:"02",title:"Document capture",owner:"Hubdoc (existing)",detail:"Use the capture capabilities already available, then assess where validation or exception handling could add value",state:"AI-assisted"},
 {n:"03",title:"Entity and PO validation",owner:"Proposed Xero + Monday.com checks",detail:"Compare entity and PO evidence where relevant. Confirm which invoice types require a PO and how entities are configured",state:"Rules + AI"},
 {n:"04",title:"Finance exception queue",owner:"Finance review",detail:"Hold incomplete or inconsistent records for a documented human decision",state:"Human review"},
 {n:"05",title:"Approval request",owner:"ApprovalMax (existing)",detail:"Retain the established human approval process; actual approvers and limits need confirmation",state:"Human approval"},
 {n:"06",title:"Reviewed accounting hand-off",owner:"Controlled preparation",detail:"Prepare an approved-only example file. Live accounting and payment actions remain outside this demonstration",state:"Sample export"}
];
const connectors=[
 {name:"Shared finance inbox",category:"Document intake",role:"Supplier invoices arrive as PDF attachments. The exact email provider and intake rules can vary.",status:"Current system"},
 {name:"Hubdoc",category:"Document capture",role:"Document collection and extraction. Potentially reuse existing configuration before adding checks.",status:"Current system"},
 {name:"Xero",category:"Accounting",role:"Invoice and ledger records. Company allocation and hand-off rules are illustrated, not connected.",status:"Current system"},
 {name:"ApprovalMax",category:"Approvals",role:"Human approval workflows. Existing permissions remain authoritative in a live implementation.",status:"Current system"},
 {name:"Monday.com",category:"Purchase orders",role:"Purchase-order records. An automatic invoice-to-PO check is a possible integration.",status:"Current system"},
 {name:"Stripe",category:"Collections",role:"Payment records and settlement information, potentially useful for reconciliation.",status:"Current system"},
 {name:"GoCardless",category:"Collections",role:"Direct-debit collection information, potentially useful for reconciliation.",status:"Current system"},
 {name:"Space Manager",category:"Operations",role:"Potential operating-data source. Available modules and reporting fields determine its role.",status:"Current system"},
 {name:"SharePoint",category:"Documents",role:"Potential controlled document storage and evidence management.",status:"Current system"},
 {name:"Power Automate",category:"Automation",role:"Potential workflow orchestration and notifications, alongside existing automations.",status:"Current system"}
];
const initialAudit:Audit[]=[
 {id:"audit-01",when:"2026-11-19 11:02",actor:"Finance Controller (example)",action:"Review completed",detail:"Matched an example bank entry after manual inspection"},
 {id:"audit-02",when:"2026-11-19 10:18",actor:"Example rules engine",action:"Exception detected",detail:"Supplier invoice NS-7421 assigned to a different legal entity"}
];
const startChat:Conversation[]=[{id:"welcome",from:"assistant",text:"I can explain the fictional invoice queue, approval safeguards, bank reconciliation exceptions and reporting assumptions in this demonstration. I do not access your real accounting systems or make autonomous decisions. What would you like to inspect?"}];
const safeStatus=(s:InvoiceStatus):"good"|"warn"|"bad"|"neutral"=>s==="approved"?"good":s==="pending_approval"?"warn":s==="rejected"?"bad":s==="needs_review"?"bad":"neutral";
const statusLabel=(s:InvoiceStatus)=>({received:"Received",needs_review:"Needs review",pending_approval:"Awaiting approval",approved:"Approved · not paid",rejected:"Rejected"}[s]);
function Badge({type="neutral",children}:{type?:"good"|"warn"|"bad"|"neutral";children:React.ReactNode}){return <span className={type==="good"?css.statusGood:type==="warn"?css.statusWarn:type==="bad"?css.statusBad:css.statusNeutral}>{children}</span>}
function Metric({label,value,sub,tone}:{label:string;value:string|number;sub:string;tone?:"accent"|"alert"}){
 return <div className={css.metric}><small>{label}</small><strong className={tone==="accent"?css.accent:tone==="alert"?css.alert:""}>{value}</strong><span>{sub}</span></div>;
}
function Panel({label,title,children,action}:{label:string;title:string;children:React.ReactNode;action?:React.ReactNode}){
 return <section className={css.panel}><div className={css.panelHeader}><div><p className={css.eyebrow}>{label}</p><h2>{title}</h2></div>{action}</div>{children}</section>;
}
function Header({kicker,title,description,action}:{kicker:string;title:string;description:string;action?:React.ReactNode}){
 return <div className={css.head}><div><p className={css.eyebrow}>{kicker}</p><h1>{title}</h1><p>{description}</p></div>{action&&<div className={css.headActions}>{action}</div>}</div>;
}
function FinanceGuide(query:string,role:Role,invoices:Invoice[],bank:BankLine[],selectedId?:string){
 const q=query.toLowerCase(),problem=invoices.filter(x=>invoiceIssues(x,invoices).length>0&&x.status!=="rejected");
 const referenced=invoices.find(x=>q.includes(x.number.toLowerCase()))||(/this invoice|selected invoice|current invoice|why flagged|explain this/.test(q)?invoices.find(x=>x.id===selectedId):undefined);
 if(referenced){
  const flags=invoiceIssues(referenced,invoices);
  return "Invoice "+referenced.number+" ("+referenced.supplier+") is "+referenced.status.replaceAll("_"," ")+". Document entity: "+entityName(referenced.sourceCompany)+", proposed booking: "+entityName(referenced.assignedCompany)+", PO: "+(referenced.poId||"missing")+". "+(flags.length?"Checks identified: "+flags.join("; ")+".":"Document, company and PO checks currently pass.")+" "+(referenced.exceptionApproved?"An eligible exception was documented, but distinct human approval is still required.":"Correct blocking errors before submitting to Controller sign-off.")+" No payment or ledger posting is possible.";
 }

 if(/invoice|supplier|hubdoc|payable|bookkeeper|manual|log.?jam|flow|automation/.test(q)){
  return "An example supplier-invoice workflow connects document capture, entity and PO checks, exception review and human approval. This sample contains "+problem.length+" invoices with validation flags. A connected implementation could reduce manual handling while preserving human approval. This demonstration has no live connections.";
 }
 if(/approve|pay|payment|sign.?off|policy|control|human|security/.test(q)){
  return "People remain accountable. The rules engine can identify issues and prepare an approval request, but only the simulated Financial Controller view can mark an invoice approved. This is a UI demonstration, not authentication. There is intentionally no payment execution, bank instruction or live Xero posting.";
 }
 if(/company|entity|legal|wrong|duplicate|po\b|purchase/.test(q)){
  return "This fictional example compares the invoice entity, proposed bookkeeping entity and a sample purchase order. The three legal entities and PO-required rule are fictional and configurable. Open Supplier invoices to inspect the sample evidence.";
 }
 if(/bank|stripe|gocardless|reconcil|settlement|match/.test(q)){
  const mismatches=bank.filter(x=>bankCheck(x)!=="match");
  return "The reconciliation view proposes matches across fictional Stripe, GoCardless, bank transfers and operational references. "+mismatches.length+" sample rows have a missing item, a reference mismatch or a value discrepancy. Exceptions require a documented human review, and marking them reviewed never changes ledger balances.";
 }
 if(/report|quarter|investor|dashboard|forecast/.test(q)){
  return "The investor pack uses completely invented revenue, cash and occupancy data to illustrate possible reporting. Xero, payment systems and Space Manager are potential inputs only. The source mapping, metrics and review authority are illustrative. Q4 2026 is marked as a sample forecast.";
 }
 if(/roi|value|save|cost|hour|money|budget/.test(q)){
  return "The opportunity model calculates estimated time released from invoices per week × minutes each × automatable share × realised share. It separates nominal productive-capacity value from actual cash savings, defaulting cash conversion to zero. Use verified volumes and labour costs before treating any result as a business case.";
 }
 if(/director|controller|role|permission/.test(q)){
  return "Director and Financial Controller are illustrative role perspectives. The selector is not authentication. Live permissions and approval rules are established through controlled configuration.";
 }
 if(/implement|roadmap|phase|pilot|connect|system/.test(q)){
  return "A phased delivery can start with a controlled invoice workflow: document existing tools, configure validation and human approvals, measure performance and expand into reconciliation, reporting or spending controls where valuable.";
 }
 return "This prototype offers a rules-based explanation of the supplied requirements rather than an LLM connected to company data. Try asking: Which invoices require review? How would approval work? What bank mismatches exist? How would quarterly reporting be prepared?";
}

export default function WigwamFinanceDemo(){
 const [screen,setScreen]=useState<Screen>("discovery");
 const [role,setRole]=useState<Role>("director");
 const [menuOpen,setMenuOpen]=useState(false);
 const [invoices,setInvoices]=useState<Invoice[]>(seedInvoices);
 const [banks,setBanks]=useState<BankLine[]>(seedBank);
 const [cards,setCards]=useState<CardSpend[]>(cardSpends);
 const [audit,setAudit]=useState<Audit[]>(initialAudit);
 const [hydrated,setHydrated]=useState(false);
 const [notice,setNotice]=useState("");
 const [entityFilter,setEntityFilter]=useState<"all"|EntityId>("all");
 const [invoiceFilter,setInvoiceFilter]=useState("all");
 const [search,setSearch]=useState("");
 const [selectedInvoiceId,setSelectedInvoiceId]=useState("wi-2");
 const [selectedBankId,setSelectedBankId]=useState("bn-4");
 const [selectedCardId,setSelectedCardId]=useState("card-1");
 const [reviewNote,setReviewNote]=useState("");
 const [period,setPeriod]=useState("2026-Q3");
 const [reportSections,setReportSections]=useState(["Summary","Exceptions","Source mapping","Approval notice"]);
 const [weeklyVolume,setWeeklyVolume]=useState(65);
 const [minutes,setMinutes]=useState(11);
 const [coverage,setCoverage]=useState(55);
 const [realisation,setRealisation]=useState(80);
 const [hourlyRate,setHourlyRate]=useState(25);
 const [monthlyCost,setMonthlyCost]=useState(125);
 const [setupCost,setSetupCost]=useState(4500);
 const [cashPct,setCashPct]=useState(0);
 const [messages,setMessages]=useState<Conversation[]>(startChat);
 const [chatInput,setChatInput]=useState("");
 const [pickedPilot,setPickedPilot]=useState("ap");
 const [reportReview,setReportReview]=useState<{signature:string;note:string}|null>(null);
 const [reportNote,setReportNote]=useState("");
 useEffect(()=>{
  try{
   const saved=JSON.parse(localStorage.getItem(storageKey)||"null") as Store|null;
   if(saved&&Array.isArray(saved.invoices)&&Array.isArray(saved.bank)&&Array.isArray(saved.cards)&&Array.isArray(saved.audit)){
    setInvoices(saved.invoices);setBanks(saved.bank);setCards(saved.cards);setAudit(saved.audit);if(saved.reportReview)setReportReview(saved.reportReview);if(saved.reportNote)setReportNote(saved.reportNote);
   }
  }catch{}
  setHydrated(true);
 },[]);
 useEffect(()=>{if(hydrated){try{localStorage.setItem(storageKey,JSON.stringify({invoices,bank:banks,cards,audit,reportReview,reportNote}));}catch{}}},[invoices,banks,cards,audit,reportReview,reportNote,hydrated]);
 const flagged=useMemo(()=>invoices.filter(x=>!["rejected","approved"].includes(x.status)&&invoiceIssues(x,invoices).length>0),[invoices]);
 const awaiting=useMemo(()=>invoices.filter(x=>x.status==="pending_approval"),[invoices]);
 const unreconciled=useMemo(()=>banks.filter(x=>bankCheck(x)!=="match"),[banks]);
 const readyAuto=useMemo(()=>invoices.filter(x=>x.status==="received"&&invoiceIssues(x,invoices).length===0),[invoices]);
 const selected=useMemo(()=>invoices.find(x=>x.id===selectedInvoiceId)||invoices[0],[invoices,selectedInvoiceId]);
 const selBank=useMemo(()=>banks.find(x=>x.id===selectedBankId)||banks[0],[banks,selectedBankId]);
 const selCard=useMemo(()=>cards.find(x=>x.id===selectedCardId)||cards[0],[cards,selectedCardId]);
 const current=investorMetrics(period);
 const filteredInvoices=invoices.filter(x=>(entityFilter==="all"||x.assignedCompany===entityFilter)&&
  (invoiceFilter==="all"||invoiceFilter==="exceptions"&&invoiceIssues(x,invoices).length>0||invoiceFilter==="approvals"&&x.status==="pending_approval")&&
  (x.supplier+" "+x.number+" "+x.poId).toLowerCase().includes(search.toLowerCase()));
 const roi=calculateRoi(weeklyVolume,minutes,coverage,realisation,hourlyRate,monthlyCost,setupCost,cashPct);
 function navigate(target:Screen){setScreen(target);setMenuOpen(false);setNotice("");window.scrollTo?.({top:0,behavior:"smooth"});}
 function log(action:string,detail:string){setAudit(x=>[{id:"a-"+Date.now()+"-"+Math.random().toString(36).slice(2,5),when:new Date().toLocaleString("en-GB",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}),actor:role==="controller"?"Finance Controller · simulated":"Director · simulated",action,detail},...x].slice(0,40));}
 function patchInvoice(changes:Partial<Invoice>,action?:string){
  if(!selected)return;
  if(role!=="controller"){setNotice("Only the simulated Financial Controller can edit financial fields and exception notes.");return;}
  if(["approved","rejected"].includes(selected.status)||selected.staged){setNotice("Approved, rejected or staged invoices cannot be edited.");return;}
  setInvoices(xs=>xs.map(x=>x.id===selected.id?{...x,...changes}:x));
  if(action)log(action,selected.number+" · "+(changes.assignedCompany?entityName(changes.assignedCompany):changes.poId||"Review field updated"));
 }
 function validateSelected(){
  if(!selected||["approved","rejected"].includes(selected.status)||selected.staged){setNotice("Closed invoices cannot be revalidated. Use a new sample invoice.");return;}
  const issues=invoiceIssues(selected,invoices);
  if(!canRoute(selected,invoices)){
   patchInvoice({status:"needs_review"},"Validation: exception");
   setNotice("Validation found "+issues.length+" issue(s). Correct the fields or document a finance exception.");
  }else{
   patchInvoice({status:"pending_approval"},"Prepared approval request");
   setNotice("ApprovalMax hand-off prepared in the simulation. No external request was sent, and no payment is possible.");
  }
 }
 function approveSelected(){
  if(!selected||!canApprove(selected,invoices,role)){setNotice("Approval blocked. Switch to Financial Controller, complete checks, and submit for approval first.");return;}
  patchInvoice({status:"approved"},"Human approval recorded");
  setNotice("Controller sign-off recorded locally. Invoice has NOT been paid or posted to Xero.");
 }
 function acceptException(){
  if(role!=="controller"){setNotice("A Financial Controller must document and accept any exception.");return;}
  if(!selected||selected.exceptionNote.trim().length<12){setNotice("Enter a specific justification (at least 12 characters) before accepting an exception.");return;}
  if(invoiceIssues(selected,invoices).some(x=>/entity|duplicate|supplier and PO/i.test(x))){setNotice("This is a blocking integrity failure. Fix the legal entity, duplicate or supplier/PO mismatch; it cannot be waived.");return;}
  patchInvoice({exceptionApproved:true,status:"needs_review"},"Exception accepted for approval routing");
  setNotice("Exception justified. You can now prepare the approval request; the exception remains visible in the audit trail.");
 }
 function validateBatch(){
  if(role!=="controller"){setNotice("Switch to Financial Controller to route the sample invoices.");return;}
  let passed=0,blocked=0;
  const next=invoices.map(x=>{
   if(x.status!=="received")return x;
   if(invoiceIssues(x,invoices).length===0){passed++;return {...x,status:"pending_approval" as InvoiceStatus};}
   blocked++;return {...x,status:"needs_review" as InvoiceStatus};
  });
  setInvoices(next);
  log("Batch validation",passed+" prepared for human approval; "+blocked+" sent to manual review");
  setNotice("Simulation completed: "+passed+" ready for sign-off, "+blocked+" exception(s) held. Zero invoices auto-approved or paid.");
 }
 function reviewBank(){
  if(role!=="controller"){setNotice("Only the simulated Financial Controller can complete reconciliation review.");return;}
  if(bankCheck(selBank)!=="match"&&reviewNote.trim().length<12){setNotice("Provide an investigation note of at least 12 characters before closing an exception.");return;}
  setBanks(xs=>xs.map(x=>x.id===selBank.id?{...x,reviewed:true,note:reviewNote||"Reference and amount checked by reviewer"}:x));
  log("Reconciliation review",selBank.reference+" · "+(bankCheck(selBank)==="match"?"exact match confirmed":"exception investigated, not posted"));
  setReviewNote("");
  setNotice("Review recorded locally. No bank feed, source ledger or Xero balance was changed.");
 }
 function createGuidedInvoice(){
  const serial=6041+invoices.filter(x=>x.id.startsWith("journey-demo-")).length;
  const sample:Invoice={id:"journey-demo-"+serial,number:"NS-DEMO-"+serial,supplier:"Northpoint Security",date:"2026-11-23",due:"2026-12-15",amount:3690,vat:738,sourceCompany:"property",assignedCompany:"operating",poId:"PO-1022",document:"fictional-Northpoint-"+serial+".pdf",status:"received",exceptionApproved:false,exceptionNote:"",booked:false,staged:false};
  setInvoices(xs=>[sample,...xs]);
  setSelectedInvoiceId(sample.id);
  log("Fictional supplier intake","Synthetic invoice "+sample.number+" entered via illustrated inbox → Hubdoc pathway");
  setNotice("New fictional supplier invoice "+sample.number+" received. Correct the wrong legal entity before approval.");
 }
 function stageSelected(){
  if(!selected||!canStage(selected,invoices,role)){setNotice("Staging is blocked until a Controller approves a validated invoice. No Xero posting occurs.");return;}
  safeDownload("xero-staging-"+selected.number+".csv",csv([["Invoice","Supplier","Entity","PO","Issue date","Due date","Net GBP","VAT GBP","Controller status","Transfer status"],[selected.number,selected.supplier,entityName(selected.assignedCompany),selected.poId,selected.date,selected.due,selected.amount,selected.vat,"Approved locally","NOT SENT TO XERO"]]));
  setInvoices(xs=>xs.map(x=>x.id===selected.id?{...x,staged:true}:x));
  log("Approved-only CSV staging","Invoice "+selected.number+" downloaded for manual review; no Xero integration or payment");
  setNotice("Approved-only CSV downloaded. This is a reviewable staging file, not an accounting entry or payment.");
 }
 function rejectSelected(){
  if(role!=="controller"||!selected||selected.staged||["approved","rejected"].includes(selected.status)||selected.exceptionNote.trim().length<12){setNotice("Controller-only rejection requires a reason of at least 12 characters and an open invoice.");return;}
  patchInvoice({status:"rejected",exceptionApproved:false},"Human rejection recorded");
  setNotice("Invoice rejected with an auditable reason. It cannot progress to approval or staging.");
 }
 function reset(){
  if(!window.confirm("Restore this fictional demonstration to its initial data? This clears local approvals and notes."))return;
  setInvoices(seedInvoices.map(x=>({...x})));setBanks(seedBank.map(x=>({...x})));setCards(cardSpends.map(x=>({...x})));setAudit(initialAudit);
  setSelectedInvoiceId("wi-2");setSelectedBankId("bn-4");setSelectedCardId("card-1");setEntityFilter("all");setInvoiceFilter("all");setReportReview(null);setReportNote("");
  setNotice("Fictional scenario reset to its initial state.");
 }
 function exportInvoices(){
  safeDownload("example-accounts-payable.csv",csv([["Invoice","Supplier","Legal entity","PO","Amount GBP","Status","Issues","Exception note"],
   ...invoices.map(i=>[i.number,i.supplier,entityName(i.assignedCompany),i.poId,i.amount,statusLabel(i.status),invoiceIssues(i,invoices).join("; "),i.exceptionNote])]));
 }
 function signInvestorDraft(){
  if(role!=="controller"){setNotice("Only the simulated Financial Controller can review the draft report.");return;}
  if(reportNote.trim().length<20){setNotice("Document at least 20 characters of reporting checks and outstanding exceptions.");return;}
  setReportReview({signature:reportSignature,note:reportNote.trim()});
  log("Investor pack review","Reviewed "+period+" with caveats; fictional figures, not a real investor statement");
  setNotice("Illustrative pack review recorded locally. This is still not a factual investor report.");
 }
 function exportReport(){
  safeDownload("example-investor-quarters.csv",csv([["Period","Status","Revenue GBP","Operating costs GBP","Operating result GBP","Closing cash GBP","Collections GBP","Occupancy percent"],
   ...investorPeriods.map(q=>[q.name,q.id.endsWith("F")?"Forecast / synthetic":"Synthetic historical",q.revenue,q.costs,q.revenue-q.costs,q.cash,q.collections,q.occupancy])]));
 }
 function ask(question?:string){
  const value=(question??chatInput).trim();if(!value)return;
  setMessages(xs=>[...xs,{id:"u-"+Date.now(),from:"user",text:value},{id:"r-"+Date.now(),from:"assistant",text:FinanceGuide(value,role,invoices,banks,selected?.id)}]);
  setChatInput("");
 }
 function switchRole(v:Role){setRole(v);setNotice(v==="controller"?"Financial Controller simulation enabled. This is a role preview, not authentication.":"Director overview enabled. Financial approval actions are disabled.");}
 function page(title:string,kicker:string,description:string,action?:React.ReactNode){return <Header title={title} kicker={kicker} description={description} action={action}/>;}
 function navLink(item:{id:Screen;label:string;icon:typeof LayoutDashboard}){const Icon=item.icon;return <button key={item.id} onClick={()=>navigate(item.id)} className={screen===item.id?css.navCurrent:css.navLink}><Icon size={16}/><span>{item.label}</span>{screen===item.id&&<i/>}</button>;}
 const reviewCases=flagged.slice(0,4);
 const stagedCount=invoices.filter(x=>x.staged).length;
 const reportSignature=JSON.stringify({period,reportSections,reportNote,inv:invoices.map(x=>[x.id,x.status,x.assignedCompany,x.poId,x.exceptionApproved,x.exceptionNote,x.staged]),cards:cards.map(x=>[x.id,x.poId,x.receipt]),bank:banks.map(x=>[x.id,x.reviewed,x.note])});
 const reportSigned=reportReview?.signature===reportSignature;
 return <div className={css.shell}>
  {menuOpen&&<button className={css.mobileBackdrop} aria-label="Close navigation" onClick={()=>setMenuOpen(false)}/>}
  <aside className={menuOpen?css.sidebar+" "+css.sidebarOpen:css.sidebar}>
   <div className={css.brand}><span className={css.brandLogo}>W</span><div><strong>WIGWAM STORAGE</strong><small>FINANCE OPERATIONS</small></div><button className={css.brandClose} onClick={()=>setMenuOpen(false)} aria-label="Close navigation"><X size={18}/></button></div>
   <div className={css.sideCase}><small>INTERACTIVE CONCEPT</small><strong>Connected finance workflows</strong><span>Illustrative records · Human control</span></div>
   <nav className={css.navScroll}>{menuGroups.map(g=><div className={css.navGroup} key={g.title}><p>{g.title}</p>{g.items.map(navLink)}</div>)}</nav>
   <div className={css.sidebarFoot}><div><ShieldCheck size={14}/> <strong>Approval-first architecture</strong></div><p>All financial examples fictitious. No live connections, bank actions or AI model calls.</p></div>
  </aside>
  <div className={css.main}>
   <header className={css.topbar}><div className={css.crumb}><button className={css.menu} onClick={()=>setMenuOpen(true)} aria-label="Open navigation"><Menu size={19}/></button><span>FINANCE OPERATIONS</span><ChevronRight size={14}/><strong>{names[screen]}</strong></div><div className={css.topRight}><span className={css.simulation}><i/> DEMONSTRATION</span><label className={css.viewSwitch}><span>Perspective</span><select value={role} onChange={e=>switchRole(e.target.value as Role)}><option value="director">Director view</option><option value="controller">Financial Controller view</option></select></label></div></header>
   <main className={css.work}>
    {notice&&<div className={css.banner} role="status"><CheckCircle2 size={16}/><span>{notice}</span><button onClick={()=>setNotice("")} aria-label="Dismiss"><X size={14}/></button></div>}
    {screen==="discovery"&&<DiscoveryPresentation open={navigate}/>}
    {screen==="journey"&&<>
     {page("Guided supplier invoice walkthrough","ACCOUNTS PAYABLE · INTERACTIVE DEMONSTRATION","Follow a sample invoice from document capture through validation, exception handling and human sign-off to a controlled accounting file.",<button className={css.secondary} onClick={reset}><RefreshCw size={14}/> Reset the fictional scenario</button>)}
     <GuidedJourney invoices={invoices} selected={selected} role={role} create={createGuidedInvoice} pick={setSelectedInvoiceId} patch={patchInvoice} validate={validateSelected} acceptException={acceptException} approve={approveSelected} stage={stageSelected} changeRole={switchRole} openQueue={()=>navigate("invoices")} openDashboard={()=>navigate("overview")}/>
    </>}
    {screen==="overview"&&<>
     <div className={css.hero}>
      <div className={css.heroBody}><p className={css.eyebrow}>{role==="director"?"EXECUTIVE VIEW / FINANCE TRANSFORMATION":"CONTROLLER VIEW / DAILY FINANCE DESK"}</p><h1>{role==="director"?"One controlled finance workflow. Fewer manual hand-offs.":"Every exception explained. Every approval accountable."}</h1><p>{role==="director"?"Explore a connected approach to supplier invoice processing: fewer manual hand-offs, clearer exceptions and human-controlled approvals, designed to work alongside existing finance software.":"Review supplier invoices, investigate exceptions and record controlled decisions before accounting preparation."}</p><div className={css.heroBtns}><button className={css.primary} onClick={()=>navigate("journey")}>Run guided AP walkthrough <ArrowRight size={15}/></button><button className={css.secondary} onClick={()=>navigate("integrations")}>See proposed architecture <GitBranch size={15}/></button><button className={css.secondary} onClick={()=>navigate("agents")}>Explore possible AI support <Bot size={15}/></button></div><small>Interactive concept · Sample records and rules · No live financial system access</small></div>
      <div className={css.heroAside}><small>PROPOSED FIRST USE CASE</small><strong>Supplier invoice processing</strong><div><b>{flagged.length}</b><span>sample invoices<br/>requiring investigation</span></div><p>Entity assignment, missing PO references, suspected duplicates and an approval trail — without autonomous payments.</p></div>
     </div>
     <section className={css.discoveryBanner} aria-label="Finance workflow capabilities">
      <div><span className={css.discoveryTag}>DOCUMENT INTAKE</span><strong>From inbox to structured evidence</strong><p>Supplier PDFs can be captured, checked and prepared for review using existing document and accounting tools.</p></div>
      <div><span className={css.discoveryTag}>CONTROLLED VALIDATION</span><strong>Clear exceptions, fewer hand-offs</strong><p>Example entity, purchase-order and duplicate checks highlight what needs attention before approval.</p></div>
      <div><span className={css.discoveryTag}>HUMAN OVERSIGHT</span><strong>Finance stays in control</strong><p>Reviewer decisions, audit evidence and accounting preparation remain separate from payment execution.</p></div>
     </section>
     <div className={css.metrics}>
      <Metric label="Open supplier invoices" value={invoices.filter(x=>x.status!=="approved"&&x.status!=="rejected").length} sub="Fictional shared-inbox cases"/>
      <Metric label="Validation exceptions" value={flagged.length} sub="Require evidence or review" tone="alert"/>
      <Metric label="Awaiting human sign-off" value={awaiting.length} sub="No automatic approval"/>
      <Metric label="Bank mismatches" value={unreconciled.length} sub={unreconciled.filter(x=>!x.reviewed).length+" still need investigation"} tone="accent"/>
     </div>
     <div className={css.executiveStrip}>
       <div><p className={css.eyebrow}>{role==="director"?"ILLUSTRATIVE BUSINESS CASE":"CONTROLLER WORKLOAD"}</p><h3>{role==="director"?"What the first pilot could release":"Where manual attention is needed"}</h3><p>{role==="director"?"No savings have been verified. Adjust these assumptions in the implementation-plan calculator.":"A controller must check evidence and approve; the sample automation cannot approve or pay on its own."}</p></div>
       <div className={css.executiveFigure}><strong>{role==="director"?Math.round(roi.freed).toLocaleString()+" h":String(awaiting.length)}</strong><span>{role==="director"?"Potential hours per year":"Pending approval packets"}</span></div>
       <div className={css.executiveFigure}><strong>{role==="director"?money(roi.value):String(stagedCount)}</strong><span>{role==="director"?"Nominal capacity value, not cash saved":"Accounting staging files prepared"}</span></div>
       <button className={css.secondary} onClick={()=>navigate(role==="director"?"roadmap":"invoices")}>{role==="director"?"Inspect assumptions":"Open controller queue"} <ArrowRight size={14}/></button>
     </div>
     <div className={css.grid2}>
      <Panel label="01 / SUPPLIER INVOICES" title="From a fragmented process to controlled review" action={<button className={css.textLink} onClick={()=>navigate("automation")}>Full workflow <ArrowRight size={13}/></button>}>
       <div className={css.flow+" "+css.flowCompact}>{phases.map((p,i)=><div className={css.flowStep} key={p.n}><div className={css.flowRail}><span>{p.n}</span>{i<phases.length-1&&<i/>}</div><div className={css.flowInfo}><div><strong>{p.title}</strong><small>{p.state}</small></div><p>{p.detail}</p></div></div>)}</div>
       <div className={css.callout}><b>Designed for existing tools:</b> validation can complement the capabilities already available in Hubdoc, Xero and ApprovalMax. People remain in control of approvals and payments.</div>
      </Panel>
      <div>
       <Panel label="CURRENT DEMONSTRATION" title="Exceptions worth investigating" action={<Badge type="warn">{reviewCases.length} examples</Badge>}>
        <div className={css.alertList}>{reviewCases.map(i=><div className={css.alertItem} key={i.id}><AlertCircle size={17}/><div><strong>{i.number} · {i.supplier}</strong><p>{invoiceIssues(i,invoices).join(" · ")}</p><button className={css.textLink} onClick={()=>{setSelectedInvoiceId(i.id);navigate("invoices");}}>Inspect case <ArrowRight size={13}/></button></div></div>)}</div>
       </Panel>
       <Panel label="WHAT CAN BE IMPROVED" title="Four practical workstreams">
        <div className={css.capGrid}>{scenarios.map((s,i)=>{const Icon=[Inbox,GitBranch,BarChart3,WalletCards][i];const routes:Screen[]=["invoices","reconciliations","reporting","spend"];return <button className={css.cap} key={s.id} onClick={()=>navigate(routes[i])}><Icon size={19}/><strong>{s.title}</strong><span>{s.value}</span><small>{s.type.toUpperCase()}</small></button>})}</div>
       </Panel>
      </div>
     </div>
     <Panel label="AUDITABILITY" title="Recent sample activity" action={<button className={css.textLink} onClick={reset}><RefreshCw size={13}/> Reset scenario</button>}>
      {audit.slice(0,5).map(a=><div className={css.kpiLine} key={a.id}><span><strong>{a.action}</strong> · {a.detail}</span><small>{a.when}</small></div>)}
      <p className={css.smallTip}>Demo actions are saved in this browser only. No live systems are connected.</p>
     </Panel>
    </>}
    {screen==="invoices"&&<>
     {page("Supplier invoices","01 / ACCOUNTS PAYABLE","Review a fictional invoice queue, inspect exceptions and test entity, PO and human-approval checks. Rules and entities are configurable examples.",<><button className={css.secondary} onClick={()=>navigate("journey")}><Waypoints size={14}/> Guided walkthrough</button><button className={css.secondary} onClick={exportInvoices}><Download size={14}/> Export example CSV</button><button className={css.primary} disabled={role!=="controller"} onClick={validateBatch}><Sparkles size={15}/> Validate received invoices</button></>)}
     <div className={css.metrics+" "+css.metricsFive}>
      <Metric label="Invoices in example" value={invoices.length} sub="Source PDFs simulated"/>
      <Metric label="Total face value" value={money(invoices.reduce((a,x)=>a+x.amount,0))} sub="No payment execution"/>
      <Metric label="Open validation flags" value={flagged.length} sub="Wrong entity, PO or duplicate" tone="alert"/>
      <Metric label="Controller approvals pending" value={awaiting.length} sub="ApprovalMax route proposed"/><Metric label="Approved-only staging files" value={stagedCount} sub="CSV prepared, never posted"/>
     </div>
     <Panel label="AP REVIEW QUEUE" title="Invoices and automated checks">
      <div className={css.filterBar}><div className={css.filterGroup}><label className={css.viewSwitch}>Entity <select value={entityFilter} onChange={e=>setEntityFilter(e.target.value as "all"|EntityId)}><option value="all">All entities</option>{entities.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label><label className={css.viewSwitch}>Focus <select value={invoiceFilter} onChange={e=>setInvoiceFilter(e.target.value)}><option value="all">All cases</option><option value="exceptions">Flagged cases</option><option value="approvals">Pending sign-off</option></select></label></div><div className={css.filterGroup}><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Find supplier, invoice or PO" aria-label="Search invoices"/></div></div>
      <div className={css.dataTableWrap}><table className={css.dataTable}><thead><tr><th>Invoice</th><th>Legal entity</th><th>PO</th><th>Value</th><th>Evidence checks</th><th>Decision stage</th><th/></tr></thead><tbody>{filteredInvoices.map(i=><tr key={i.id}><td><strong>{i.number}</strong><small>{i.supplier}</small></td><td>{entityName(i.assignedCompany)}</td><td>{i.poId||"Not referenced"}</td><td><strong>{money(i.amount)}</strong><small>Due {i.due.slice(5)}</small></td><td>{invoiceIssues(i,invoices).length?<Badge type="warn">{invoiceIssues(i,invoices).length} warning(s)</Badge>:<Badge type="good">Checks passed</Badge>}</td><td><Badge type={safeStatus(i.status)}>{statusLabel(i.status)}</Badge></td><td><button className={css.selectRow} onClick={()=>setSelectedInvoiceId(i.id)}>Review <ArrowRight size={13}/></button></td></tr>)}</tbody></table></div>{filteredInvoices.length===0&&<div className={css.empty}>No invoices match these filters.</div>}
     </Panel>
     {selected&&<div className={css.detailGrid}>
      <Panel label="DOCUMENT REVIEW" title={selected.number+" · "+selected.supplier} action={<Badge type={safeStatus(selected.status)}>{statusLabel(selected.status)}</Badge>}>
       <div className={css.stateSteps}>{["Source received","Validation","Human sign-off","Xero staging"].map((n,i)=><span key={n} className={i<=(selected.staged?3:selected.status==="approved"?2:selected.status==="pending_approval"?1:0)?css.active:""}>{n}</span>)}</div>
       <div className={css.detailMini}><div><small>Example document</small><strong>{selected.document}</strong></div><div><small>Amount excl. VAT</small><strong>{money(selected.amount)}</strong></div><div><small>Invoice evidence: legal entity</small><strong>{entityName(selected.sourceCompany)}</strong></div><div><small>VAT (illustrative)</small><strong>{money(selected.vat)}</strong></div></div>
       <div className={css.formGrid}><label className={css.field}>Proposed bookkeeping entity<select value={selected.assignedCompany} disabled={role!=="controller"||selected.status==="approved"||selected.status==="rejected"||selected.staged} onChange={e=>patchInvoice({assignedCompany:e.target.value as EntityId,exceptionApproved:false,status:"received"},"Entity assignment edited")}>{entities.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label><label className={css.field}>Referenced purchase order<select value={selected.poId} disabled={role!=="controller"||selected.status==="approved"||selected.status==="rejected"||selected.staged} onChange={e=>patchInvoice({poId:e.target.value,exceptionApproved:false,status:"received"},"PO reference edited")}><option value="">No purchase order</option>{purchaseOrders.map(x=><option value={x.id} key={x.id}>{x.id} · {x.supplier} · {entityName(x.entity)}</option>)}</select></label></div>
       <div className={css.buttons}><button className={css.primary} onClick={validateSelected} disabled={selected.status==="approved"||selected.status==="rejected"||selected.staged}><FileSearch size={14}/> Validate & prepare approval</button><button className={css.secondary} onClick={approveSelected} disabled={!canApprove(selected,invoices,role)}><CheckCircle2 size={14}/> Controller sign-off</button><button className={css.secondary} onClick={stageSelected} disabled={!canStage(selected,invoices,role)}><FileDown size={14}/> Download Xero staging CSV</button><button className={css.quiet} onClick={rejectSelected} disabled={role!=="controller"||selected.status==="approved"||selected.status==="rejected"||selected.exceptionNote.trim().length<12}>Reject with note</button></div>
       <p className={css.smallTip}>Role permissions, legal entities and PO requirements are example configurations. No invoice is posted to Xero, sent to ApprovalMax or paid. The CSV is not a validated provider import file.</p>
      </Panel>
      <div>
       <Panel label="AUTOMATED EXCEPTION LOGIC" title="Evidence and risk checks" action={<ShieldCheck size={17}/>}>
        {invoiceIssues(selected,invoices).length?invoiceIssues(selected,invoices).map(x=><div className={css.issue} key={x}><AlertCircle size={15}/><span>{x}</span></div>):<div className={css.safe}><CheckCircle2 size={17}/><span>Entity, PO, value and duplicate checks currently pass.</span></div>}
        <div className={css.smallDivider}/>
        <label className={css.field}>Financial Controller exception justification<textarea rows={3} value={selected.exceptionNote} disabled={role!=="controller"||selected.status==="approved"||selected.status==="rejected"||selected.staged} placeholder="Explain why this exception may proceed, citing the evidence and required approval" onChange={e=>patchInvoice({exceptionNote:e.target.value,exceptionApproved:false})}/><small>Use this only when source information cannot be corrected. Exceptions require a documented human decision.</small></label>
        <button className={css.secondary} disabled={role!=="controller"||selected.status==="approved"||selected.exceptionApproved||invoiceIssues(selected,invoices).some(x=>/entity|duplicate|supplier and PO/i.test(x))} onClick={acceptException}><FileCheck2 size={14}/> Accept documented exception</button>
        {selected.exceptionApproved&&<div className={css.safe}><CheckCircle2 size={16}/><span>Exception accepted for routing, subject to separate human sign-off. Issues remain visible.</span></div>}
       </Panel>
       <Panel label="GUARDRAIL" title="Payments remain outside the automation"><div className={css.callout}><b>Human-controlled:</b> automated checks and approval preparation never trigger payments. Live permissions and approval thresholds are configured during implementation.</div><button className={css.quiet} disabled style={{marginTop:14}}><LockKeyhole size={14}/> Execute payment · disabled</button></Panel>
      </div>
     </div>}
    </>}
    {screen==="reconciliations"&&<>
     {page("Bank reconciliations","02 / CROSS-SYSTEM CONTROL","Compare illustrative settlements and financial ledger records from Stripe, GoCardless, bank feeds and Space Manager. Exact matches may be proposed; mismatches must be explained by a person.",<button className={css.secondary} onClick={()=>safeDownload("example-reconciliations.csv",csv([["Reference","Source","External amount","Ledger reference","Ledger amount","Difference","Status"],...banks.map(x=>[x.reference,x.system,x.amount,x.ledgerReference,x.ledgerAmount,x.amount-x.ledgerAmount,bankCheck(x)])]))}><Download size={14}/> Export examples</button>)}
     <div className={css.metrics}><Metric label="Illustrative settlement lines" value={banks.length} sub="Four hypothetical sources"/><Metric label="Exact reference + amount" value={banks.filter(x=>bankCheck(x)==="match").length} sub="Potential auto-matches" tone="accent"/><Metric label="Exceptions outstanding" value={unreconciled.length} sub="Reference, amount or missing entry" tone="alert"/><Metric label="Reviewer-completed checks" value={banks.filter(x=>x.reviewed).length} sub="Notes retained locally"/></div>
     <Panel label="RECONCILIATION QUEUE" title="Suggested ledger matches"><div className={css.dataTableWrap}><table className={css.dataTable}><thead><tr><th>Date / source</th><th>Reference</th><th>Source amount</th><th>Ledger amount</th><th>Difference</th><th>Check result</th><th/></tr></thead><tbody>{banks.map(x=><tr key={x.id}><td><strong>{x.system}</strong><small>{x.date}</small></td><td>{x.reference}</td><td>{money(x.amount)}</td><td>{money(x.ledgerAmount)}</td><td><strong>{money(x.amount-x.ledgerAmount)}</strong></td><td>{x.reviewed?<Badge type={bankCheck(x)==="match"?"good":"warn"}>{bankCheck(x)==="match"?"Match reviewed":"Investigated · "+bankCheck(x)+" difference"}</Badge>:bankCheck(x)==="match"?<Badge type="good">Exact match</Badge>:<Badge type="warn">{bankCheck(x)==="amount"?"Amount mismatch":bankCheck(x)==="reference"?"Reference mismatch":"Missing ledger value"}</Badge>}</td><td><button className={css.selectRow} onClick={()=>{setSelectedBankId(x.id);setReviewNote(x.note);}}>Inspect <ArrowRight size={13}/></button></td></tr>)}</tbody></table></div></Panel>
     <div className={css.grid2}>
      <Panel label="REVIEW THE DIFFERENCE" title={selBank.reference+" · "+selBank.system} action={<Badge type={selBank.reviewed?"good":bankCheck(selBank)==="match"?"good":"warn"}>{selBank.reviewed?"Reviewed":bankCheck(selBank)==="match"?"Candidate match":"Exception"}</Badge>}>
       <div className={css.detailMini}><div><small>External reference</small><strong>{selBank.reference}</strong></div><div><small>Ledger reference</small><strong>{selBank.ledgerReference}</strong></div><div><small>External value</small><strong>{moneyPrecise(selBank.amount)}</strong></div><div><small>Ledger value</small><strong>{moneyPrecise(selBank.ledgerAmount)}</strong></div><div><small>Difference</small><strong>{moneyPrecise(selBank.amount-selBank.ledgerAmount)}</strong></div><div><small>Entity</small><strong>{entityName(selBank.entity)}</strong></div></div>
       {bankCheck(selBank)!=="match"&&<div className={css.issue}><AlertCircle size={16}/><span>Review required: {bankCheck(selBank)==="amount"?"value does not reconcile":bankCheck(selBank)==="reference"?"reference identifiers differ":"corresponding ledger amount is missing"}.</span></div>}
       <label className={css.field}>Document your review<textarea rows={3} value={selBank.reviewed?selBank.note:reviewNote} disabled={role!=="controller"||selBank.reviewed} placeholder="Explain the difference, evidence consulted, and follow-up owner" onChange={e=>setReviewNote(e.target.value)}/></label>
       <button className={css.primary} onClick={reviewBank} disabled={role!=="controller"||selBank.reviewed}><Check size={14}/> Record controller review</button>
       <p className={css.smallTip}>Reviewing an unmatched transaction records the investigation only; it does not force amounts to match, create entries or move money.</p>
      </Panel>
      <Panel label="INTEGRITY RULES" title="Why a bank check can fail">
       <div className={css.rules}>{[
        ["Exact reference match","Payment processor reference must tie to the accounting evidence."],
        ["Amount and sign match","The amounts must agree, including the direction of the transaction."],
        ["Missing or duplicate settlements","Unmatched entries are held for review rather than silently written off."],
        ["Reviewer sign-off","Material differences must carry a note and a named person before closure."]
       ].map(([a,b])=><div key={a}><ShieldCheck size={16}/><div><strong>{a}</strong><p>{b}</p></div></div>)}</div>
      </Panel>
     </div>
    </>}
    {screen==="reporting"&&<>
     {page("Quarterly investor reporting","03 / BOARD & INVESTOR PACK","Explore quarterly reporting with sample financial and operating metrics, potential source mappings and documented human review. All values are illustrative.",<><button className={css.secondary} onClick={exportReport}><Download size={14}/> Export quarter data</button><button className={css.primary} onClick={()=>window.print()}><FileDown size={14}/> Print / Save PDF</button></>)}
     <div className={css.filterBar}><label className={css.viewSwitch}>Reporting period <select value={period} onChange={e=>setPeriod(e.target.value)}>{investorPeriods.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label><Badge type={period.endsWith("F")?"warn":"neutral"}>{period.endsWith("F")?"Illustrative forecast":"Illustrative historical quarter"}</Badge></div>
     <div className={css.metrics}>
      <Metric label="Quarterly revenue" value={money(current.revenue)} sub="Illustrative data only"/>
      <Metric label="Operating result" value={money(current.operatingResult)} sub={"Margin "+current.margin.toFixed(1)+"%"} tone="accent"/>
      <Metric label="Period-end cash" value={money(current.cash)} sub="Snapshot, not sum of quarters"/>
      <Metric label="Illustrative occupancy" value={current.occupancy+"%"} sub="Requires operating source validation"/>
     </div>
     <div className={css.grid2}>
      <Panel label="TREND VIEW" title="Revenue evolution by quarter" action={<span className={css.smallTip}>£ · fictional series</span>}>
       <div className={css.chart}>{investorPeriods.map(x=><div className={css.chartCol} key={x.id}><b>{Math.round(x.revenue/1000)}k</b><div className={css.chartBar+" "+(x.id.endsWith("F")?css.future:"")}><i style={{height:Math.round(x.revenue/340000*100)+"%"}}/></div><small>{x.name.replace(" 20"," '").replace(" · forecast"," F")}</small></div>)}</div>
       <div className={css.chartLegend}><span><i className={css.legendDot}/>Synthetic historical</span><span><i className={css.legendDot+" "+css.forecast}/>Synthetic forecast</span></div>
       <p className={css.smallTip}>All figures are hypothetical. Q4 2026 is a projected scenario, not a completed period.</p>
      </Panel>
      <Panel label="POSSIBLE REPORTING DESIGN" title="Explore sources for a quarterly pack">
       <div className={css.rules}>{[
        ["Xero","Could provide the ledger, period-end balances and cost categories if authorised."],
        ["Stripe & GoCardless","Potential collection sources; existing integrations and accounting treatment need confirmation."],
        ["Space Manager","Possible operating metrics if the product and relevant data are confirmed."],
        ["Finance review","An authorised reviewer would validate values and distribution under agreed rules."]
       ].map(([a,b])=><div key={a}><Database size={16}/><div><strong>{a}</strong><p>{b}</p></div></div>)}</div>
      </Panel>
     </div>
     <div className={css.grid2+" "+css.reportGrid}>
      <Panel label="CUSTOMISE THE BOARD PACK" title="Choose sections to include">
       {["Summary","Exceptions","Source mapping","Approval notice"].map(n=><label className={css.kpiLine} key={n}><span>{n}</span><input type="checkbox" checked={reportSections.includes(n)} onChange={e=>setReportSections(xs=>e.target.checked?[...xs,n]:xs.filter(x=>x!==n))}/></label>)}
       <div className={css.smallDivider}/><label className={css.field}>Controller review notes<textarea rows={3} value={reportNote} onChange={e=>setReportNote(e.target.value)} disabled={role!=="controller"} placeholder="Document checks, source verification, unresolved items and owner." /></label><button className={css.secondary} onClick={signInvestorDraft} disabled={role!=="controller"||reportNote.trim().length<20||reportSigned}><ShieldCheck size={15}/> Record controller review</button><p className={css.smallTip}>{reportSigned?"Review recorded locally for this exact set of figures and sections. Any material changes require another sign-off.":"This remains an unreviewed draft. You can print it for discussion, but it is not a real investor statement."} Export using the browser's Print / Save PDF function.</p>
      </Panel>
      <div className={css.printArea}><div className={css.reportPaper}>
       <div className={css.reportPaperHead}><small>ILLUSTRATIVE FINANCE REPORT · SAMPLE DATA</small><h2>Quarterly investor overview</h2><p>{current.name} · fictional numbers · {reportSigned?"Controller-reviewed DEMO draft":"UNREVIEWED draft"}</p></div>
       <div className={css.reportPaperBody}>
        {reportSections.includes("Summary")&&<section><h3>01 · Financial highlights</h3><p>Modelled revenue {money(current.revenue)}, operating costs {money(current.costs)}, operating result {money(current.operatingResult)} ({current.margin.toFixed(1)}% margin), closing cash {money(current.cash)} and occupancy {current.occupancy}%.</p></section>}
        {reportSections.includes("Exceptions")&&<section><h3>02 · Exceptions requiring attention</h3><p>{unreconciled.length} outstanding example bank exceptions and {flagged.length} invoice validation flags. These are independent synthetic cases and must not be presented as real company issues.</p></section>}
        {reportSections.includes("Source mapping")&&<section><h3>03 · Data lineage plan</h3><p>Illustrative source mapping: Xero for ledger figures, Stripe or GoCardless for collections, Space Manager for potential operating metrics and SharePoint as an optional archive. The connections are proposed; all financial figures are synthetic.</p></section>}
        {reportSections.includes("Approval notice")&&<section><h3>04 · Approval and distribution</h3><p>{reportSigned?"Controller review documented in this browser. Notes: "+(reportReview?.note||""):"Unreviewed: controller must validate all reconciliations, adjustments, periods and commentary."} All data are fictional and never approved for actual investor distribution.</p></section>}
       </div><div className={css.reportPaperFoot}>Demonstration only · No source verification · Not an actual investor statement</div>
      </div></div>
     </div>
    </>}
    {screen==="spend"&&<>
     {page("Purchase orders & card spending","04 / EXPENDITURE CONTROL · SAMPLE POLICY","Explore how Monday.com purchase orders and supporting evidence could help review card expenses. PO requirements and receipt rules are configurable examples.")}
     <div className={css.metrics}>
      <Metric label="Example purchase orders" value={purchaseOrders.length} sub="Monday.com connector proposed"/>
      <Metric label="Card transactions" value={cards.length} sub="Invented merchant records"/>
      <Metric label="Missing card receipts" value={cards.filter(x=>!x.receipt).length} sub="Follow-up with card holder" tone="alert"/>
      <Metric label="Card policy flags" value={cards.reduce((n,x)=>n+cardIssues(x).length,0)} sub="PO and receipt exceptions"/>
     </div>
     <div className={css.grid2}>
      <Panel label="PURCHASING / MONDAY.COM" title="Purchase order register" action={<Badge>Not connected</Badge>}>
       <div className={css.dataTableWrap}><table className={css.dataTable}><thead><tr><th>PO</th><th>Supplier / owner</th><th>Entity</th><th>Approved value</th><th>Status</th></tr></thead><tbody>{purchaseOrders.map(x=><tr key={x.id}><td><strong>{x.id}</strong></td><td><strong>{x.supplier}</strong><small>{x.owner}</small></td><td>{entityName(x.entity)}</td><td><strong>{money(x.amount)}</strong></td><td><Badge type={x.status==="received"?"good":"neutral"}>{x.status}</Badge></td></tr>)}</tbody></table></div>
      </Panel>
      <Panel label="EXAMPLE POLICY CHECKS" title="Illustrative purchasing controls">
       <div className={css.rules}>{[
        ["Check PO where required","Identify which expense categories actually require a PO, then validate supplier, entity and value."],
        ["Match invoice to PO","When policy requires an order, route missing or excessive values for review."],
        ["Validate card evidence","Chase receipts and categorisation; never assume an unexplained payment is valid."],
        ["Require sign-off","Preserve company approval limits and authority."]
       ].map(([a,b])=><div key={a}><ShieldCheck size={16}/><div><strong>{a}</strong><p>{b}</p></div></div>)}</div>
      </Panel>
     </div>
     <div className={css.grid2}>
      <Panel label="CARD SPEND / EXAMPLE FEED" title="Transactions requiring evidence">
       <div className={css.dataTableWrap}><table className={css.dataTable}><thead><tr><th>Merchant / holder</th><th>Amount</th><th>Document checks</th><th/></tr></thead><tbody>{cards.map(x=><tr key={x.id}><td><strong>{x.merchant}</strong><small>{x.holder}</small></td><td><strong>{money(x.amount)}</strong></td><td>{cardIssues(x).length?<Badge type="warn">{cardIssues(x).length} issue(s)</Badge>:<Badge type="good">Evidence present</Badge>}</td><td><button className={css.selectRow} onClick={()=>setSelectedCardId(x.id)}>Review <ArrowRight size={13}/></button></td></tr>)}</tbody></table></div>
      </Panel>
      <Panel label="CARD EXCEPTION" title={selCard.merchant} action={<Badge type={cardIssues(selCard).length?"warn":"good"}>{cardIssues(selCard).length?cardIssues(selCard).length+" flag(s)":"Evidence complete"}</Badge>}>
       <div className={css.detailMini}><div><small>Card holder</small><strong>{selCard.holder}</strong></div><div><small>Transaction</small><strong>{money(selCard.amount)}</strong></div><div><small>Legal entity</small><strong>{entityName(selCard.entity)}</strong></div><div><small>Category</small><strong>{selCard.category}</strong></div></div>
       {cardIssues(selCard).map(x=><div className={css.issue} key={x}><AlertCircle size={16}/>{x}</div>)}
       <label className={css.field}>PO reference (simulation)<select value={selCard.poId} disabled={role!=="controller"} onChange={e=>{setCards(xs=>xs.map(x=>x.id===selCard.id?{...x,poId:e.target.value}:x));log("Card PO reference edited",selCard.merchant);}}><option value="">No purchase order</option>{purchaseOrders.filter(p=>p.entity===selCard.entity).map(p=><option key={p.id} value={p.id}>{p.id} · {p.supplier}</option>)}</select></label>
       <label className={css.kpiLine}><span>Receipt obtained and checked (simulation)</span><input type="checkbox" checked={selCard.receipt} disabled={role!=="controller"} onChange={e=>{setCards(xs=>xs.map(x=>x.id===selCard.id?{...x,receipt:e.target.checked}:x));log("Card evidence amended",selCard.merchant);}}/></label>
       <p className={css.smallTip}>The simulated Controller can amend card evidence, but real responsibilities and PO/receipt policies are unconfirmed. No card provider is connected and no spend is authorised.</p>
      </Panel>
     </div>
    </>}
    {screen==="automation"&&<>
     {page("Approval-first workflow blueprint","05 / PROPOSED OPERATING DESIGN","Explore an approval-first approach using existing finance tools. The workflow and checks are illustrative, with configurable rules and human decisions.",<button className={css.primary} onClick={()=>navigate("invoices")}>Try invoice review <ArrowRight size={14}/></button>)}
     <div className={css.grid2}>
      <Panel label="TARGET WORKFLOW" title="Six verifiable stages" action={<Badge type="good">Payments excluded</Badge>}>
       <div className={css.flow}>{phases.map((p,i)=><div className={css.flowStep} key={p.n}><div className={css.flowRail}><span>{p.n}</span>{i<phases.length-1&&<i/>}</div><div className={css.flowInfo}><div><strong>{p.title}</strong><small>{p.owner}</small></div><p>{p.detail}</p></div></div>)}</div>
      </Panel>
      <div>
       <Panel label="EXAMPLE VALIDATION RULES" title="What could be checked">
        <div className={css.rules}>{[
         ["Company allocation","Compare invoice evidence, internal company and PO company."],
         ["PO and amount","If a PO is required under the agreed policy, validate its reference, entity and approved amount."],
         ["Duplicate detection","Flag matching supplier and invoice number, even across batches."],
         ["Approval routing","Create a draft request and wait for a controller to approve."],
         ["Audit evidence","Keep every explanation, correction and reviewer decision visible."]
        ].map(([a,b])=><div key={a}><CheckCircle2 size={16}/><div><strong>{a}</strong><p>{b}</p></div></div>)}</div>
        <div className={css.buttons}><button className={css.primary} disabled={role!=="controller"} onClick={validateBatch}><Sparkles size={15}/> Run example AP validation</button><button className={css.secondary} onClick={()=>navigate("invoices")}>See review queue</button></div>
       </Panel>
       <Panel label="NON-NEGOTIABLE" title="People in charge of approvals and payments">
        <div className={css.callout}><b>Human-in-the-loop:</b> authorised finance staff review evidence and make approval and payment decisions. Live permissions and thresholds are configurable; no payments are executed here.</div>
       </Panel>
      </div>
     </div>
     <Panel label="POTENTIAL LATER MODULES" title="One workflow first. Expand once the pilot is reliable."><div className={css.capGrid}>{scenarios.slice(1).map((x,i)=>{const Icon=[GitBranch,BarChart3,WalletCards][i],routes:Screen[]=["reconciliations","reporting","spend"];return <button className={css.cap} key={x.id} onClick={()=>navigate(routes[i])}><Icon size={20}/><strong>{x.title}</strong><span>{x.value}</span><small>OPTIONAL CAPABILITY</small></button>})}</div></Panel>
    </>}
    {screen==="integrations"&&<>
     {page("Connected ecosystem","06 / SYSTEM ECOSYSTEM · CONCEPT MAP","Explore how finance, purchasing, document and payment tools could work together. The connections shown are conceptual, not live integrations.")}
     <div className={css.discoveryNotice}><ShieldCheck size={17}/><span><b>Existing tools, potential connections.</b> Supplier inbox, Hubdoc, Xero and ApprovalMax form the described invoice route. Other data flows on this page illustrate possible integrations. No software connection is active in this demonstration.</span></div>
     <SystemMap open={navigate}/>
     <div className={css.connectorGrid}>{connectors.map(c=><div className={css.connector} key={c.name}><Link2 size={20}/><strong>{c.name}</strong><p>{c.role}</p><small>{c.category.toUpperCase()} · DEMO NOT CONNECTED</small></div>)}</div>
     <div style={{height:12}}/>
     <Panel label="SECURITY & DELIVERY REQUIREMENTS" title="Conditions for a real implementation"><div className={css.rules}>{[
      ["Entity separation and permissions","Confirm which company owns each record and which staff may view or approve it."],
      ["Document handling","Encrypt stored documents; retain references and delete under an agreed retention policy."],
      ["API review and sandbox testing","Use provider-supported authentication and test with permitted sample records."],
      ["Auditability","Log who corrected a supplier, changed a company, approved an exception or released a report."],
      ["Human payment authority","Payment authorisation and execution remain with designated people outside this workflow."]
     ].map(([a,b])=><div key={a}><ShieldCheck size={16}/><div><strong>{a}</strong><p>{b}</p></div></div>)}</div></Panel>
    </>}
    {screen==="agents"&&<>
     {page("Potential AI assistants","OPTIONAL CAPABILITIES · RULE-BASED CONCEPTS","Explore specialist tasks for document intake, validation, exception handling, reconciliation, reporting and spending. Each example uses rule-based simulation and synthetic records.")}
     <Specialists invoice={selected} invoices={invoices} bank={selBank} card={selCard} period={period} open={navigate} selectInvoice={setSelectedInvoiceId} selectBank={id=>{setSelectedBankId(id);setReviewNote("")}} selectCard={setSelectedCardId} banks={banks} cards={cards} selectPeriod={setPeriod} quarters={investorPeriods}/>
    </>}
    {screen==="assistant"&&<>
     {page("Finance AI guide","07 / EXPLAINABILITY & USER SUPPORT","Ask how the proposed processes work, why an invoice is flagged, or what the sample numbers mean. This prototype uses deterministic answers; a production assistant would require secured, source-grounded access.")}
     <div className={css.grid2}>
      <div className={css.chatBox}><div className={css.chatTop}><span className={css.chatAvatar}><Bot size={19}/></span><div><strong>Finance operations guide</strong><small>Rules-based demo · no external AI calls</small></div><Badge type="neutral">Simulation</Badge></div><div className={css.chatMessages} role="log" aria-live="polite">{messages.map(m=><div key={m.id} className={m.from==="user"?css.userMessage:css.chatMessage}><strong>{m.from==="user"?"You":"Guide · simulated"}</strong><p>{m.text}</p></div>)}</div><form className={css.chatForm} onSubmit={e=>{e.preventDefault();ask();}}><input placeholder="Ask about invoices, reconciliations, controls..." value={chatInput} onChange={e=>setChatInput(e.target.value)} aria-label="Ask finance guide"/><button type="submit" aria-label="Send question"><Send size={16}/></button></form><div className={css.chatHints}>{["Which invoices need review?","Can AI approve payments?","How does bank reconciliation work?","What would the pilot include?"].map(q=><button key={q} onClick={()=>ask(q)}>{q}</button>)}</div></div>
      <div>
       <Panel label="GUARDRAILS" title="What an implementation-ready assistant needs">
        <div className={css.rules}>{[
         ["Verified data access","Answers grounded in authorised Xero, Hubdoc and SharePoint records, not model guesses."],
         ["Role-aware explanations","Director-facing summaries and controller-level evidence, with permissions defined by the organisation."],
         ["Reviewable recommendations","AI suggests; financial staff decide. No autonomous bank or approval actions."],
         ["Traceability","Link each recommendation to a source record and explain confidence and limitations."]
        ].map(([a,b])=><div key={a}><ShieldCheck size={16}/><div><strong>{a}</strong><p>{b}</p></div></div>)}</div>
       </Panel>
       <Panel label="IMPLEMENTATION FOUNDATIONS" title="Configurable workflow inputs">
        <div className={css.alertList}>{["Supplier volume and company structure","Document capture and data quality rules","Purchase-order requirements and permitted exceptions","Human approval limits and access permissions","Reporting definitions and reconciliation sources"].map(q=><div className={css.alertItem} key={q}><MessageCircle size={16}/><div><p>{q}</p></div></div>)}</div>
       </Panel>
      </div>
     </div>
    </>}
    {screen==="roadmap"&&<>
     {page("Implementation plan","08 / DELIVERY DESIGN","Explore an incremental approach: configure existing capabilities, validate one finance workflow, expand based on measured value and document the handover.")}
     <div className={css.grid2}>
      <Panel label="PRIORITISED DELIVERY" title="Proposed staged delivery">
       <div className={css.flow}>{[
        {n:"01",title:"Process and baseline",owner:"Review existing workflows",detail:"Map volumes, company allocation, exceptions, approvals and current handling time."},
        {n:"02",title:"Accounts payable pilot",owner:"First implementation candidate",detail:"Connect approved source feeds; extract PDF metadata; validate entity and PO; queue exceptions; preserve ApprovalMax and human sign-off."},
        {n:"03",title:"Reconciliations",owner:"After pilot acceptance",detail:"Introduce matching for payment-system references with a human-controlled exception workflow."},
        {n:"04",title:"Investor reporting and spend controls",owner:"Subsequent implementation",detail:"Prepare quarterly reporting with reconciled sources; expand to Monday.com PO policy and card receipts."},
        {n:"05",title:"Handover and adoption",owner:"Ongoing",detail:"Train the bookkeeper/Financial Controller, document decisions, test edge cases and measure saved time."}
       ].map((x,i,a)=><div className={css.flowStep} key={x.n}><div className={css.flowRail}><span>{x.n}</span>{i<a.length-1&&<i/>}</div><div className={css.flowInfo}><div><strong>{x.title}</strong><small>{x.owner}</small></div><p>{x.detail}</p></div></div>)}</div>
       <p className={css.smallTip}>Indicative delivery sequence. Final scope, schedule and cost depend on system access, policies and requirements.</p>
      </Panel>
      <div>
       <Panel label="ILLUSTRATIVE VALUE SCENARIO" title="Estimate the first AP use case">
        <p className={css.panelIntro}>Adjust the example assumptions to explore possible time released. These figures do not represent measured operations or guaranteed savings.</p>
        <div className={css.formGrid}><label className={css.field}>Supplier invoices per week<input type="number" min="0" value={weeklyVolume} onChange={e=>setWeeklyVolume(Math.max(0,Number(e.target.value)||0))}/></label><label className={css.field}>Current minutes per invoice<input type="number" min="0" value={minutes} onChange={e=>setMinutes(Math.max(0,Number(e.target.value)||0))}/></label><label className={css.field}>Loaded value per hour (£)<input type="number" min="0" value={hourlyRate} onChange={e=>setHourlyRate(Math.max(0,Number(e.target.value)||0))}/></label><label className={css.field}>One-off implementation (£)<input type="number" min="0" value={setupCost} onChange={e=>setSetupCost(Math.max(0,Number(e.target.value)||0))}/></label></div>
        <div className={css.roiSlider}><label>Share of time automatable <b>{coverage}%</b></label><input type="range" min="0" max="95" step="5" value={coverage} onChange={e=>setCoverage(Number(e.target.value))}/></div>
        <div className={css.roiSlider}><label>Realisation of released time <b>{realisation}%</b></label><input type="range" min="0" max="100" step="5" value={realisation} onChange={e=>setRealisation(Number(e.target.value))}/></div>
        <label className={css.field}>Monthly infrastructure / service cost (£)<input type="number" min="0" value={monthlyCost} onChange={e=>setMonthlyCost(Math.max(0,Number(e.target.value)||0))}/></label>
        <div className={css.smallDivider}/>
        <div className={css.kpiLine}><span>Annual baseline processing effort</span><strong>{Math.round(roi.baseline).toLocaleString()} h</strong></div>
        <div className={css.kpiLine}><span>Potential annual capacity released</span><strong>{Math.round(roi.freed).toLocaleString()} h</strong></div>
        <div className={css.kpiLine}><span>Nominal value of this capacity</span><strong>{money(roi.value)}</strong></div>
        <div className={css.kpiLine}><span>First-year nominal net value</span><strong>{money(roi.netNominal)}</strong></div>
        <div className={css.roiSlider}><label>Share turned into real cash savings <b>{cashPct}%</b></label><input type="range" min="0" max="100" step="5" value={cashPct} onChange={e=>setCashPct(Number(e.target.value))}/></div>
        <div className={css.kpiLine}><span>First-year cash-based net</span><strong>{money(roi.netCash)}</strong></div>
        <p className={css.finePrint}>Released capacity is not necessarily cash saved. Default cash conversion is 0%. This scenario calculator is not a measured financial result or quotation.</p>
       </Panel>
       <Panel label="ILLUSTRATIVE OPTIONS" title="Select a focus area">
        <p className={css.panelIntro}>Select a workstream to preview an illustrative starting point.</p>
        {scenarios.map(s=><label className={css.kpiLine} key={s.id}><span>{s.title}</span><input type="radio" name="pilot" checked={pickedPilot===s.id} onChange={()=>setPickedPilot(s.id)}/></label>)}
        <div className={css.callout} style={{marginTop:14}}><b>Suggested first pilot:</b> {scenarios.find(x=>x.id===pickedPilot)?.value}. Scope and integrations can be configured for the selected workflow.</div>
       </Panel>
      </div>
     </div>
    </>}
    <footer className={css.footer}><span>Finance operations · Interactive concept by SC-Analytics</span><span>All values, documents and financial records fictional · Local-browser actions only · No live system access</span></footer>
   </main>
  </div>
 </div>;
}
