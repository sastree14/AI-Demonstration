"use client";

import {useEffect,useMemo,useState} from "react";
import {
 AlertCircle,ArrowDownRight,ArrowRight,ArrowUpRight,BarChart3,Bell,BookOpen,Bot,BriefcaseBusiness,
 Check,CheckCircle2,ChevronDown,ChevronRight,ClipboardCheck,Clock3,Cloud,Database,Download,
 FileCheck2,FileDown,FileSearch,FileText,GitBranch,Inbox,LayoutDashboard,Link2,LockKeyhole,
 Mail,Menu,MessageCircle,Plus,RefreshCw,Search,Send,Settings2,ShieldCheck,SlidersHorizontal,
 Sparkles,TrendingUp,Upload,Users,WalletCards,Workflow,X
} from "lucide-react";
import {
 type Invoice,type InvoiceStatus,type BankLine,type CardSpend,type Audit,type EntityId,
 entities,seedInvoices,seedBank,cardSpends,purchaseOrders,investorPeriods,scenarios,
 money,moneyPrecise,entityName,invoiceIssues,canRoute,canApprove,bankCheck,cardIssues,
 investorMetrics,calculateRoi,csv,safeDownload,canStage
} from "./engine";
import css from "./wigwam.module.css";
import GuidedJourney from "./GuidedJourney";

type Screen="overview"|"journey"|"invoices"|"reconciliations"|"reporting"|"spend"|"automation"|"integrations"|"assistant"|"roadmap";
type Role="director"|"controller";
type Conversation={id:string;from:"user"|"assistant";text:string};
type Store={invoices:Invoice[];bank:BankLine[];cards:CardSpend[];audit:Audit[]};
const storageKey="sc-wigwam-finance-provisional-v1";
const menuGroups:{title:string;items:{id:Screen;label:string;icon:typeof LayoutDashboard}[]}[]=[
 {title:"WORKSPACE",items:[
  {id:"overview",label:"Command centre",icon:LayoutDashboard},
  {id:"journey",label:"Guided AP walkthrough",icon:Waypoints},
  {id:"invoices",label:"Supplier invoices",icon:Inbox},
  {id:"reconciliations",label:"Bank reconciliations",icon:GitBranch},
  {id:"reporting",label:"Investor reporting",icon:BarChart3},
  {id:"spend",label:"POs & card spending",icon:WalletCards}
 ]},
 {title:"AUTOMATION & DELIVERY",items:[
  {id:"automation",label:"Workflow blueprint",icon:Workflow},
  {id:"integrations",label:"Connected ecosystem",icon:Cloud},
  {id:"assistant",label:"Finance AI guide",icon:Bot},
  {id:"roadmap",label:"Implementation plan",icon:ClipboardCheck}
 ]}
];
const names:Record<Screen,string>={
 overview:"Command centre",journey:"Guided AP walkthrough",invoices:"Supplier invoices",reconciliations:"Bank reconciliations",reporting:"Investor reporting",
 spend:"POs & card spending",automation:"Workflow blueprint",integrations:"Connected ecosystem",assistant:"Finance AI guide",roadmap:"Implementation plan"
};
const phases=[
 {n:"01",title:"Shared finance inbox",owner:"Outlook / shared email",detail:"PDF arrives with supplier, total, invoice date and potentially an entity name",state:"Source intake"},
 {n:"02",title:"Document capture",owner:"Hubdoc / document parsing",detail:"Extract fields and retain a link to the source invoice; never invent missing evidence",state:"AI-assisted"},
 {n:"03",title:"Entity and PO validation",owner:"Xero entities + Monday.com POs",detail:"Check legal entity, supplier, authorised PO value, duplicates and missing fields",state:"Rules + AI"},
 {n:"04",title:"Finance exception queue",owner:"Financial Controller",detail:"Wrong-company invoices, missing POs or discrepancies wait for documented review",state:"Human review"},
 {n:"05",title:"Approval request",owner:"ApprovalMax",detail:"Create a proposal to approve, preserving the existing business approval policy",state:"Human approval"},
 {n:"06",title:"Reviewed Xero hand-off",owner:"Bookkeeper / Financial Controller",detail:"Prepare approved data for booking; no automatic payments or journal posting in the demo",state:"Controlled export"}
];
const connectors=[
 {name:"Shared finance inbox",category:"Capture",role:"Supplier PDF intake, metadata and audit of original messages",status:"Proposed"},
 {name:"Hubdoc",category:"Capture",role:"Existing document capture and source references",status:"Proposed"},
 {name:"Xero",category:"Accounting",role:"Entity ledgers, invoice records, balances and bookkeeping hand-off",status:"Proposed"},
 {name:"ApprovalMax",category:"Approval",role:"Keep existing approval routing and human decision authority",status:"Proposed"},
 {name:"Monday.com",category:"Purchasing",role:"Retrieve purchase orders and match supplier, entity and limits",status:"Proposed"},
 {name:"Stripe",category:"Collections",role:"Compare settlement exports and accounting entries",status:"Proposed"},
 {name:"GoCardless",category:"Collections",role:"Reconcile direct debit receipts and payment references",status:"Proposed"},
 {name:"Space Manager",category:"Operations",role:"Explore property/operational data relevant to financial checks",status:"Proposed"},
 {name:"SharePoint",category:"Documents",role:"Controlled storage, policies, invoices and investor-pack evidence",status:"Proposed"},
 {name:"Power Automate",category:"Orchestration",role:"Connect events, notifications and reviewer-controlled tasks",status:"Proposed"}
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
  return "The first proposed pilot is supplier invoice handling: shared inbox → Hubdoc → entity/PO/duplicate checks → finance exception review → ApprovalMax → controlled Xero hand-off. This sample contains "+problem.length+" invoices with outstanding validation flags. The solution should reduce repetitive routing while preserving Finance Controller sign-off. None of these integrations are currently connected.";
 }
 if(/approve|pay|payment|sign.?off|policy|control|human|security/.test(q)){
  return "People remain accountable. The rules engine can identify issues and prepare an approval request, but only the simulated Financial Controller view can mark an invoice approved. This is a UI demonstration, not authentication. There is intentionally no payment execution, bank instruction or live Xero posting.";
 }
 if(/company|entity|legal|wrong|duplicate|po\b|purchase/.test(q)){
  return "Entity validation compares the invoice's demonstrated legal entity with its proposed bookkeeping entity and the company on the PO. The sample Northpoint Security invoice is deliberately assigned to the wrong company; Westfield Repairs has a missing PO and a duplicate number. Open Supplier invoices to correct fields and inspect evidence.";
 }
 if(/bank|stripe|gocardless|reconcil|settlement|match/.test(q)){
  const mismatches=bank.filter(x=>bankCheck(x)!=="match");
  return "The reconciliation view proposes matches across fictional Stripe, GoCardless, bank transfers and operational references. "+mismatches.length+" sample rows have a missing item, a reference mismatch or a value discrepancy. Exceptions require a documented human review, and marking them reviewed never changes ledger balances.";
 }
 if(/report|quarter|investor|dashboard|forecast/.test(q)){
  return "The investor pack compares modelled quarterly revenue, operating result, period-end cash and occupancy. Source categories would be Xero, payment systems and Space Manager, with a controller review before distribution. All figures are illustrative, and the Q4 2026 bar is marked as a forecast rather than an actual.";
 }
 if(/roi|value|save|cost|hour|money|budget/.test(q)){
  return "The opportunity model calculates estimated time released from invoices per week × minutes each × automatable share × realised share. It separates nominal productive-capacity value from actual cash savings, defaulting cash conversion to zero. We need Sarah's baseline volumes and labour costs before treating any result as a business case.";
 }
 if(/nick|sarah|director|controller|role/.test(q)){
  return "Director view highlights risks, progress and a concise financial snapshot. Financial Controller view adds simulated sign-off and review actions. Switching roles does not provide actual security; a production system would use authenticated permissions in a backend.";
 }
 if(/implement|roadmap|phase|pilot|connect|system/.test(q)){
  return "Start by validating invoice counts, entity structure, PO policy, permissions, and exception rules with Nick and Sarah. Then implement one supplier-invoice workflow with approval preserved, test on approved historical samples, and expand to reconciliations, quarterly investor reporting and card controls only after pilot acceptance.";
 }
 return "This prototype offers a rules-based explanation of the supplied requirements rather than an LLM connected to company data. Try asking: Which invoices require review? How would approval work? What bank mismatches exist? How would quarterly reporting be prepared?";
}

export default function WigwamFinanceDemo(){
 const [screen,setScreen]=useState<Screen>("overview");
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
    setInvoices(saved.invoices);setBanks(saved.bank);setCards(saved.cards);setAudit(saved.audit);
   }
  }catch{}
  setHydrated(true);
 },[]);
 useEffect(()=>{if(hydrated){try{localStorage.setItem(storageKey,JSON.stringify({invoices,bank:banks,cards,audit}));}catch{}}},[invoices,banks,cards,audit,hydrated]);
 const flagged=useMemo(()=>invoices.filter(x=>x.status!=="rejected"&&invoiceIssues(x,invoices).length>0),[invoices]);
 const awaiting=useMemo(()=>invoices.filter(x=>x.status==="pending_approval"),[invoices]);
 const unreconciled=useMemo(()=>banks.filter(x=>!x.reviewed&&bankCheck(x)!=="match"),[banks]);
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
  if(issues.length>0&&!selected.exceptionApproved){
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
  const existing=invoices.find(x=>x.id==="journey-demo"&&!x.staged&&x.status!=="rejected");
  if(existing){setSelectedInvoiceId(existing.id);setNotice("The latest sample is already available. Correct its entity and run the checks.");return;}
  const sample:Invoice={id:"journey-demo",number:"NS-DEMO-6041",supplier:"Northpoint Security",date:"2026-11-23",due:"2026-12-15",amount:3690,vat:738,sourceCompany:"property",assignedCompany:"operating",poId:"PO-1022",document:"fictional-Northpoint-6041.pdf",status:"received",exceptionApproved:false,exceptionNote:"",booked:false,staged:false};
  setInvoices(xs=>[sample,...xs.filter(x=>x.id!=="journey-demo")]);
  setSelectedInvoiceId(sample.id);
  log("Demonstration intake","Fictional supplier PDF arrived via simulated inbox → Hubdoc (no external connection)");
  setNotice("A new synthetic supplier invoice has arrived. Review entity assignment before any approval.");
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
  safeDownload("wigwam-synthetic-accounts-payable.csv",csv([["Invoice","Supplier","Legal entity","PO","Amount GBP","Status","Issues","Exception note"],
   ...invoices.map(i=>[i.number,i.supplier,entityName(i.assignedCompany),i.poId,i.amount,statusLabel(i.status),invoiceIssues(i,invoices).join("; "),i.exceptionNote])]));
 }
 function exportReport(){
  safeDownload("wigwam-synthetic-investor-quarters.csv",csv([["Period","Status","Revenue GBP","Operating costs GBP","Operating result GBP","Closing cash GBP","Collections GBP","Occupancy percent"],
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
 const reportSignature=JSON.stringify({period,reportSections,inv:invoices.map(x=>[x.id,x.status,x.assignedCompany,x.poId,x.exceptionApproved]),bank:banks.map(x=>[x.id,x.reviewed,x.note])});
 const reportSigned=reportReview?.signature===reportSignature;
 return <div className={css.shell}>
  {menuOpen&&<button className={css.mobileBackdrop} aria-label="Close navigation" onClick={()=>setMenuOpen(false)}/>}
  <aside className={menuOpen?css.sidebar+" "+css.sidebarOpen:css.sidebar}>
   <div className={css.brand}><span className={css.brandLogo}>W</span><div><strong>WIGWAM FINANCE</strong><small>OPERATIONS INTELLIGENCE</small></div><button className={css.brandClose} onClick={()=>setMenuOpen(false)} aria-label="Close navigation"><X size={18}/></button></div>
   <div className={css.sideCase}><small>PROPOSED WORKSPACE</small><strong>Wigwam Storage</strong><span>Finance operations · UK</span></div>
   <nav className={css.navScroll}>{menuGroups.map(g=><div className={css.navGroup} key={g.title}><p>{g.title}</p>{g.items.map(navLink)}</div>)}</nav>
   <div className={css.sidebarFoot}><div><ShieldCheck size={14}/> <strong>Approval-first architecture</strong></div><p>All financial examples fictitious. No live connections, bank actions or AI model calls.</p></div>
  </aside>
  <div className={css.main}>
   <header className={css.topbar}><div className={css.crumb}><button className={css.menu} onClick={()=>setMenuOpen(true)} aria-label="Open navigation"><Menu size={19}/></button><span>FINANCE OPERATIONS</span><ChevronRight size={14}/><strong>{names[screen]}</strong></div><div className={css.topRight}><span className={css.simulation}><i/> DEMONSTRATION</span><label className={css.viewSwitch}><span>Perspective</span><select value={role} onChange={e=>switchRole(e.target.value as Role)}><option value="director">Director view</option><option value="controller">Financial Controller view</option></select></label></div></header>
   <main className={css.work}>
    {notice&&<div className={css.banner} role="status"><CheckCircle2 size={16}/><span>{notice}</span><button onClick={()=>setNotice("")} aria-label="Dismiss"><X size={14}/></button></div>}
    {screen==="journey"&&<>
     {page("Guided supplier invoice walkthrough","LIVE CLIENT STORY / FIRST AP PILOT","A single connected story for Nick and Sarah: synthetic invoice arrival, rule-based validation, finance correction, human approval and download of an approved-only staging file.",<button className={css.secondary} onClick={reset}><RefreshCw size={14}/> Reset the fictional scenario</button>)}
     <GuidedJourney invoices={invoices} selected={selected} role={role} create={createGuidedInvoice} pick={setSelectedInvoiceId} patch={patchInvoice} validate={validateSelected} acceptException={acceptException} approve={approveSelected} stage={stageSelected} changeRole={switchRole} openQueue={()=>navigate("invoices")}/>
    </>}
    {screen==="overview"&&<>
     <div className={css.hero}>
      <div className={css.heroBody}><p className={css.eyebrow}>A PRACTICAL STARTING POINT FOR NICK & SARAH</p><h1>One controlled finance workflow. Fewer manual hand-offs.</h1><p>Explore how supplier invoices, entity checks, purchase orders and human approvals could work together — then expand into reconciliations, quarterly reporting and spend controls.</p><div className={css.heroBtns}><button className={css.primary} onClick={()=>navigate("journey")}>Run guided AP walkthrough <ArrowRight size={15}/></button><button className={css.secondary} onClick={()=>navigate("automation")}>See proposed architecture <GitBranch size={15}/></button></div><small>Concept demonstrator · Synthetic UK financial data · No accounts or payment systems connected</small></div>
      <div className={css.heroAside}><small>FIRST PILOT PRIORITY</small><strong>Supplier invoice processing</strong><div><b>{flagged.length}</b><span>sample invoices<br/>requiring investigation</span></div><p>Entity assignment, missing PO references, suspected duplicates and an approval trail — without autonomous payments.</p></div>
     </div>
     <div className={css.metrics}>
      <Metric label="Open supplier invoices" value={invoices.filter(x=>x.status!=="approved"&&x.status!=="rejected").length} sub="Fictional shared-inbox cases"/>
      <Metric label="Validation exceptions" value={flagged.length} sub="Require evidence or review" tone="alert"/>
      <Metric label="Awaiting human sign-off" value={awaiting.length} sub="No automatic approval"/>
      <Metric label="Bank mismatches" value={unreconciled.length} sub="Unresolved sample reconciliation lines" tone="accent"/>
     </div>
     <div className={css.grid2}>
      <Panel label="01 / SUPPLIER INVOICES" title="From a fragmented process to controlled review" action={<button className={css.textLink} onClick={()=>navigate("automation")}>Full workflow <ArrowRight size={13}/></button>}>
       <div className={css.flow+" "+css.flowCompact}>{phases.map((p,i)=><div className={css.flowStep} key={p.n}><div className={css.flowRail}><span>{p.n}</span>{i<phases.length-1&&<i/>}</div><div className={css.flowInfo}><div><strong>{p.title}</strong><small>{p.state}</small></div><p>{p.detail}</p></div></div>)}</div>
       <div className={css.callout}><b>Important:</b> automation prepares and routes information; Sarah or another authorised controller still decides on exceptions and approvals.</div>
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
      <p className={css.smallTip}>Demonstration actions are saved in this browser only. They are not connected to Wigwam's systems.</p>
     </Panel>
    </>}
    {screen==="invoices"&&<>
     {page("Supplier invoices","01 / ACCOUNTS PAYABLE","A practical response to the shared inbox → Hubdoc → Xero → ApprovalMax logjam. Inspect each example, correct company allocation, check purchase orders and record an auditable human approval.",<><button className={css.secondary} onClick={()=>navigate("journey")}><Waypoints size={14}/> Guided walkthrough</button><button className={css.secondary} onClick={exportInvoices}><Download size={14}/> Export example CSV</button><button className={css.primary} onClick={validateBatch}><Sparkles size={15}/> Validate received invoices</button></>)}
     <div className={css.metrics}>
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
       <p className={css.smallTip}>Controller-only approval and accounting CSV staging are local demonstrations. NO invoice is posted to Xero, transmitted to ApprovalMax, or paid. The exported CSV is not a provider-specific import guarantee.</p>
      </Panel>
      <div>
       <Panel label="AUTOMATED EXCEPTION LOGIC" title="Evidence and risk checks" action={<ShieldCheck size={17}/>}>
        {invoiceIssues(selected,invoices).length?invoiceIssues(selected,invoices).map(x=><div className={css.issue} key={x}><AlertCircle size={15}/><span>{x}</span></div>):<div className={css.safe}><CheckCircle2 size={17}/><span>Entity, PO, value and duplicate checks currently pass.</span></div>}
        <div className={css.smallDivider}/>
        <label className={css.field}>Financial Controller exception justification<textarea rows={3} value={selected.exceptionNote} disabled={role!=="controller"||selected.status==="approved"||selected.status==="rejected"||selected.staged} placeholder="Explain why this exception may proceed, citing the evidence and required approval" onChange={e=>patchInvoice({exceptionNote:e.target.value,exceptionApproved:false})}/><small>Use this only when source information cannot be corrected. Exceptions require a documented human decision.</small></label>
        <button className={css.secondary} disabled={role!=="controller"||selected.status==="approved"||selected.exceptionApproved||invoiceIssues(selected,invoices).some(x=>/entity|duplicate|supplier and PO/i.test(x))} onClick={acceptException}><FileCheck2 size={14}/> Accept documented exception</button>
        {selected.exceptionApproved&&<div className={css.safe}><CheckCircle2 size={16}/><span>Exception accepted for routing, subject to separate human sign-off. Issues remain visible.</span></div>}
       </Panel>
       <Panel label="GUARDRAIL" title="Payments remain outside the automation"><div className={css.callout}><b>Non-negotiable:</b> automated checks and draft approval packets never trigger a bank payment. The real user and approval model would need to be confirmed with Nick and Sarah.</div><button className={css.quiet} disabled style={{marginTop:14}}><LockKeyhole size={14}/> Execute payment · disabled</button></Panel>
      </div>
     </div>}
    </>}
    {screen==="reconciliations"&&<>
     {page("Bank reconciliations","02 / CROSS-SYSTEM CONTROL","Compare illustrative settlements and financial ledger records from Stripe, GoCardless, bank feeds and Space Manager. Exact matches may be proposed; mismatches must be explained by a person.",<button className={css.secondary} onClick={()=>safeDownload("wigwam-synthetic-reconciliations.csv",csv([["Reference","Source","External amount","Ledger reference","Ledger amount","Difference","Status"],...banks.map(x=>[x.reference,x.system,x.amount,x.ledgerReference,x.ledgerAmount,x.amount-x.ledgerAmount,bankCheck(x)])]))}><Download size={14}/> Export examples</button>)}
     <div className={css.metrics}><Metric label="Illustrative settlement lines" value={banks.length} sub="Four hypothetical sources"/><Metric label="Exact reference + amount" value={banks.filter(x=>bankCheck(x)==="match").length} sub="Potential auto-matches" tone="accent"/><Metric label="Exceptions outstanding" value={unreconciled.length} sub="Reference, amount or missing entry" tone="alert"/><Metric label="Reviewer-completed checks" value={banks.filter(x=>x.reviewed).length} sub="Notes retained locally"/></div>
     <Panel label="RECONCILIATION QUEUE" title="Suggested ledger matches"><div className={css.dataTableWrap}><table className={css.dataTable}><thead><tr><th>Date / source</th><th>Reference</th><th>Source amount</th><th>Ledger amount</th><th>Difference</th><th>Check result</th><th/></tr></thead><tbody>{banks.map(x=><tr key={x.id}><td><strong>{x.system}</strong><small>{x.date}</small></td><td>{x.reference}</td><td>{money(x.amount)}</td><td>{money(x.ledgerAmount)}</td><td><strong>{money(x.amount-x.ledgerAmount)}</strong></td><td>{x.reviewed?<Badge type="good">Reviewed</Badge>:bankCheck(x)==="match"?<Badge type="good">Exact match</Badge>:<Badge type="warn">{bankCheck(x)==="amount"?"Amount mismatch":bankCheck(x)==="reference"?"Reference mismatch":"Missing ledger value"}</Badge>}</td><td><button className={css.selectRow} onClick={()=>{setSelectedBankId(x.id);setReviewNote(x.note);}}>Inspect <ArrowRight size={13}/></button></td></tr>)}</tbody></table></div></Panel>
     <div className={css.grid2}>
      <Panel label="REVIEW THE DIFFERENCE" title={selBank.reference+" · "+selBank.system} action={<Badge type={selBank.reviewed?"good":bankCheck(selBank)==="match"?"good":"warn"}>{selBank.reviewed?"Reviewed":bankCheck(selBank)==="match"?"Candidate match":"Exception"}</Badge>}>
       <div className={css.detailMini}><div><small>External reference</small><strong>{selBank.reference}</strong></div><div><small>Ledger reference</small><strong>{selBank.ledgerReference}</strong></div><div><small>External value</small><strong>{moneyPrecise(selBank.amount)}</strong></div><div><small>Ledger value</small><strong>{moneyPrecise(selBank.ledgerAmount)}</strong></div><div><small>Difference</small><strong>{moneyPrecise(selBank.amount-selBank.ledgerAmount)}</strong></div><div><small>Entity</small><strong>{entityName(selBank.entity)}</strong></div></div>
       {bankCheck(selBank)!=="match"&&<div className={css.issue}><AlertCircle size={16}/><span>Review required: {bankCheck(selBank)==="amount"?"value does not reconcile":bankCheck(selBank)==="reference"?"reference identifiers differ":"corresponding ledger amount is missing"}.</span></div>}
       <label className={css.field}>Document your review<textarea rows={3} value={reviewNote} disabled={selBank.reviewed} placeholder="Explain the difference, evidence consulted, and follow-up owner" onChange={e=>setReviewNote(e.target.value)}/></label>
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
     {page("Quarterly investor reporting","03 / BOARD & INVESTOR PACK","Explore how reconciled finance and operating sources could feed a repeatable quarterly review. All company financial values in this interface are invented and are not Wigwam results.",<><button className={css.secondary} onClick={exportReport}><Download size={14}/> Export quarter data</button><button className={css.primary} onClick={()=>window.print()}><FileDown size={14}/> Print / Save PDF</button></>)}
     <div className={css.filterBar}><label className={css.viewSwitch}>Reporting period <select value={period} onChange={e=>setPeriod(e.target.value)}>{investorPeriods.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label><Badge type={period.endsWith("F")?"warn":"neutral"}>{period.endsWith("F")?"Illustrative forecast":"Illustrative historical quarter"}</Badge></div>
     <div className={css.metrics}>
      <Metric label="Quarterly revenue" value={money(current.revenue)} sub="Synthetic, not Wigwam actuals"/>
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
      <Panel label="REPORTING METHODOLOGY" title="From source data to investor-ready pack">
       <div className={css.rules}>{[
        ["Xero","Validated general ledger, expenses, accruals and balance checks."],
        ["Stripe & GoCardless","Settlements and collections reconciled against banking records."],
        ["Space Manager","Operating measures to be aligned with financial entity definitions."],
        ["Controller review","Exceptions, adjustments, commentary and release approval."]
       ].map(([a,b])=><div key={a}><Database size={16}/><div><strong>{a}</strong><p>{b}</p></div></div>)}</div>
      </Panel>
     </div>
     <div className={css.grid2+" "+css.reportGrid}>
      <Panel label="CUSTOMISE THE BOARD PACK" title="Choose sections to include">
       {["Summary","Exceptions","Source mapping","Approval notice"].map(n=><label className={css.kpiLine} key={n}><span>{n}</span><input type="checkbox" checked={reportSections.includes(n)} onChange={e=>setReportSections(xs=>e.target.checked?[...xs,n]:xs.filter(x=>x!==n))}/></label>)}
       <p className={css.smallTip}>The export uses the browser's Print / Save as PDF function. This pack requires a controller's approval before external distribution.</p>
      </Panel>
      <div className={css.printArea}><div className={css.reportPaper}>
       <div className={css.reportPaperHead}><small>WIGWAM STORAGE / ILLUSTRATIVE FINANCE DEMO</small><h2>Quarterly investor overview</h2><p>{current.name} · fictional numbers · draft, unapproved</p></div>
       <div className={css.reportPaperBody}>
        {reportSections.includes("Summary")&&<section><h3>01 · Financial highlights</h3><p>Modelled revenue {money(current.revenue)}, operating costs {money(current.costs)}, operating result {money(current.operatingResult)} ({current.margin.toFixed(1)}% margin), closing cash {money(current.cash)} and occupancy {current.occupancy}%.</p></section>}
        {reportSections.includes("Exceptions")&&<section><h3>02 · Exceptions requiring attention</h3><p>{unreconciled.length} outstanding example bank exceptions and {flagged.length} invoice validation flags. These are independent synthetic cases and must not be presented as real company issues.</p></section>}
        {reportSections.includes("Source mapping")&&<section><h3>03 · Data lineage plan</h3><p>Proposed sources: Xero (ledger), Stripe and GoCardless (settlements), Space Manager (operations) and SharePoint (approved board documents). No sources are live-connected.</p></section>}
        {reportSections.includes("Approval notice")&&<section><h3>04 · Approval and distribution</h3><p>Controller to review reconciliations, adjustments, periods and final commentary before an authorised director shares the pack externally.</p></section>}
       </div><div className={css.reportPaperFoot}>Demonstration only · No source verification · Not an actual investor statement</div>
      </div></div>
     </div>
    </>}
    {screen==="spend"&&<>
     {page("Purchase orders & card spending","04 / EXPENDITURE CONTROL","Explore how Monday.com purchase orders and card receipts could be checked before transactions progress into accounts payable. Missing references and evidence remain explicit exceptions.")}
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
      <Panel label="POLICY VALIDATION" title="A single purchasing control point">
       <div className={css.rules}>{[
        ["Check PO first","Retrieve the authorised order and verify supplier, legal entity and value."],
        ["Match invoice to PO","Route a missing or excessive reference to finance review."],
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
       <label className={css.field}>PO reference (simulation)<select value={selCard.poId} onChange={e=>{setCards(xs=>xs.map(x=>x.id===selCard.id?{...x,poId:e.target.value}:x));log("Card PO reference edited",selCard.merchant);}}><option value="">No purchase order</option>{purchaseOrders.filter(p=>p.entity===selCard.entity).map(p=><option key={p.id} value={p.id}>{p.id} · {p.supplier}</option>)}</select></label>
       <label className={css.kpiLine}><span>Receipt obtained and checked (simulation)</span><input type="checkbox" checked={selCard.receipt} onChange={e=>{setCards(xs=>xs.map(x=>x.id===selCard.id?{...x,receipt:e.target.checked}:x));log("Card evidence amended",selCard.merchant);}}/></label>
       <p className={css.smallTip}>Card receipt confirmation is only a local example. No real card provider is connected and no spend is authorised here.</p>
      </Panel>
     </div>
    </>}
    {screen==="automation"&&<>
     {page("Approval-first workflow blueprint","05 / PROPOSED OPERATING DESIGN","Start with one high-impact supplier invoice workflow. This is a target-state architecture for discussion, not a claim that the existing Xero, Hubdoc or ApprovalMax workflows have already been changed.",<button className={css.primary} onClick={()=>navigate("invoices")}>Try invoice review <ArrowRight size={14}/></button>)}
     <div className={css.grid2}>
      <Panel label="TARGET WORKFLOW" title="Six verifiable stages" action={<Badge type="good">Payments excluded</Badge>}>
       <div className={css.flow}>{phases.map((p,i)=><div className={css.flowStep} key={p.n}><div className={css.flowRail}><span>{p.n}</span>{i<phases.length-1&&<i/>}</div><div className={css.flowInfo}><div><strong>{p.title}</strong><small>{p.owner}</small></div><p>{p.detail}</p></div></div>)}</div>
      </Panel>
      <div>
       <Panel label="RULES FOR FIRST PILOT" title="What the assistant can check">
        <div className={css.rules}>{[
         ["Company allocation","Compare invoice evidence, internal company and PO company."],
         ["PO and amount","Check authorised purchase order exists and value is within tolerance."],
         ["Duplicate detection","Flag matching supplier and invoice number, even across batches."],
         ["Approval routing","Create a draft request and wait for a controller to approve."],
         ["Audit evidence","Keep every explanation, correction and reviewer decision visible."]
        ].map(([a,b])=><div key={a}><CheckCircle2 size={16}/><div><strong>{a}</strong><p>{b}</p></div></div>)}</div>
        <div className={css.buttons}><button className={css.primary} onClick={validateBatch}><Sparkles size={15}/> Run example AP validation</button><button className={css.secondary} onClick={()=>navigate("invoices")}>See review queue</button></div>
       </Panel>
       <Panel label="NON-NEGOTIABLE" title="People in charge of approvals and payments">
        <div className={css.callout}><b>Human-in-the-loop:</b> the bookkeeper and Financial Controller review evidence, handle exceptions and retain delegated authority. No automation can bypass approval limits or execute a payment in this demonstration.</div>
       </Panel>
      </div>
     </div>
     <Panel label="POTENTIAL LATER MODULES" title="One workflow first. Expand once the pilot is reliable."><div className={css.capGrid}>{scenarios.slice(1).map((x,i)=>{const Icon=[GitBranch,BarChart3,WalletCards][i],routes:Screen[]=["reconciliations","reporting","spend"];return <button className={css.cap} key={x.id} onClick={()=>navigate(routes[i])}><Icon size={20}/><strong>{x.title}</strong><span>{x.value}</span><small>DISCOVERY-DEPENDENT EXPANSION</small></button>})}</div></Panel>
    </>}
    {screen==="integrations"&&<>
     {page("Connected ecosystem","06 / CURRENT SYSTEMS & FUTURE CONNECTIONS","The architecture uses the software Nick explicitly identified. Every connector below is a proposed integration point. Nothing in this prototype has accessed, authenticated to or modified a real system.")}
     <Panel label="SOURCE → VALIDATION → CONTROL → OUTPUT" title="A joined-up finance operating model">
      <div className={css.architecture}>{[
       {title:"Capture",detail:"Shared inbox, Hubdoc, SharePoint",icon:Inbox},
       {title:"Cross-check",detail:"Xero entities, Monday.com POs",icon:FileSearch},
       {title:"Review",detail:"Controller and ApprovalMax",icon:ShieldCheck},
       {title:"Reconcile & report",detail:"Payment sources, investor pack",icon:BarChart3}
      ].map(x=>{const Icon=x.icon;return <div key={x.title} className={css.archStep}><Icon size={20}/><strong>{x.title}</strong><p>{x.detail}</p></div>})}</div>
      <div className={css.callout}><b>Recommended architecture:</b> reuse existing software where possible; add custom integrations only where existing workflows cannot solve the manual handoff. Confirm API availability and authorised company access before committing to a scope.</div>
     </Panel>
     <div className={css.connectorGrid}>{connectors.map(c=><div className={css.connector} key={c.name}><Link2 size={20}/><strong>{c.name}</strong><p>{c.role}</p><small>{c.category.toUpperCase()} · NOT CONNECTED</small></div>)}</div>
     <div style={{height:12}}/>
     <Panel label="SECURITY & DELIVERY REQUIREMENTS" title="Conditions for a real implementation"><div className={css.rules}>{[
      ["Entity separation and permissions","Confirm which company owns each record and which staff may view or approve it."],
      ["Document handling","Encrypt stored documents; retain references and delete under an agreed retention policy."],
      ["API review and sandbox testing","Use provider-supported authentication and test with permitted sample records."],
      ["Auditability","Log who corrected a supplier, changed a company, approved an exception or released a report."],
      ["Human payment authority","Never allow an LLM or background workflow to execute a payment without explicit approved controls."]
     ].map(([a,b])=><div key={a}><ShieldCheck size={16}/><div><strong>{a}</strong><p>{b}</p></div></div>)}</div></Panel>
    </>}
    {screen==="assistant"&&<>
     {page("Finance AI guide","07 / EXPLAINABILITY & USER SUPPORT","Ask how the proposed processes work, why an invoice is flagged, or what the sample numbers mean. This prototype uses deterministic answers; a production assistant would require secured, source-grounded access.")}
     <div className={css.grid2}>
      <div className={css.chatBox}><div className={css.chatTop}><span className={css.chatAvatar}><Bot size={19}/></span><div><strong>Finance operations guide</strong><small>Rules-based demo · no external AI calls</small></div><Badge type="neutral">Simulation</Badge></div><div className={css.chatMessages} role="log" aria-live="polite">{messages.map(m=><div key={m.id} className={m.from==="user"?css.userMessage:css.chatMessage}><strong>{m.from==="user"?"You":"Guide · simulated"}</strong><p>{m.text}</p></div>)}</div><form className={css.chatForm} onSubmit={e=>{e.preventDefault();ask();}}><input placeholder="Ask about invoices, reconciliations, controls..." value={chatInput} onChange={e=>setChatInput(e.target.value)} aria-label="Ask finance guide"/><button type="submit" aria-label="Send question"><Send size={16}/></button></form><div className={css.chatHints}>{["Which invoices need review?","Can AI approve payments?","How does bank reconciliation work?","What would the pilot include?"].map(q=><button key={q} onClick={()=>ask(q)}>{q}</button>)}</div></div>
      <div>
       <Panel label="GUARDRAILS" title="What an implementation-ready assistant needs">
        <div className={css.rules}>{[
         ["Verified data access","Answers grounded in authorised Xero, Hubdoc and SharePoint records, not model guesses."],
         ["Context for Nick and Sarah","Director-facing summaries and controller-level evidence with distinct privileges."],
         ["Reviewable recommendations","AI suggests; financial staff decide. No autonomous bank or approval actions."],
         ["Traceability","Link each recommendation to a source record and explain confidence and limitations."]
        ].map(([a,b])=><div key={a}><ShieldCheck size={16}/><div><strong>{a}</strong><p>{b}</p></div></div>)}</div>
       </Panel>
       <Panel label="CURRENT OPEN QUESTIONS" title="What we must ask in discovery">
        <div className={css.alertList}>{["How many supplier invoices arrive per week, across how many legal entities?","What currently causes most errors or rework in Hubdoc and Xero?","Which POs and approval thresholds should be enforced?","Who is permitted to approve exceptions and invoice payments?","Which investor KPIs and quarter-end reconciliations matter most?"].map(q=><div className={css.alertItem} key={q}><MessageCircle size={16}/><div><p>{q}</p></div></div>)}</div>
       </Panel>
      </div>
     </div>
    </>}
    {screen==="roadmap"&&<>
     {page("Implementation plan","08 / DELIVERY DESIGN","A practical phased starting point based on Nick's request for hands-on implementation alongside Sarah. Timelines are provisional until we validate volumes, permissions, and provider API access.")}
     <div className={css.grid2}>
      <Panel label="WHAT SHOULD BE IMPLEMENTED FIRST?" title="Proposed staged delivery">
       <div className={css.flow}>{[
        {n:"01",title:"Discovery and baseline",owner:"Define and validate",detail:"Map shared inbox, entities, supplier counts, PO exception rates, approval limits and current staff effort."},
        {n:"02",title:"Accounts payable pilot",owner:"First implementation candidate",detail:"Connect approved source feeds; extract PDF metadata; validate entity and PO; queue exceptions; preserve ApprovalMax and human sign-off."},
        {n:"03",title:"Reconciliations",owner:"After pilot acceptance",detail:"Introduce matching for payment-system references with a human-controlled exception workflow."},
        {n:"04",title:"Investor reporting and spend controls",owner:"Subsequent implementation",detail:"Prepare quarterly reporting with reconciled sources; expand to Monday.com PO policy and card receipts."},
        {n:"05",title:"Handover and adoption",owner:"Ongoing",detail:"Train the bookkeeper/Financial Controller, document decisions, test edge cases and measure saved time."}
       ].map((x,i,a)=><div className={css.flowStep} key={x.n}><div className={css.flowRail}><span>{x.n}</span>{i<a.length-1&&<i/>}</div><div className={css.flowInfo}><div><strong>{x.title}</strong><small>{x.owner}</small></div><p>{x.detail}</p></div></div>)}</div>
       <p className={css.smallTip}>No binding scope, schedule or implementation cost has been agreed. The initial review with Nick and Sarah should determine one measurable pilot.</p>
      </Panel>
      <div>
       <Panel label="ROI HYPOTHESES" title="Estimate the first AP use case">
        <p className={css.panelIntro}>The client has not shared invoice volumes or costs. These are adjustable illustration-only assumptions and must be replaced during discovery.</p>
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
        <p className={css.finePrint}>Freed capacity is not necessarily cash saved. Default cash monetisation is 0%. This calculator does not know Wigwam's actual process volumes or employee costs and should not be treated as a quotation.</p>
       </Panel>
       <Panel label="SCOPE QUALIFICATION" title="Pilot design choices">
        <p className={css.panelIntro}>Which workflow should the discovery prioritise?</p>
        {scenarios.map(s=><label className={css.kpiLine} key={s.id}><span>{s.title}</span><input type="radio" name="pilot" checked={pickedPilot===s.id} onChange={()=>setPickedPilot(s.id)}/></label>)}
        <div className={css.callout} style={{marginTop:14}}><b>Suggested first pilot:</b> {scenarios.find(x=>x.id===pickedPilot)?.value}. The actual first use case should be confirmed with Nick and Sarah.</div>
       </Panel>
      </div>
     </div>
    </>}
    <footer className={css.footer}><span>Wigwam Storage · SC-Analytics finance operations concept</span><span>All values, documents and financial records fictional · Local-browser actions only · No live system access</span></footer>
   </main>
  </div>
 </div>;
}
