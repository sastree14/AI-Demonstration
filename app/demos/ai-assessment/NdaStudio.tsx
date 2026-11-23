"use client";
import {useEffect,useMemo,useState} from "react";
import {Check,FileDown,FileText,Mail,Plus,RefreshCw,ShieldCheck,Trash2} from "lucide-react";
import {type Case} from "./engine";
import {clausesFor,ndaDocument,ndaLatex,type NdaClause} from "./legal";
import {saveFormalPdf,saveText,artifactName,ndaModel} from "./artifacts";
import styles from "./extensions.module.css";

export default function NdaStudio({client,brand,law,onLaw,notify}:{client:Case;brand:string;law:string;onLaw:(v:string)=>void;notify:(message:string)=>void}){
 const [clauses,setClauses]=useState<NdaClause[]>(()=>clausesFor(client));
 const [ready,setReady]=useState(false);
 const [newTitle,setNewTitle]=useState("");
 const [newBody,setNewBody]=useState("");
 const [recipient,setRecipient]=useState("");
 const [copyEmail,setCopyEmail]=useState("");
 const [pdfBusy,setPdfBusy]=useState(false);
 const storageKey="kenny-nda-clauses-"+client.id;
 useEffect(()=>{try{const v=JSON.parse(localStorage.getItem(storageKey)||"null");if(Array.isArray(v)&&v.length&&v.every(x=>typeof x.heading==="string"&&typeof x.text==="string"))setClauses(v);}catch{}setReady(true)},[storageKey]);
 useEffect(()=>{if(ready)localStorage.setItem(storageKey,JSON.stringify(clauses));},[ready,storageKey,clauses]);
 const doc=useMemo(()=>ndaDocument(brand,client,law,clauses),[brand,client,law,clauses]);
 const count=clauses.filter(x=>x.selected).length;
 function edit(id:string,patch:Partial<NdaClause>){setClauses(x=>x.map(c=>c.id===id?{...c,...patch}:c));}
 function add(){if(!newTitle.trim()||!newBody.trim()){notify("Add a heading and the full contractual clause.");return;}setClauses(x=>[...x,{id:"custom-"+Date.now(),heading:newTitle.trim(),text:newBody.trim(),selected:true,recommended:false,why:"Custom clause — requires review"}]);setNewTitle("");setNewBody("");notify("Custom clause added to the working NDA.");}
 async function pdf(){if(!count){notify("Select at least one clause before exporting.");return;}setPdfBusy(true);try{await saveFormalPdf(artifactName("nda",client.company,"pdf"),ndaModel(brand,client,law,clauses));notify("Typeset PDF generated. Review the downloaded file before external use.");}catch(e){notify("PDF export failed: "+String(e));}finally{setPdfBusy(false)}}
 function tex(){saveText(artifactName("nda",client.company,"tex"),ndaLatex(brand,client,law,clauses),"text/plain;charset=utf-8");notify("Overleaf-compatible .tex downloaded. Review all legal placeholders.");}
 function draftEmail(){
  if(!recipient.trim()||!recipient.includes("@")){notify("Enter the client's recipient email address.");return;}
  const subject="Mutual NDA for review — "+(client.company||"your organisation");
  const body="Hello,\n\nPlease find our draft mutual NDA for the proposed "+(client.process||"assessment")+". We would welcome your review of the permitted purpose, terms, governing law, and any required data-processing provisions.\n\nPlease note: I will attach the approved PDF separately. This draft is not for signature until legal review is complete.\n\nKind regards,\n"+brand;
  const email="mailto:"+recipient+"?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body)+(copyEmail.includes("@")?"&cc="+encodeURIComponent(copyEmail):"");
  window.location.href=email;
  notify("A draft opens in your email app. No message has been sent and the PDF must be attached manually.");
 }
 return <div className={styles.ndaLayout}>
  <section className={styles.panel}>
   <div className={styles.head}><div><span className={styles.kicker}>GOVERNED DOCUMENT ASSEMBLY</span><h2>Clause-by-clause NDA editor</h2></div><span className={styles.pill}>{count} included</span></div>
   <p className={styles.explanation}>A rules-based adviser suggests clauses from the client's process, information types and likely integrations. You can accept, exclude, rewrite or add clauses. These are not legal recommendations.</p>
   <div className={styles.formGrid}><label className={styles.formField}>Jurisdiction / governing law<input value={law} onChange={e=>onLaw(e.target.value)} placeholder="To be agreed"/></label><label className={styles.formField}>Parties<span>{brand} · {client.company||"Client name to confirm"}</span></label></div>
   <div className={styles.ruleControls}><button onClick={()=>{setClauses(clausesFor(client));notify("Clause recommendations regenerated from the current client facts.");}}><RefreshCw size={14}/> Restore suggested clauses</button><span>Each clause remains editable</span></div>
   <div className={styles.clauseList}>{clauses.map(c=><div className={styles.clause} key={c.id}><div className={styles.clauseHeading}><label><input type="checkbox" checked={c.selected} onChange={e=>edit(c.id,{selected:e.target.checked})}/><strong>{c.heading}</strong></label><span>{c.recommended?"Suggested":"Optional"}</span></div><p>{c.why}</p><textarea rows={c.selected?3:2} value={c.text} onChange={e=>edit(c.id,{text:e.target.value})} aria-label={"Edit "+c.heading}/>{c.id.startsWith("custom-")&&<button className={styles.remove} onClick={()=>setClauses(x=>x.filter(v=>v.id!==c.id))}><Trash2 size={13}/> Remove custom clause</button>}</div>)}</div>
   <div className={styles.addBlock}><h3>Add a bespoke clause</h3><label className={styles.formField}>Clause heading<input value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="e.g. Limited access to audit records"/></label><label className={styles.formField}>Contract text<textarea rows={3} value={newBody} onChange={e=>setNewBody(e.target.value)} placeholder="Write precise draft wording for legal review"/></label><button className={styles.primary} onClick={add}><Plus size={15}/> Add clause</button></div>
  </section>
  <div>
   <section className={styles.previewDoc}><div className={styles.previewTop}><strong>{brand.toUpperCase()}</strong><small>DRAFT / FOR LEGAL REVIEW</small></div><div className={styles.previewBody}><span className={styles.kicker}>MUTUAL CONFIDENTIALITY</span><h2>{doc.title}</h2><p>{doc.subtitle}</p><div className={styles.meta}>{doc.meta.map(x=><div key={x}>{x}</div>)}</div>{doc.sections.map(x=><div className={styles.legalSection} key={x.heading}><h3>{x.heading}</h3><p>{x.text}</p></div>)}<div className={styles.signature}><span>Party A: __________________________</span><span>Party B: __________________________</span></div><footer>{doc.footer}</footer></div></section>
   <section className={styles.panel}><div className={styles.head}><div><span className={styles.kicker}>EXPORT & REVIEW</span><h2>Download the agreement</h2></div><FileText size={18}/></div><p className={styles.explanation}>Choose a professional PDF for the client or an editable LaTeX source that opens in Overleaf.</p><div className={styles.buttons}><button className={styles.primary} onClick={pdf} disabled={pdfBusy}><FileDown size={15}/>{pdfBusy?"Generating…":"Download styled PDF"}</button><button className={styles.secondary} onClick={tex}><FileDown size={15}/> Download Overleaf .tex</button></div><div className={styles.separator}/><h3>Prepare a review email</h3><div className={styles.formGrid}><label className={styles.formField}>Client email<input type="email" value={recipient} placeholder="client@example.com" onChange={e=>setRecipient(e.target.value)}/></label><label className={styles.formField}>Copy support / legal reviewer (optional)<input type="email" value={copyEmail} placeholder="support@yourconsultancy.com" onChange={e=>setCopyEmail(e.target.value)}/></label></div><button className={styles.secondary} onClick={draftEmail}><Mail size={15}/> Open email draft</button><p className={styles.disclaimer}><ShieldCheck size={14}/> Opening a draft does not send it. Attach the reviewed PDF manually. Direct server-side sending requires an authorised production email integration.</p></section>
  </div>
 </div>;
}
