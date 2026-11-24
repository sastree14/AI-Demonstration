"use client";
import {useState} from "react";
import {ArrowRight, ClipboardCheck, FileSearch, GitBranch, Network, Play, ShieldCheck} from "lucide-react";
import {bankCheck,cardIssues,entityName,invoiceIssues,investorMetrics,money,workflowStage,type Invoice,type BankLine,type CardSpend} from "./engine";
import s from "./operations.module.css";

type Destination="journey"|"reconciliations"|"reporting"|"spend"|"assistant"|"overview";
type Specialist={name:string;systems:string;input:string;output:string;limit:string;target:Destination};
const specialists:Specialist[]=[
 {name:"Invoice Intake & Extraction",systems:"Shared finance inbox · Hubdoc · SharePoint",input:"Supplier PDF and its email reference",output:"Document fields ready for validation",limit:"The bookkeeper verifies unreadable or missing fields.",target:"journey"},
 {name:"Entity & PO Validation",systems:"Hubdoc · Monday.com · Xero",input:"Document company, proposed ledger, supplier, PO and invoice register",output:"Evidence checks and blocking discrepancies",limit:"Only finance can change the proposed company or accept an eligible exception.",target:"journey"},
 {name:"AP Exception Assistant",systems:"Xero · Monday.com · ApprovalMax",input:"Flagged invoice and supporting evidence",output:"An explanation and the next permitted action",limit:"Sarah resolves the exception. An authorised person signs off separately.",target:"journey"},
 {name:"Reconciliation Assistant",systems:"Stripe · GoCardless · Space Manager · bank · Xero",input:"Collection reference and amount alongside the ledger entry",output:"A proposed match or a reason to investigate",limit:"Reviewing a difference leaves both balances intact.",target:"reconciliations"},
 {name:"Financial Reporting Assistant",systems:"Xero · Stripe · GoCardless · Space Manager · SharePoint",input:"Selected quarter, sample ledger, collections and occupancy",output:"Investor commentary with sources for review",limit:"Sarah checks the draft before any external distribution.",target:"reporting"},
 {name:"Spend Control Assistant",systems:"Monday.com · SharePoint · Xero",input:"Card transaction, receipt, legal entity and approved PO",output:"Missing evidence and spend-policy exceptions",limit:"A person verifies the receipt and the spending authority.",target:"spend"},
 {name:"Finance Operations Guide",systems:"Power Automate · workspace audit trail",input:"Current invoice, review queues and hand-off status",output:"A plain-English explanation for the finance team",limit:"Read-only guidance. Approval and payment authority stay with people.",target:"assistant"}
];
const routes=[
 {name:"Supplier invoices",target:"journey",steps:[
 ["Capture","Shared finance inbox → Hubdoc","Receive a supplier PDF and capture supplier, net amount, VAT and invoice number.","Retain the original in SharePoint for a reviewer."],
 ["Validate","Monday.com + Xero","Match the PO owner and supplier to the document and proposed ledger.","Missing PO or wrong company sends the item to Sarah."],
 ["Sign off","Sarah → ApprovalMax","Prepare the evidence packet after validation.","An authorised person records the decision."],
 ["Hand off","Bookkeeper → Xero","Prepare an approved-only CSV and retain its run reference.","The bookkeeper controls posting. Payments are separate."]]},
 {name:"Bank reconciliation",target:"reconciliations",steps:[
 ["Collect","Stripe + GoCardless","Read settlement and direct debit references, dates and amounts.","Separate settlement timing from missing receipts."],
 ["Compare","Bank + Space Manager → Xero","Compare the receipt, settlement and ledger records.","Require the reference and amount to agree."],
 ["Investigate","Sarah → review log","Record the supporting evidence for any difference.","An investigation note cannot change either balance."]]},
 {name:"Investor reporting",target:"reporting",steps:[
 ["Assemble","Xero + Space Manager","Take revenue, costs and closing cash from the sample ledger and occupancy from operations.","Keep the quarter and forecast status attached."],
 ["Cross-check","Stripe + GoCardless","Use collection records to explain cash timing.","Distinguish cash received from recognised revenue."],
 ["Review","Sarah → SharePoint","Review exceptions and commentary, then prepare the quarterly pack.","External distribution requires a separate human decision."]]},
 {name:"Purchasing & cards",target:"spend",steps:[
 ["Authorise","Monday.com","Look up the approved order, company and value.","The PO sets the authorised amount."],
 ["Check evidence","Card record + SharePoint","Compare spend and receipt against the order.","Missing evidence or overspend requires investigation."],
 ["Resolve","Sarah → Xero preparation","Record corrected references after inspecting the purchase.","No card charge is authorised by this workflow."]]}
] as const;

export function SystemMap({open}:{open:(target:Destination)=>void}){
 const [lane,setLane]=useState(0),[stage,setStage]=useState(0);
 const route=routes[lane], step=route.steps[stage];
 return <section className={s.surface}><div className={s.head}><Network/><div><small>PROPOSED SYSTEM CONNECTIONS</small><h2>How evidence moves through finance</h2></div></div>
 <div className={s.tabs}>{routes.map((r,i)=><button key={r.name} aria-pressed={lane===i} onClick={()=>{setLane(i);setStage(0)}}>{r.name}</button>)}</div>
 <div className={s.flow}>{route.steps.map((v,i)=><button key={v[0]} aria-pressed={stage===i} onClick={()=>setStage(i)}><small>{v[0]}</small><strong>{v[1]}</strong>{i<route.steps.length-1&&<ArrowRight size={15}/>}</button>)}</div>
 <div className={s.detail}><strong>{step[0]} evidence</strong><p>{step[2]}</p><p><ShieldCheck size={14}/> {step[3]}</p></div>
 <div className={s.foot}><span>Power Automate could route events between stages. All connections are proposed.</span><button onClick={()=>open(route.target)}>Open sample workflow <ArrowRight size={15}/></button></div></section>
}

type Props={invoice:Invoice;invoices:Invoice[];bank:BankLine;card:CardSpend;period:string;open:(target:Destination)=>void;selectInvoice:(id:string)=>void;selectBank:(id:string)=>void;selectCard:(id:string)=>void;banks:BankLine[];cards:CardSpend[];selectPeriod:(id:string)=>void;quarters:{id:string;name:string}[]};
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
 return <div className={s.desk}><div className={s.list}>{specialists.map((v,i)=><button key={v.name} aria-pressed={i===id} onClick={()=>{setId(i);setRun(false)}}><GitBranch size={16}/>{v.name}</button>)}</div>
 <section className={s.surface}><div className={s.head}><FileSearch/><div><small>RULE-BASED SIMULATION</small><h2>{a.name}</h2></div></div><p>{a.systems}</p><dl className={s.facts}><div><dt>Reads</dt><dd>{a.input}</dd></div><div><dt>Prepares</dt><dd>{a.output}</dd></div></dl>
 <label className={s.field}>Sample evidence<select value={id===3?p.bank.id:id===4?p.period:id===5?p.card.id:inv.id} onChange={e=>{setRun(false);const value=e.target.value;if(id===3)p.selectBank(value);else if(id===4)p.selectPeriod(value);else if(id===5)p.selectCard(value);else p.selectInvoice(value)}}>
 {(id===3?p.banks.map(x=>[x.id,x.system+" · "+x.reference]):id===4?p.quarters.map(x=>[x.id,x.name]):id===5?p.cards.map(x=>[x.id,x.merchant]):p.invoices.map(x=>[x.id,x.number+" · "+x.supplier])).map(([v,t])=><option value={v} key={v}>{t}</option>)}</select></label>
 <button className={s.run} onClick={()=>setRun(true)}><Play size={15}/> Run sample check</button>
 {run&&<div className={s.result} role="status"><strong>Sample result</strong>{result().map((x,i)=><p key={i}>{x}</p>)}</div>}
 <div className={s.foot}><span><ClipboardCheck size={15}/> {a.limit}</span><button onClick={()=>p.open(a.target)}>Open relevant workflow <ArrowRight size={15}/></button></div></section></div>
}
