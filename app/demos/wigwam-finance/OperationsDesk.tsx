"use client";
import {useState} from "react";
import {ArrowRight, ClipboardCheck, FileSearch, GitBranch, Network, Play, ShieldCheck} from "lucide-react";
import {bankCheck,cardIssues,entityName,invoiceIssues,investorMetrics,money,workflowStage,type Invoice,type BankLine,type CardSpend} from "./engine";
import s from "./operations.module.css";

type Destination="journey"|"reconciliations"|"reporting"|"spend"|"assistant"|"overview";
type Specialist={name:string;systems:string;input:string;output:string;limit:string;target:Destination};
const specialists:Specialist[]=[
 {name:"Invoice Intake & Extraction",systems:"Shared finance inbox · Hubdoc · optional SharePoint evidence storage",input:"Supplier PDF and its email reference",output:"Document fields ready for validation",limit:"The bookkeeper verifies unreadable or missing fields.",target:"journey"},
 {name:"Entity & PO Validation",systems:"Hubdoc, Monday.com and Xero · proposed cross-check",input:"Document company, proposed ledger, supplier, PO and invoice register",output:"Evidence checks and blocking discrepancies",limit:"Only finance can change the proposed company or accept an eligible exception.",target:"journey"},
 {name:"AP Exception Assistant",systems:"Xero, Monday.com and ApprovalMax · proposed exception handling",input:"Flagged invoice and supporting evidence",output:"An explanation and the next permitted action",limit:"People review exceptions and retain approval authority.",target:"journey"},
 {name:"Reconciliation Assistant",systems:"Stripe, GoCardless, Space Manager and Xero · proposed source mapping",input:"Collection reference and amount alongside the ledger entry",output:"A proposed match or a reason to investigate",limit:"Reviewing a difference leaves both balances intact.",target:"reconciliations"},
 {name:"Financial Reporting Assistant",systems:"Potential reporting sources · proposed links",input:"Selected quarter, sample ledger, collections and occupancy",output:"Investor commentary with sources for review",limit:"An authorised reviewer checks the sample draft before distribution.",target:"reporting"},
 {name:"Spend Control Assistant",systems:"Monday.com, SharePoint and Xero · proposed policy checks",input:"Card transaction, receipt, legal entity and approved PO",output:"Missing evidence and spend-policy exceptions",limit:"A person verifies the receipt and the spending authority.",target:"spend"},
 {name:"Finance Operations Guide",systems:"Power Automate · proposed orchestration · no live AI access",input:"Current invoice, review queues and hand-off status",output:"A plain-English explanation for the finance team",limit:"Read-only guidance. Approval and payment authority stay with people.",target:"assistant"}
];
const routes=[
 {name:"Supplier invoices",target:"journey",steps:[
 ["Capture","Shared finance inbox → Hubdoc","Supplier PDFs enter a shared mailbox and move through document capture.","Document evidence can be retained in an authorised repository if configured."],
 ["Validate","Proposed: Monday.com + Xero","Where POs are required, compare the reference, legal entity, supplier and limits.","PO exemptions, company structure and review permissions are configurable."],
 ["Sign off","Existing tool: ApprovalMax","A possible review packet could use the existing approval product.","Authorised people retain approval and delegation rights."],
 ["Hand off","Proposed: controlled Xero preparation","Generate a fictional approved-only CSV for discussion.","Posting formats and access permissions are configured separately."]]},
 {name:"Bank reconciliation",target:"reconciliations",steps:[
 ["Collect","Stripe + GoCardless","Read settlement and direct debit references, dates and amounts.","Separate settlement timing from missing receipts."],
 ["Compare","Possible source matching","Compare example payment references, bank amounts and accounting entries.","Operating data can be included where supported and configured."],
 ["Investigate","Finance team → sample review log","Demonstrate a documented human check of a difference.","No actual reconciliations or ledger balances are changed."]]},
 {name:"Investor reporting",target:"reporting",steps:[
 ["Assemble","Potential: Xero + operating data","Explore combining ledger figures with an optional operating metric.","Operating measures are optional, subject to available data."],
 ["Cross-check","Possible: Stripe + GoCardless","Explore settlement timing with fictional collection records.","Reporting sources and their connections are configurable."],
 ["Review","Finance team → optional archive","Document draft checks, with SharePoint as one possible archive.","External distribution remains under human control."]]},
 {name:"Purchasing & cards",target:"spend",steps:[
 ["Authorise","Monday.com (named source)","Inspect a fictional PO and applicable spending limits.","PO requirements and authorised spend limits may vary by category."],
 ["Check evidence","Possible card + document sources","Demonstrate matching cards, receipts and PO where policy requires it.","Card providers, receipts and document locations are configurable."],
 ["Resolve","Authorised finance reviewer","Demonstrate an example exception note and reviewed reference.","Human reviewers and accounting hand-off follow configured permissions."]]}
] as const;

export function SystemMap({open}:{open:(target:Destination)=>void}){
 const [lane,setLane]=useState(0),[stage,setStage]=useState(0);
 const route=routes[lane], step=route.steps[stage];
 return <section className={s.surface}><div className={s.head}><Network/><div><small>POTENTIAL SYSTEM CONNECTIONS · CONCEPT DEMO</small><h2>An integrated finance workflow</h2></div></div>
 <div className={s.tabs}>{routes.map((r,i)=><button key={r.name} aria-pressed={lane===i} onClick={()=>{setLane(i);setStage(0)}}>{r.name}</button>)}</div>
 <div className={s.flow}>{route.steps.map((v,i)=><button key={v[0]} aria-pressed={stage===i} onClick={()=>setStage(i)}><small>{v[0]}</small><strong>{v[1]}</strong>{i<route.steps.length-1&&<ArrowRight size={15}/>}</button>)}</div>
 <div className={s.detail}><strong>{step[0]} evidence</strong><p>{step[2]}</p><p><ShieldCheck size={14}/> {step[3]}</p></div>
 <div className={s.foot}><span>Power Automate is one possible orchestration layer. All illustrated connections are proposed, not live.</span><button onClick={()=>open(route.target)}>Open sample workflow <ArrowRight size={15}/></button></div></section>
}

type Props={invoice:Invoice;invoices:Invoice[];bank:BankLine;card:CardSpend;period:string;open:(target:Destination)=>void;selectInvoice:(id:string)=>void;selectBank:(id:string)=>void;selectCard:(id:string)=>void;banks:BankLine[];cards:CardSpend[];selectPeriod:(id:string)=>void;quarters:{id:string;name:string}[]};

/* Presentation-only orchestration: same synthetic source state as existing workspaces.
   The event replay is read-only and does not approve, post, reconcile or distribute anything. */
function Orchestration(p:Props){
 const [cursor,setCursor]=useState(0);
 const inv=p.invoice, bank=p.bank, card=p.card, q=investorMetrics(p.period);
 const entityMismatch=inv.sourceCompany!==inv.assignedCompany;
 const flags=invoiceIssues(inv,p.invoices);
 const bankStatus=bankCheck(bank);
 const spendFlags=cardIssues(card);
 const records=[
  {name:"Entity Allocation Agent",lane:"ap",source:"Shared inbox / Hubdoc · Xero",input:inv.number+" · "+inv.document,output:entityMismatch?"Company mismatch: "+entityName(inv.assignedCompany)+" → proposed "+entityName(inv.sourceCompany):"Document and proposed entity agree: "+entityName(inv.sourceCompany),handoff:"Purchase Order Agent · AP Exception Assistant",target:"journey" as Destination,issue:entityMismatch},
  {name:"Purchase Order Agent",lane:"ap",source:"Monday.com · Xero",input:inv.number+" · PO "+(inv.poId||"not supplied"),output:flags.filter(x=>/purchase order|PO|supplier/i.test(x)).join("; ")||"Sample PO checks pass; apply configured policy",handoff:"AP Exception Assistant · Card Spend Control Agent",target:"journey" as Destination,issue:flags.some(x=>/purchase order|PO|supplier/i.test(x))},
  {name:"AP Exception Assistant",lane:"ap",source:"Validation results · proposed ApprovalMax status",input:inv.number+" · "+flags.length+" validation flag(s)",output:flags.length?flags.join("; ")+" · prepare review or correction request":"Prepare evidence for human approval; no approval executed",handoff:"Sarah · shared exception register",target:"journey" as Destination,issue:flags.length>0},
  {name:"Bank Reconciliation Agent",lane:"cash",source:"Stripe / GoCardless · bank evidence · Xero",input:bank.system+" · "+bank.reference+" · "+money(bank.amount),output:"Ledger "+money(bank.ledgerAmount)+" · "+bankStatus+" · "+(bank.reviewed?"review recorded":"prepare human review in Xero"),handoff:"Financial Reporting · Financial Monitoring",target:"reconciliations" as Destination,issue:bankStatus!=="match"},
  {name:"Card Spend Control Agent",lane:"cash",source:"Card evidence · Monday.com · Xero",input:card.merchant+" · "+money(card.amount)+" · "+(card.poId||"no PO"),output:spendFlags.length?spendFlags.join("; ")+" · request evidence":"Sample policy checks pass",handoff:"AP exceptions · Financial Monitoring",target:"spend" as Destination,issue:spendFlags.length>0},
  {name:"Financial Reporting Agent",lane:"report",source:"Xero · optional Space Manager · reconciliation evidence",input:q.name+" · approved metric definitions",output:"Revenue "+money(q.revenue)+" · costs "+money(q.costs)+" · operating result "+money(q.operatingResult)+" · draft pack, not released",handoff:"Sarah review · Nick investor pack",target:"reporting" as Destination,issue:false},
  {name:"Financial Monitoring Agent",lane:"report",source:"Shared AP, cash, spend and reporting evidence",input:"Latest selected sample results + "+q.name,output:flags.length+" invoice flag(s) · bank "+bankStatus+" · "+spendFlags.length+" spend flag(s) · occupancy "+q.occupancy+"% (fictional)",handoff:"Nick and Sarah · prioritised review",target:"overview" as Destination,issue:flags.length>0||bankStatus!=="match"||spendFlags.length>0}
 ];
 const lanes=[{id:"ap",label:"01 / Accounts Payable",color:"#e8effa",accent:"#3c6596"},{id:"cash",label:"02 / Reconciliation & spend",color:"#e8f3ee",accent:"#317867"},{id:"report",label:"03 / Financial reporting",color:"#f0ebf7",accent:"#745b96"}];
 const selectedKey=inv.id+"|"+bank.id+"|"+card.id+"|"+p.period;
 const [replayKey,setReplayKey]=useState(selectedKey);
 const progress=replayKey===selectedKey?cursor:0;
 const runTo=(n:number)=>{setReplayKey(selectedKey);setCursor(n)};
 return <section className={s.surface} aria-label="Coordinated finance agents">
  <div className={s.head}><Network/><div><small>PROPOSED ARCHITECTURE · INTERACTIVE SIMULATION</small><h2>One financial system. Seven coordinated agents.</h2></div></div>
  <p>Keep the existing finance stack. A shared orchestration layer routes events, passes structured evidence between specialists and reserves approvals, reconciliation confirmation and report release for authorised people.</p>
  <div style={{padding:15,border:"1px solid #cbdad8",borderRadius:10,textAlign:"center",background:"#f5f8f7"}}><strong>Existing systems</strong><p style={{margin:"6px 0 0",fontSize:13}}>Shared inbox · Hubdoc · Xero · ApprovalMax · Monday.com · Stripe · GoCardless · Space Manager · SharePoint</p></div>
  <div style={{textAlign:"center",padding:4}} aria-hidden="true">↓</div>
  <div style={{background:"#174e49",color:"white",borderRadius:10,padding:16,textAlign:"center"}}><strong>Finance Orchestrator</strong><p style={{margin:"5px 0 0",fontSize:13}}>Power Automate / worker · API and MCP adapters · event routing · permissions · shared audit and evidence</p></div>
  <div style={{textAlign:"center",padding:4}} aria-hidden="true">↓</div>
  <div style={{display:"flex",flexWrap:"wrap",gap:12}}>
   {lanes.map(l=><div key={l.id} style={{flex:"1 1 240px",minWidth:0,background:l.color,padding:12,borderRadius:10}}><strong style={{color:l.accent,fontSize:13}}>{l.label}</strong>{records.map((a,i)=>a.lane===l.id?<div key={a.name} style={{marginTop:9,padding:12,borderRadius:8,background:"white",border:"1px solid "+(progress>i?l.accent:"#d5dfdc")}}><small style={{color:progress>i?(a.issue?"#996314":"#267665"):"#64748b",fontWeight:700}}>{progress>i?(a.issue?"REVIEW / HANDOFF":"EVIDENCE PREPARED"):"WAITING FOR EVENT"}</small><div style={{fontWeight:700,marginTop:4}}>{a.name}</div><p style={{fontSize:12,margin:"6px 0"}}>{a.source}</p>{progress>i&&<><p style={{fontSize:13,margin:"6px 0"}}><b>Output:</b> {a.output}</p><p style={{fontSize:12,color:l.accent,margin:"6px 0"}}>→ {a.handoff}</p></>}<button onClick={()=>p.open(a.target)} style={{fontSize:12,padding:"5px 8px"}}>Open example <ArrowRight size={12}/></button></div>:null)}</div>)}
  </div>
  <div style={{textAlign:"center",padding:4}} aria-hidden="true">↓</div>
  <div style={{padding:14,borderRadius:10,border:"1px solid #cbdad8",textAlign:"center"}}><strong>Shared evidence and review queue</strong><p style={{fontSize:13,margin:"5px 0"}}>One source-linked case history · separate entities · deterministic controls · Nick / Sarah see only authorised information</p><small>Human approval in ApprovalMax · final Xero bank confirmation · reviewed report release</small></div>
  <div style={{marginTop:20}}><strong>Run a sample finance cycle</strong><p style={{fontSize:13}}>The replay shows separate AP, bank/card and period-close events in one view; not every agent runs on every invoice. All inputs are synthetic, and the sequence is illustrative, not a live automation.</p>
  <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
   <label className={s.field} style={{flex:"1 1 170px",margin:"4px 0"}}>Invoice<select value={inv.id} onChange={e=>p.selectInvoice(e.target.value)}>{p.invoices.map(x=><option key={x.id} value={x.id}>{x.number} · {x.supplier}</option>)}</select></label>
   <label className={s.field} style={{flex:"1 1 170px",margin:"4px 0"}}>Bank evidence<select value={bank.id} onChange={e=>p.selectBank(e.target.value)}>{p.banks.map(x=><option key={x.id} value={x.id}>{x.reference}</option>)}</select></label>
   <label className={s.field} style={{flex:"1 1 170px",margin:"4px 0"}}>Card evidence<select value={card.id} onChange={e=>p.selectCard(e.target.value)}>{p.cards.map(x=><option key={x.id} value={x.id}>{x.merchant}</option>)}</select></label>
   <label className={s.field} style={{flex:"1 1 170px",margin:"4px 0"}}>Reporting quarter<select value={p.period} onChange={e=>p.selectPeriod(e.target.value)}>{p.quarters.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
  </div>
  <div className={s.tabs} style={{margin:"16px 0"}}><button className={s.run} style={{margin:0}} onClick={()=>runTo(Math.min(progress+1,7))} disabled={progress===7}><Play size={15}/> Next agent</button><button onClick={()=>runTo(7)}>Run full sample cycle</button><button onClick={()=>runTo(0)}>Reset replay</button><span style={{fontSize:13}}>{progress}/7 sample outputs</span></div>
  <div style={{height:6,background:"#e2e9e6",borderRadius:8,overflow:"hidden"}}><div style={{width:(progress/7*100)+"%",height:"100%",background:"#267665"}}/></div>
  {progress>0&&<div aria-live="polite" style={{marginTop:15}}><strong>Orchestration event log</strong>{records.slice(0,progress).map((a,i)=><div key={a.name} style={{borderTop:"1px solid #dce6e2",padding:"10px 0",fontSize:13}}><small style={{color:"#397067"}}>EVENT {i+1} · {a.name}</small><p style={{margin:"4px 0"}}><b>Input:</b> {a.input}</p><p style={{margin:"4px 0"}}><b>Result:</b> {a.output}</p><p style={{margin:"4px 0"}}><b>Next:</b> {a.handoff}</p></div>)}</div>}
  </div>
  <div className={s.detail}><strong>Configurable, not connected</strong><p>Entity mappings, PO exemptions, approval limits, reconciliation tolerance, report templates, schedules and notification recipients are agreed with Wigwam. Xero's standard API cannot directly reconcile imported statement lines; the example prepares evidence for the human workflow. No live APIs, LLM calls, emails, ledger writes or payments occur.</p></div>
 </section>
}

export function Specialists(p:Props){
 const [id,setId]=useState(0),[run,setRun]=useState(false);
 const a=specialists[id], inv=p.invoice, flags=invoiceIssues(inv,p.invoices),quarter=investorMetrics(p.period);
 const result=()=>{
  switch(id){
   case 0:return [inv.document,inv.supplier+" · "+inv.number+" · "+inv.date,entityName(inv.sourceCompany)+" · net "+money(inv.amount)+" · VAT "+money(inv.vat),"PO: "+(inv.poId||"not supplied")];
   case 1:return ["Document: "+entityName(inv.sourceCompany),"Proposed ledger: "+entityName(inv.assignedCompany),...(flags.length?flags:["Supplier, company, PO amount and duplicate checks pass."])];
   case 2:return [inv.number+" · "+workflowStage(inv,p.invoices),...flags,inv.staged?"The hand-off CSV has already been prepared.":inv.status==="rejected"?"This invoice is closed. Inspect the rejection in the queue.":flags.length?"Inspect the source and PO before preparing the approval request.":inv.status==="approved"?"A controller can now prepare the accounting CSV.":"Check the approval queue for the next human decision."];
   case 3:return [p.bank.system+" · "+p.bank.reference,"Source "+money(p.bank.amount)+" / ledger "+money(p.bank.ledgerAmount),"Reference in ledger: "+(p.bank.ledgerReference||"missing"),"Check: "+bankCheck(p.bank)+" · "+(p.bank.reviewed?"review documented":"awaiting review")];
   case 4:return [quarter.name+" · "+(quarter.id.endsWith("F")?"illustrative forecast":"synthetic historical quarter"),"Xero ledger: revenue "+money(quarter.revenue)+" less costs "+money(quarter.costs)+" = "+money(quarter.operatingResult),"Stripe / GoCardless collections: "+money(quarter.collections),"Space Manager occupancy: "+quarter.occupancy+"%"];
   case 5:return [p.card.merchant+" · "+money(p.card.amount),entityName(p.card.entity)+" · "+(p.card.poId||"no PO"),...(cardIssues(p.card).length?cardIssues(p.card):["PO, authorised amount and receipt checks pass."])];
   default:return [inv.number+" · "+workflowStage(inv,p.invoices),p.invoices.filter(x=>x.status==="pending_approval").length+" invoices await a human decision.",p.invoices.filter(x=>x.staged).length+" approved files prepared. No payment instruction is available."];
  }
 };
 return <><Orchestration {...p}/><h2 style={{fontSize:19,margin:"16px 0"}}>Detailed sample checks</h2><div className={s.desk}><div className={s.list}>{specialists.map((v,i)=><button key={v.name} aria-pressed={i===id} onClick={()=>{setId(i);setRun(false)}}><GitBranch size={16}/>{v.name}</button>)}</div>
 <section className={s.surface}><div className={s.head}><FileSearch/><div><small>AI-ASSISTED CAPABILITY · SIMULATED EXAMPLE</small><h2>{a.name}</h2></div></div><p>{a.systems}</p><dl className={s.facts}><div><dt>Reads</dt><dd>{a.input}</dd></div><div><dt>Prepares</dt><dd>{a.output}</dd></div></dl>
 <label className={s.field}>Sample evidence<select value={id===3?p.bank.id:id===4?p.period:id===5?p.card.id:inv.id} onChange={e=>{setRun(false);const value=e.target.value;if(id===3)p.selectBank(value);else if(id===4)p.selectPeriod(value);else if(id===5)p.selectCard(value);else p.selectInvoice(value)}}>
 {(id===3?p.banks.map(x=>[x.id,x.system+" · "+x.reference]):id===4?p.quarters.map(x=>[x.id,x.name]):id===5?p.cards.map(x=>[x.id,x.merchant]):p.invoices.map(x=>[x.id,x.number+" · "+x.supplier])).map(([v,t])=><option value={v} key={v}>{t}</option>)}</select></label>
 <button className={s.run} onClick={()=>setRun(true)}><Play size={15}/> Run sample check</button>
 {run&&<div className={s.result} role="status"><strong>Illustrative result · not connected to company records</strong>{result().map((x,i)=><p key={i}>{x}</p>)}</div>}
 <div className={s.foot}><span><ClipboardCheck size={15}/> {a.limit}</span><button onClick={()=>p.open(a.target)}>Open relevant workflow <ArrowRight size={15}/></button></div></section></div></>
}
