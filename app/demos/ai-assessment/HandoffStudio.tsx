"use client";
import {useMemo,useState} from "react";
import {CalendarDays,CheckCircle2,Clock3,Download,FileDown,FileText,Mail,Presentation,RefreshCw,Send,ShieldCheck} from "lucide-react";
import {type Case,type Suggestion,missing,economics,fmt,packages} from "./engine";
import {allocatedImpacts,capacityPlan,meetingAgenda,personalisedEmail} from "./delivery";
import {saveFormalPdf,proposalModel,proposalLatex,savePresentationPdf,saveText,artifactName} from "./artifacts";
import styles from "./extensions.module.css";
type Props={client:Case;brand:string;opportunities:Suggestion[];coverage:number;mode:"pilot"|"scale";capacity:number;notify:(x:string)=>void};
const isoStamp=(d:Date)=>d.toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z/,"Z");
export default function HandoffStudio({client,brand,opportunities,coverage,mode,capacity,notify}:Props){
 const [meetingWanted,setMeetingWanted]=useState(true);
 const [meetingDate,setMeetingDate]=useState("");
 const [meetingTime,setMeetingTime]=useState("15:00");
 const [clientEmail,setClientEmail]=useState("");
 const [copyEmail,setCopyEmail]=useState("");
 const [sponsor,setSponsor]=useState(client.decisionMaker||"Client sponsor");
 const [meetingNotes,setMeetingNotes]=useState("");
 const [showNotes,setShowNotes]=useState(true);
 const [offerMode,setOfferMode]=useState<"pilot"|"scale">(mode);
 const [included,setIncluded]=useState<string[]>(opportunities.slice(0,3).map(x=>x.id));
 const [subject,setSubject]=useState(()=>personalisedEmail(client,brand,mode,coverage).subject);
 const [body,setBody]=useState(()=>personalisedEmail(client,brand,mode,coverage).body);
 const [generating,setGenerating]=useState("");
 const selected=useMemo(()=>opportunities.filter(x=>included.includes(x.id)),[opportunities,included]);
 const impacts=allocatedImpacts(client,selected,coverage);
 const agenda=meetingAgenda(client,selected,coverage);
 const econ=economics(client,coverage);
 const path=packages(client).find(x=>x.id===offerMode)||packages(client)[0];
 const plan=capacityPlan(offerMode,capacity,client);
 const incomplete=missing(client);
 function personalise(){const e=personalisedEmail(client,brand,offerMode,coverage,meetingNotes);setSubject(e.subject);setBody(e.body);notify("New case-specific commercial email draft generated. Review before opening your email application.");}
 function startEmail(){
  if(!clientEmail.includes("@")){notify("Enter the client recipient email address before preparing a message.");return;}
  const url="mailto:"+clientEmail+"?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body)+(copyEmail.includes("@")?"&cc="+encodeURIComponent(copyEmail):"");
  window.location.href=url;
  notify("An email draft was opened in your local email app. Nothing was sent. Attach the selected reviewed documents manually.");
 }
 function makeCalendar(){
  if(!meetingDate||!meetingTime){notify("Select a meeting date and time first.");return;}
  const start=new Date(meetingDate+"T"+meetingTime+":00");
  if(!Number.isFinite(start.getTime())){notify("Enter a valid date and time.");return;}
  const finish=new Date(start.getTime()+45*60000);
  const clean=(x:string)=>x.replace(/\r?\n/g,"\\n").replace(/[,;]/g," ");
  const agendaBody=agenda.map((x,i)=>(i+1)+". "+x.title+" ("+x.minutes+" min): "+x.detail).join("\\n");
  const ics=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Consulting Studio//Discovery Follow-up//EN","BEGIN:VEVENT","UID:client-review-"+Date.now()+"@consulting-demo.local","DTSTAMP:"+isoStamp(new Date()),"DTSTART:"+isoStamp(start),"DTEND:"+isoStamp(finish),"SUMMARY:"+clean("Solution review — "+client.company),"DESCRIPTION:"+clean(agendaBody),"STATUS:TENTATIVE","END:VEVENT","END:VCALENDAR"].join("\r\n");
  saveText("solution-review-"+client.company.toLowerCase().replace(/[^a-z0-9]+/g,"-")+".ics",ics,"text/calendar;charset=utf-8");
  notify("An importable 45-minute calendar event was downloaded. It has not been scheduled or sent to participants.");
 }
 async function saveProposalPdf(){
  setGenerating("proposal");
  try{await saveFormalPdf(artifactName("proposal",client.company,"pdf"),proposalModel(client,brand,offerMode,selected,coverage,meetingNotes));notify("Client proposal PDF downloaded, with reviewed scope and modelled values.");}
  catch(e){notify("Unable to generate proposal: "+String(e));}
  finally{setGenerating("");}
 }
 function saveProposalTex(){saveText(artifactName("proposal",client.company,"tex"),proposalLatex(client,brand,offerMode,selected,coverage,meetingNotes),"text/plain;charset=utf-8");notify("Overleaf-compatible editable proposal downloaded.");}
 async function saveSlides(){
  setGenerating("slides");
  try{await savePresentationPdf(client,brand,offerMode,selected,coverage,meetingNotes);notify("Five-slide presentation PDF downloaded.");}
  catch(e){notify("Presentation generation failed: "+String(e));}
  finally{setGenerating("");}
 }
 return <div className={styles.handoff}>
  {incomplete.length>0&&<div className={styles.warning}>Discovery is {Math.round(100*(13-incomplete.length)/13)}% complete. Missing {incomplete.slice(0,4).map(x=>x.label).join(", ")}. Drafts below should not be sent before confirmation.</div>}
  <div className={styles.metrics}>
   <div><small>Opportunities selected</small><strong>{selected.length}</strong><span>Editable shortlist</span></div>
   <div><small>Potential released capacity</small><strong>{Math.round(econ.hoursYear).toLocaleString()} h</strong><span>Yearly · scenario basis</span></div>
   <div><small>Nominal annual value</small><strong>{fmt(econ.annualGross)}</strong><span>Not validated cash savings</span></div>
   <div><small>Selected delivery model</small><strong>{path.name.includes("Pilot")||offerMode==="pilot"?"Pilot":"Rollout"}</strong><span>{plan.totalWeeks} weeks · {capacity} contributors</span></div>
  </div>
  <div className={styles.handoffGrid}>
   <section className={styles.panel}>
    <div className={styles.head}><div><span className={styles.kicker}>AFTER DISCOVERY / CONSULTANT RECOMMENDATION</span><h2>Propose the next solution review</h2></div><CalendarDays size={20}/></div>
    <div className={styles.toggle}><label><input type="checkbox" checked={meetingWanted} onChange={e=>setMeetingWanted(e.target.checked)}/><strong>Suggest a 45-minute follow-up meeting</strong></label><small>Review the business case with the sponsor before contracting</small></div>
    {meetingWanted&&<div className={styles.formGrid}><label className={styles.formField}>Preferred date<input type="date" value={meetingDate} onChange={e=>setMeetingDate(e.target.value)}/></label><label className={styles.formField}>Time (your device's timezone)<input type="time" value={meetingTime} onChange={e=>setMeetingTime(e.target.value)}/></label><label className={styles.formField}>Meeting sponsor / decision maker<input value={sponsor} onChange={e=>setSponsor(e.target.value)}/></label><div className={styles.formField}><span>Calendar file</span><button className={styles.secondary} onClick={makeCalendar}><CalendarDays size={15}/> Download .ics invite</button></div></div>}
    <h3>Suggested agenda · 45 minutes</h3>
    <div className={styles.agenda}>{agenda.map((a,i)=><div key={a.title}><span className={styles.agendaNumber}>{String(i+1).padStart(2,"0")}</span><div><div><strong>{a.title}</strong><small>{a.minutes} min</small></div><p>{a.detail}</p></div></div>)}</div>
    <p className={styles.disclaimer}><Clock3 size={14}/> Downloading an invitation does not reserve anyone's calendar. Production scheduling would require an authorised calendar connection.</p>
   </section>
   <section className={styles.panel}><div className={styles.head}><div><span className={styles.kicker}>RECOMMENDED INTERVENTIONS</span><h2>What should we show the client?</h2></div></div>
    <p className={styles.explanation}>Select which candidate improvements to discuss. Their displayed hours and amounts are <b>apportioned portions of one modelled total</b>, not additional independent benefits.</p>
    <div className={styles.selectList}>{opportunities.slice(0,6).map(x=><label key={x.id}><input type="checkbox" checked={included.includes(x.id)} onChange={e=>setIncluded(v=>e.target.checked?[...v,x.id]:v.filter(y=>y!==x.id))}/><div><strong>{x.title}</strong><small>{x.category} · {x.score}/100 illustrative priority score</small></div></label>)}</div>
    <div className={styles.impactList}>{impacts.map(x=><div key={x.id}><strong>{x.title}</strong><span>{Math.round(x.hours)} hours/year · {fmt(x.money)}/year</span></div>)}</div>
    <p className={styles.disclaimer}>All calculations inherit the assumptions in ROI & economics. Validate real cost reductions, baseline data and attribution with the client.</p>
    <div className={styles.separator}/><h3>Client offer to discuss</h3>
    <div className={styles.modeButtons}>{packages(client).map(x=><button key={x.id} className={offerMode===x.id?styles.activeMode:styles.mode} onClick={()=>setOfferMode(x.id as "pilot"|"scale")}><strong>{x.name}</strong><span>{fmt(x.price)} upfront · {fmt(x.monthly)}/mo</span></button>)}</div>
   </section>
  </div>
  <section className={styles.panel}><div className={styles.head}><div><span className={styles.kicker}>CLIENT-FACING ARTIFACTS</span><h2>Generate the proposal or a short presentation</h2></div><Presentation size={20}/></div><label className={styles.formField}>Custom notes and delivery constraints<textarea rows={3} value={meetingNotes} onChange={e=>setMeetingNotes(e.target.value)} placeholder="Key client requirements, accepted scope, decision deadline, preferred format, conditions..."/></label>
   <div className={styles.exportGrid}>
    <button onClick={saveProposalPdf} disabled={!!generating}><FileDown size={22}/><strong>Proposal PDF</strong><small>Typeset executive proposal with project scope, indicative investment, impact and next steps</small><span>{generating==="proposal"?"Working…":"Generate PDF"}</span></button>
    <button onClick={saveProposalTex}><FileText size={22}/><strong>Overleaf source</strong><small>Editable LaTeX document with all commercial sections and explanatory caveats</small><span>Download .tex</span></button>
    <button onClick={saveSlides} disabled={!!generating}><Presentation size={22}/><strong>Presentation PDF</strong><small>Five-slide storyline for a meeting: opportunity, priorities, benefits, packages and decision</small><span>{generating==="slides"?"Working…":"Download slides"}</span></button>
   </div>
   <p className={styles.disclaimer}><ShieldCheck size={14}/> These are illustrative materials for a fictional case. They require human approval, and are not binding quotations or guaranteed outcomes.</p>
  </section>
  <section className={styles.panel}><div className={styles.head}><div><span className={styles.kicker}>PERSONALISED FOLLOW-UP / HUMAN APPROVAL</span><h2>Prepare the email to the client</h2></div><Mail size={20}/></div><p className={styles.explanation}>The commercial assistant composes a case-specific email using the confirmed process, business objective, proposed automations, scenario ROI and selected service option. You can edit everything before opening your own email application.</p>
   <div className={styles.formGrid}><label className={styles.formField}>Client recipient<input type="email" value={clientEmail} onChange={e=>setClientEmail(e.target.value)} placeholder="decision.maker@client.com"/></label><label className={styles.formField}>CC: support / commercial (optional)<input type="email" value={copyEmail} onChange={e=>setCopyEmail(e.target.value)} placeholder="support@yourconsultancy.com"/></label></div>
   <label className={styles.formField}>Subject<input value={subject} onChange={e=>setSubject(e.target.value)}/></label>
   <label className={styles.formField}>Email body<textarea className={styles.emailTextarea} rows={15} value={body} onChange={e=>setBody(e.target.value)}/></label>
   <div className={styles.buttons}><button className={styles.secondary} onClick={personalise}><RefreshCw size={15}/> Regenerate personalised draft</button><button className={styles.primary} onClick={startEmail}><Send size={15}/> Open in email app</button></div>
   <p className={styles.disclaimer}>This opens an editable <code>mailto:</code> draft; it does not send a message. Attach the downloaded proposal, slides or NDA manually. Direct sending with attachments requires a real Gmail/Outlook integration and authorised server-side workflows.</p>
  </section>
 </div>;
}
