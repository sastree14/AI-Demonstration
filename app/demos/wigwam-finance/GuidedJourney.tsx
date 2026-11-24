"use client";
import {ArrowRight,Check,CheckCircle2,ClipboardCheck,FileDown,FileText,GitBranch,Inbox,LockKeyhole,RefreshCcw,ShieldAlert,ShieldCheck,Waypoints,XCircle} from "lucide-react";
import {type Invoice,type EntityId,entities,entityName,invoiceIssues,canApprove,canStage,workflowStage,money,purchaseOrders} from "./engine";
import s from "./journey.module.css";

type Props={
 invoices:Invoice[];selected:Invoice|undefined;role:"director"|"controller";
 create:()=>void;pick:(id:string)=>void;patch:(changes:Partial<Invoice>,action?:string)=>void;
 validate:()=>void;acceptException:()=>void;approve:()=>void;stage:()=>void;
 changeRole:(role:"director"|"controller")=>void;openQueue:()=>void;
};
const steps=[
 {id:"intake",title:"Receive & extract",sub:"Email → Hubdoc",icon:Inbox},
 {id:"exceptions",title:"Validate & correct",sub:"Entity / supplier / PO",icon:ShieldAlert},
 {id:"approval",title:"Human sign-off",sub:"ApprovalMax → Controller",icon:ClipboardCheck},
 {id:"staging",title:"Prepare Xero hand-off",sub:"Approved-only export",icon:FileDown}
] as const;
const index:Record<ReturnType<typeof workflowStage>,number>={intake:0,exceptions:1,approval:2,staging:3,ready:4};
export default function GuidedJourney({invoices,selected,role,create,pick,patch,validate,acceptException,approve,stage,changeRole,openQueue}:Props){
 const issues=selected?invoiceIssues(selected,invoices):[];
 const current=selected?workflowStage(selected,invoices):"intake";
 const position=index[current];
 const completed=selected?.staged===true;
 const actionable=selected?.status!=="approved"&&selected?.status!=="rejected"&&!selected?.staged;
 return <div className={s.journey}>
  <div className={s.summary}>
   <div><p className={s.eyebrow}>END-TO-END WORKFLOW · FICTIONAL TRANSACTION</p><h2>Follow one invoice from arrival to controlled hand-off</h2><p>This is the journey Nick can understand and Sarah can validate. Changes you make here update the same queue, metrics and audit log across the demonstration.</p></div>
   <button onClick={create} className={s.primary}><RefreshCcw size={15}/> Receive a new sample invoice</button>
  </div>
  <div className={s.flowRail}>
   {steps.map((st,i)=>{const Icon=st.icon;return <div key={st.id} className={i<position?s.finished:i===position?s.active:s.future}><span className={s.icon}>{i<position?<Check size={17}/>:<Icon size={17}/>}</span><strong>{st.title}</strong><small>{st.sub}</small>{i<steps.length-1&&<ArrowRight className={s.nextIcon} size={16}/>}</div>})}
  </div>
  <div className={s.columns}>
   <div className={s.document}>
    <div className={s.documentHeader}><span><FileText size={17}/> INVOICE · SAMPLE SOURCE</span><span>Fictional PDF preview</span></div>
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
    <div className={s.sectionTitle}><span>01</span><strong>Validate the extracted evidence</strong></div>
    <div className={s.formGrid}>
     <label className={s.label}>Bookkeeping legal entity<select aria-label="Guided legal entity" value={selected?.assignedCompany||"operating"} disabled={!actionable||role!=="controller"} onChange={e=>patch({assignedCompany:e.target.value as EntityId,exceptionApproved:false,status:"received"},"Guided correction of legal entity")}>{entities.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
     <label className={s.label}>Purchase order in Monday.com<select aria-label="Guided PO reference" value={selected?.poId||""} disabled={!actionable||role!=="controller"} onChange={e=>patch({poId:e.target.value,exceptionApproved:false,status:"received"},"Guided correction of PO reference")}><option value="">No PO reference</option>{purchaseOrders.map(p=><option value={p.id} key={p.id}>{p.id} · {p.supplier} · {entityName(p.entity)}</option>)}</select></label>
    </div>
    {issues.length?<div className={s.issueList}>{issues.map(x=><div key={x}><ShieldAlert size={15}/>{x}</div>)}</div>:<div className={s.valid}><CheckCircle2 size={16}/> Entity, PO, supplier and duplicate validation checks pass.</div>}
    <p className={s.hint}>Wrong-company, duplicate or supplier/PO mismatch cannot be waived. Switch to Financial Controller to correct the underlying evidence before progressing.</p>
    <button className={s.secondary} disabled={!actionable||role!=="controller"} onClick={validate}><ShieldCheck size={16}/> Run checks & prepare approval</button>
    <div className={s.rule}/>
    <div className={s.sectionTitle}><span>02</span><strong>Finance Controller decision</strong></div>
    <div className={s.role}>
     <div><strong>Current perspective</strong><small>{role==="director"?"Director · view only":"Financial Controller · simulated authority"}</small></div>
     <button onClick={()=>changeRole(role==="director"?"controller":"director")}>{role==="director"?"Switch to Controller":"Switch to Director"} <ArrowRight size={14}/></button>
    </div>
    {selected&&issues.length>0&&<div className={s.exception}>
     <label className={s.label}>Exception justification (only eligible issues)<textarea rows={2} disabled={!actionable||role!=="controller"} value={selected.exceptionNote} onChange={e=>patch({exceptionNote:e.target.value,exceptionApproved:false})} placeholder="Describe evidence and the responsible reviewer. A note cannot bypass legal entity errors or duplicates." /></label>
     <button className={s.outline} disabled={role!=="controller"||!actionable||selected.exceptionApproved} onClick={acceptException}><ClipboardCheck size={15}/> Accept eligible documented exception</button>
    </div>}
    <button className={s.primary} onClick={approve} disabled={!selected||!canApprove(selected,invoices,role)}><CheckCircle2 size={16}/> Record human approval</button>
    <p className={s.hint}>Approval is a separate manual action and only possible in the simulated Controller perspective. Nothing triggers a bank payment.</p>
    <div className={s.rule}/>
    <div className={s.sectionTitle}><span>03</span><strong>Prepare a verified Xero staging file</strong></div>
    <button className={s.primary} onClick={stage} disabled={!selected||!canStage(selected,invoices,role)}><FileDown size={16}/> Download approved invoice CSV</button>
    {completed&&<div className={s.valid}><CheckCircle2 size={16}/> Approved-only CSV downloaded or prepared. The accounting system has not been modified.</div>}
    <p className={s.hint}>Export records only after the human decision. This demo never posts a bill to Xero or creates payment instructions.</p>
    <button className={s.link} onClick={openQueue}>Open detailed accounts payable queue <ArrowRight size={14}/></button>
   </div>
  </div>
  <div className={s.outcomes}>
   <div><span className={s.eyebrow}>BEFORE · CURRENT PROCESS DESCRIBED BY NICK</span><h3>Five disconnected hand-offs</h3><p>Email PDFs → Hubdoc → Xero → ApprovalMax, with manual checks for missing PO references and incorrect company assignment.</p></div>
   <ArrowRight size={23} className={s.outcomesArrow}/>
   <div><span className={s.eyebrow}>AFTER · PROPOSED CONTROLLED PILOT</span><h3>One auditable review journey</h3><p>Document evidence, automatic checks, an exception queue, explicit Controller approval and an approved-only Xero staging file.</p></div>
  </div>
  <div className={s.locked}><LockKeyhole size={17}/> <span>In production, real role permissions, source-linked extraction, API connectivity and Xero/ApprovalMax verification would be developed separately. This publicly accessible demonstration uses fictional data.</span></div>
 </div>;
}
