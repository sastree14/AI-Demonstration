"use client";
import {useState} from "react";
import {ArrowRight,Check,CheckCircle2,ClipboardCheck,FileDown,FileText,GitBranch,Inbox,LockKeyhole,RefreshCcw,ShieldAlert,ShieldCheck,Waypoints,XCircle} from "lucide-react";
import {type Invoice,type EntityId,entities,entityName,invoiceIssues,canApprove,canStage,workflowStage,money,purchaseOrders} from "./engine";
import s from "./journey.module.css";

type Props={
 invoices:Invoice[];selected:Invoice|undefined;role:"director"|"controller";
 create:()=>void;pick:(id:string)=>void;patch:(changes:Partial<Invoice>,action?:string)=>void;
 validate:()=>void;acceptException:()=>void;approve:()=>void;stage:()=>void;
 changeRole:(role:"director"|"controller")=>void;openQueue:()=>void;openDashboard:()=>void;
};
export default function GuidedJourney({invoices,selected,role,create,pick,patch,validate,acceptException,approve,stage,changeRole,openQueue,openDashboard}:Props){
 const issues=selected?invoiceIssues(selected,invoices):[];
 const current=selected?workflowStage(selected,invoices):"intake";
 const [inspect,setInspect]=useState<number|null>(null);
 const active=selected?.staged?8:selected?.status==="approved"?7:current==="approval"?6:issues.length?3:5;
 const steps=[
  ["Receive","Shared inbox",selected?.document||"Receive a sample PDF to begin."],
  ["Extract","Intake specialist",selected?selected.supplier+" · "+selected.number+" · net "+money(selected.amount)+" + VAT "+money(selected.vat):"No document selected."],
  ["Cross-check","Validation specialist",selected?"Compare "+entityName(selected.sourceCompany)+" on the document with "+entityName(selected.assignedCompany)+" in the ledger and "+(selected.poId||"the missing PO")+".":"Waiting for source evidence."],
  ["Explain","Exception assistant",issues.length?issues.join(" · "):"The current evidence passes the sample checks."],
  ["Correct","Finance reviewer · example",selected?"The proposed ledger is "+entityName(selected.assignedCompany)+". An authorised finance reviewer could correct it against the document; actual responsibilities are unconfirmed.":"Select an invoice first."],
  ["Prepare","Approval packet",selected?"Packet: "+selected.number+" · "+(selected.poId||"PO exception")+" · "+money(selected.amount)+". Run checks before requesting sign-off.":"Waiting for a validated packet."],
  ["Sign off","ApprovalMax · proposed hand-off",selected?.status==="approved"?"Example Controller decision recorded in this browser.":"The actual approval matrix and integration must be confirmed with Wigwam."],
  ["Hand off","Xero preparation",selected?.staged?"Approved staging file prepared for the bookkeeper.":"The CSV is available only after a human approval."],
  ["Review outcome","Command centre",selected?.staged?"The shared queue and audit trail now show the approved file.":"The dashboard follows each change to this invoice."]
 ];
 const viewed=inspect??active;
 const completed=selected?.staged===true;
 const actionable=selected?.status!=="approved"&&selected?.status!=="rejected"&&!selected?.staged;
 return <div className={s.journey}>
  <div className={s.summary}>
   <div><p className={s.eyebrow}>END-TO-END WORKFLOW · FICTIONAL TRANSACTION</p><h2>Follow one possible invoice workflow</h2><p>Based on the steps Nick described. This is not a map of Wigwam's verified internal rules: the sample companies, PO requirements, permissions and document fields are illustrative. Actions update the same example queue and dashboard.</p></div>
   <button onClick={()=>{setInspect(null);create()}} className={s.primary}><RefreshCcw size={15}/> Receive a new sample invoice</button>
  </div>
  <section className={s.story}><div className={s.storyHead}><strong>Invoice evidence trail</strong><small>Inspect any stage · controls below change the case</small></div>
   <div className={s.storyRail}>{steps.map(([title,owner],i)=><button key={title} aria-pressed={viewed===i} onClick={()=>setInspect(i)}><small>{String(i+1).padStart(2,"0")}</small><strong>{title}</strong><span>{owner}</span></button>)}</div>
   <div className={s.storyDetail}><div><strong>{steps[viewed][0]} · {steps[viewed][1]}</strong><p>{steps[viewed][2]}</p></div>
   {viewed===8?<button className={s.secondary} onClick={openDashboard}>See dashboard impact</button>:<button className={s.secondary} onClick={()=>setInspect(viewed+1)}>Inspect next stage</button>}
   {inspect!==null&&<button className={s.link} onClick={()=>setInspect(null)}>Follow current invoice</button>}</div>
  </section>
  <div className={s.columns}>
   <div className={s.document}>
    <div className={s.documentHeader}><span><FileText size={17}/> INVOICE · SAMPLE SOURCE</span><span>Rendered sample · not a processed PDF</span></div>
    {selected?<div className={s.paper}>
     <div className={s.paperTop}><span>SUPPLIER DOCUMENT</span><strong>Invoice</strong></div>
     <h3>{selected.supplier}</h3>
     <p>Illustrative supplier account · Not a real invoice</p>
     <div className={s.fields}><div><small>INVOICE NUMBER</small><strong>{selected.number}</strong></div><div><small>ISSUED ON</small><strong>{selected.date}</strong></div><div><small>DOCUMENT ENTITY</small><strong>{entityName(selected.sourceCompany)}</strong></div><div><small>PO REFERENCE</small><strong>{selected.poId||"Not supplied"}</strong></div><div><small>PAYMENT DUE</small><strong>{selected.due}</strong></div><div><small>VAT (ILLUSTRATIVE)</small><strong>{money(selected.vat)}</strong></div></div>
     <div className={s.paperTotal}><span>NET INVOICE AMOUNT</span><strong>{money(selected.amount)}</strong></div>
     <div className={s.paperFooter}>Synthetic source document · No real PDF imported · No document transmitted</div>
    </div>:<div className={s.noDocument}>Receive a fictional invoice to start the walkthrough.</div>}
    <div className={s.sourceFoot}><strong>What extraction would return</strong><p>Supplier, amount, invoice ID, document entity and PO evidence. In production each field would link to its source and require confidence checks. Here it is deterministic test data.</p></div>
   </div>
   <div className={s.workPanel}>
    <div className={s.panelHeader}><div><p className={s.eyebrow}>LIVE WORKFLOW STATE</p><h3>{completed?"Prepared for controlled accounting hand-off":current==="approval"?"Human approval required":current==="staging"?"Signed off — awaiting export":current==="exceptions"?"Evidence validation requires attention":"Review the sample invoice"}</h3></div><span className={completed?s.success:issues.length?s.attention:s.neutral}>{completed?"Staged only":issues.length?issues.length+" validation flags":"No validation flags"}</span></div>
    <label className={s.label}>Selected fictional invoice<select aria-label="Guided invoice" value={selected?.id||""} onChange={e=>pick(e.target.value)}>{invoices.filter(x=>x.status!=="rejected").map(x=><option value={x.id} key={x.id}>{x.number} · {x.supplier}</option>)}</select></label>
    <div className={s.statusGrid}><div><small>Approval state</small><strong>{selected?.status==="approved"?"Controller approved":selected?.status==="pending_approval"?"Pending sign-off":selected?.status==="needs_review"?"Manual exception":selected?.status==="rejected"?"Rejected":"Received"}</strong></div><div><small>Xero record</small><strong>{selected?.staged?"CSV prepared":"Not posted / not exported"}</strong></div></div>
    <div className={s.sectionTitle}><span>01</span><strong>Check illustrative invoice evidence</strong></div>
    <div className={s.formGrid}>
     <label className={s.label}>Bookkeeping legal entity<select aria-label="Guided legal entity" value={selected?.assignedCompany||"operating"} disabled={!actionable||role!=="controller"} onChange={e=>patch({assignedCompany:e.target.value as EntityId,exceptionApproved:false,status:"received"},"Guided correction of legal entity")}>{entities.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
     <label className={s.label}>Purchase order in Monday.com<select aria-label="Guided PO reference" value={selected?.poId||""} disabled={!actionable||role!=="controller"} onChange={e=>patch({poId:e.target.value,exceptionApproved:false,status:"received"},"Guided correction of PO reference")}><option value="">No PO reference</option>{purchaseOrders.map(p=><option value={p.id} key={p.id}>{p.id} · {p.supplier} · {entityName(p.entity)}</option>)}</select></label>
    </div>
    {issues.length?<div className={s.issueList}>{issues.map(x=><div key={x}><ShieldAlert size={15}/>{x}</div>)}</div>:<div className={s.valid}><CheckCircle2 size={16}/> Entity, PO, supplier and duplicate validation checks pass.</div>}
    <p className={s.hint}>Sample policy: this demo flags a missing PO. Wigwam may exempt certain types of spend; that rule, the entity structure and any tolerance must be agreed with its finance team. In this example, wrong-company and duplicate errors cannot be waived.</p>
    <button className={s.secondary} disabled={!actionable||role!=="controller"} onClick={validate}><ShieldCheck size={16}/> Run checks & prepare approval</button>
    <div className={s.rule}/>
    <div className={s.sectionTitle}><span>02</span><strong>Simulated reviewer decision</strong></div>
    <div className={s.role}>
     <div><strong>Current perspective</strong><small>{role==="director"?"Director · view only":"Financial Controller · simulated authority"}</small></div>
     <button onClick={()=>changeRole(role==="director"?"controller":"director")}>{role==="director"?"Switch to Controller":"Switch to Director"} <ArrowRight size={14}/></button>
    </div>
    {selected&&issues.length>0&&<div className={s.exception}>
     <label className={s.label}>Exception justification (only eligible issues)<textarea rows={2} disabled={!actionable||role!=="controller"} value={selected.exceptionNote} onChange={e=>patch({exceptionNote:e.target.value,exceptionApproved:false})} placeholder="Describe evidence and the responsible reviewer. A note cannot bypass legal entity errors or duplicates." /></label>
     <button className={s.outline} disabled={role!=="controller"||!actionable||selected.exceptionApproved} onClick={acceptException}><ClipboardCheck size={15}/> Accept eligible documented exception</button>
    </div>}
    <button className={s.primary} onClick={approve} disabled={!selected||!canApprove(selected,invoices,role)}><CheckCircle2 size={16}/> Record human approval</button>
    <p className={s.hint}>The Controller selector only demonstrates human-in-the-loop controls; it does not assert that Sarah personally has this approval authority. Nothing triggers a bank payment.</p>
    <div className={s.rule}/>
    <div className={s.sectionTitle}><span>03</span><strong>Prepare a sample accounting hand-off CSV</strong></div>
    <button className={s.primary} onClick={stage} disabled={!selected||!canStage(selected,invoices,role)}><FileDown size={16}/> Download approved invoice CSV</button>
    {completed&&<div className={s.valid}><CheckCircle2 size={16}/> Approved-only CSV prepared. <button className={s.link} onClick={openDashboard}>View updated command centre</button></div>}
    <p className={s.hint}>The CSV is a generic demonstration artifact, not a validated Xero import format. This demo never posts a bill to Xero or creates payment instructions.</p>
    <button className={s.link} onClick={openQueue}>Open detailed accounts payable queue <ArrowRight size={14}/></button>
   </div>
  </div>
  <div className={s.outcomes}>
   <div><span className={s.eyebrow}>CURRENT CONTEXT · CONFIRMED BY NICK</span><h3>Manual work around the invoice route</h3><p>Nick described supplier PDFs received by shared email, then Hubdoc, Xero and ApprovalMax, with manual processing, missing POs and incorrect company details. Exact manual steps remain to be mapped.</p></div>
   <ArrowRight size={23} className={s.outcomesArrow}/>
   <div><span className={s.eyebrow}>POSSIBLE PILOT · FOR DISCUSSION</span><h3>A configurable review journey</h3><p>Illustrative document checks, exception handling, human sign-off and a generic staging CSV. We would reuse and configure existing capabilities before introducing new software.</p></div>
  </div>
  <div className={s.locked}><LockKeyhole size={17}/> <span>In production, real role permissions, source-linked extraction, API connectivity and Xero/ApprovalMax verification would be developed separately. This publicly accessible demonstration uses fictional data.</span></div>
 </div>;
}
