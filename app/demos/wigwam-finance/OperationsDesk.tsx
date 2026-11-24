"use client";
import {useState} from "react";
import {ArrowRight, ClipboardCheck, FileSearch, GitBranch, Network, Play, ShieldCheck} from "lucide-react";
import {bankCheck,cardIssues,entityName,invoiceIssues,investorMetrics,money,workflowStage,type Invoice,type BankLine,type CardSpend} from "./engine";
import s from "./operations.module.css";

type Destination="journey"|"reconciliations"|"reporting"|"spend"|"assistant"|"overview";
type Specialist={name:string;systems:string;input:string;output:string;limit:string;target:Destination};
const specialists:Specialist[]=[
 {name:"Invoice Intake & Extraction",systems:"Existing: shared finance inbox and Hubdoc · Optional: SharePoint evidence storage",input:"Supplier PDF and its email reference",output:"Document fields ready for validation",limit:"The bookkeeper verifies unreadable or missing fields.",target:"journey"},
 {name:"Entity & PO Validation",systems:"Named by Nick: Hubdoc, Monday.com and Xero · Proposed cross-check",input:"Document company, proposed ledger, supplier, PO and invoice register",output:"Evidence checks and blocking discrepancies",limit:"Only finance can change the proposed company or accept an eligible exception.",target:"journey"},
 {name:"AP Exception Assistant",systems:"Named by Nick: Xero, Monday.com and ApprovalMax · Proposed exception handling",input:"Flagged invoice and supporting evidence",output:"An explanation and the next permitted action",limit:"Exception ownership and approver roles require confirmation. People make the decisions.",target:"journey"},
 {name:"Reconciliation Assistant",systems:"Named by Nick: Stripe, GoCardless, Space Manager and Xero · Links unverified",input:"Collection reference and amount alongside the ledger entry",output:"A proposed match or a reason to investigate",limit:"Reviewing a difference leaves both balances intact.",target:"reconciliations"},
 {name:"Financial Reporting Assistant",systems:"Potential source combination only · Existing reporting connections unverified",input:"Selected quarter, sample ledger, collections and occupancy",output:"Investor commentary with sources for review",limit:"An authorised reviewer would check the fictional draft. Actual report owners are unconfirmed.",target:"reporting"},
 {name:"Spend Control Assistant",systems:"Named by Nick: Monday.com, SharePoint and Xero · Proposed policy checks",input:"Card transaction, receipt, legal entity and approved PO",output:"Missing evidence and spend-policy exceptions",limit:"A person verifies the receipt and the spending authority.",target:"spend"},
 {name:"Finance Operations Guide",systems:"Possible orchestration with Power Automate · No live AI or external tool access",input:"Current invoice, review queues and hand-off status",output:"A plain-English explanation for the finance team",limit:"Read-only guidance. Approval and payment authority stay with people.",target:"assistant"}
];
const routes=[
 {name:"Supplier invoices",target:"journey",steps:[
 ["Capture","Shared finance inbox → Hubdoc","Nick described supplier PDFs moving from the shared inbox to Hubdoc.","The precise capture setup and any optional SharePoint archive require confirmation."],
 ["Validate","Proposed: Monday.com + Xero","Where POs are required, compare the reference, legal entity, supplier and limits.","Actual PO exemptions, entity structure and reviewers are not yet known."],
 ["Sign off","Existing tool: ApprovalMax","A possible review packet could use the existing approval product.","Authorised approvers and delegation rules remain to be confirmed."],
 ["Hand off","Proposed: controlled Xero preparation","Generate a fictional approved-only CSV for discussion.","Actual posting process, import format and authority require discovery."]]},
 {name:"Bank reconciliation",target:"reconciliations",steps:[
 ["Collect","Stripe + GoCardless","Read settlement and direct debit references, dates and amounts.","Separate settlement timing from missing receipts."],
 ["Compare","Possible source matching","Compare example payment references, bank amounts and accounting entries.","We do not know the actual bank feeds or how Space Manager is involved."],
 ["Investigate","Finance team → sample review log","Demonstrate a documented human check of a difference.","No actual reconciliations or ledger balances are changed."]]},
 {name:"Investor reporting",target:"reporting",steps:[
 ["Assemble","Potential: Xero + operating data","Explore combining ledger figures with an optional operating metric.","We must confirm whether Space Manager supplies these figures."],
 ["Cross-check","Possible: Stripe + GoCardless","Explore settlement timing with fictional collection records.","Current reporting sources and integrations are unknown."],
 ["Review","Finance team → optional archive","Document draft checks, with SharePoint as one possible archive.","No actual approval or distribution practice has been confirmed."]]},
 {name:"Purchasing & cards",target:"spend",steps:[
 ["Authorise","Monday.com (named source)","Inspect a fictional PO and applicable spending limits.","Which purchases need POs, and who authorises them, must be confirmed."],
 ["Check evidence","Possible card + document sources","Demonstrate matching cards, receipts and PO where policy requires it.","Wigwam card providers, receipt policy and document locations are unconfirmed."],
 ["Resolve","Authorised finance reviewer","Demonstrate an example exception note and reviewed reference.","Actual roles and accounting hand-off are still to be defined."]]}
] as const;

export function SystemMap({open}:{open:(target:Destination)=>void}){
 const [lane,setLane]=useState(0),[stage,setStage]=useState(0);
 const route=routes[lane], step=route.steps[stage];
 return <section className={s.surface}><div className={s.head}><Network/><div><small>ILLUSTRATIVE ARCHITECTURE · NOT AN AS-IS SYSTEM MAP</small><h2>How the existing tools could work together</h2></div></div>
 <div className={s.tabs}>{routes.map((r,i)=><button key={r.name} aria-pressed={lane===i} onClick={()=>{setLane(i);setStage(0)}}>{r.name}</button>)}</div>
 <div className={s.flow}>{route.steps.map((v,i)=><button key={v[0]} aria-pressed={stage===i} onClick={()=>setStage(i)}><small>{v[0]}</small><strong>{v[1]}</strong>{i<route.steps.length-1&&<ArrowRight size={15}/>}</button>)}</div>
 <div className={s.detail}><strong>{step[0]} evidence</strong><p>{step[2]}</p><p><ShieldCheck size={14}/> {step[3]}</p></div>
 <div className={s.foot}><span>Nick named the tools; most connections are unverified. Power Automate is one possible way to orchestrate the steps.</span><button onClick={()=>open(route.target)}>Open sample workflow <ArrowRight size={15}/></button></div></section>
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
 <section className={s.surface}><div className={s.head}><FileSearch/><div><small>OPTIONAL AI-ASSISTED CAPABILITY · RULE-BASED EXAMPLE</small><h2>{a.name}</h2></div></div><p>{a.systems}</p><dl className={s.facts}><div><dt>Reads</dt><dd>{a.input}</dd></div><div><dt>Prepares</dt><dd>{a.output}</dd></div></dl>
 <label className={s.field}>Sample evidence<select value={id===3?p.bank.id:id===4?p.period:id===5?p.card.id:inv.id} onChange={e=>{setRun(false);const value=e.target.value;if(id===3)p.selectBank(value);else if(id===4)p.selectPeriod(value);else if(id===5)p.selectCard(value);else p.selectInvoice(value)}}>
 {(id===3?p.banks.map(x=>[x.id,x.system+" · "+x.reference]):id===4?p.quarters.map(x=>[x.id,x.name]):id===5?p.cards.map(x=>[x.id,x.merchant]):p.invoices.map(x=>[x.id,x.number+" · "+x.supplier])).map(([v,t])=><option value={v} key={v}>{t}</option>)}</select></label>
 <button className={s.run} onClick={()=>setRun(true)}><Play size={15}/> Run sample check</button>
 {run&&<div className={s.result} role="status"><strong>Illustrative result · not connected to company records</strong>{result().map((x,i)=><p key={i}>{x}</p>)}</div>}
 <div className={s.foot}><span><ClipboardCheck size={15}/> {a.limit}</span><button onClick={()=>p.open(a.target)}>Open relevant workflow <ArrowRight size={15}/></button></div></section></div>
}
