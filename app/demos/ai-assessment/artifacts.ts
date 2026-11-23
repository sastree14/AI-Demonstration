import {type Case,type Suggestion,economics,packages,fmt} from "./engine";
import {ndaDocument,type NdaClause,toLatex} from "./legal";
import {allocatedImpacts,capacityPlan} from "./delivery";

type DocumentModel={title:string;subtitle:string;meta:string[];sections:{heading:string;text:string}[];footer:string};
const safeName=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,45);
export function saveText(name:string,content:string,mime="text/plain;charset=utf-8"){
 const blob=new Blob([content],{type:mime}),url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
}
export async function saveFormalPdf(name:string,doc:DocumentModel){
 const {jsPDF}=await import("jspdf");
 const pdf=new jsPDF({unit:"mm",format:"a4",orientation:"portrait"});
 const pageWidth=210,margin=24,right=pageWidth-margin;
 let y=32,page=1;
 function footer(){
  pdf.setDrawColor(218,224,224);pdf.line(margin,282,right,282);
  pdf.setFont("helvetica","normal");pdf.setFontSize(8);pdf.setTextColor(116,132,136);
  pdf.text("CONFIDENTIAL / ILLUSTRATIVE DRAFT / HUMAN REVIEW REQUIRED",margin,287);
  pdf.text(String(page),right,287,{align:"right"});
 }
 function newPage(){
  footer();pdf.addPage();page++;y=27;
  pdf.setFont("helvetica","bold");pdf.setFontSize(9);pdf.setTextColor(37,99,85);pdf.text(doc.subtitle,margin,y);y+=14;
 }
 function lines(text:string,size=11){return pdf.splitTextToSize(text,162) as string[]}
 function paragraph(text:string,size=11){
  pdf.setFontSize(size);pdf.setFont("times","normal");pdf.setTextColor(48,64,68);
  const arr=lines(text,size);
  const leading=size*.43;
  for(const line of arr){if(y+leading>272)newPage();pdf.text(line,margin,y);y+=leading;}
  y+=4;
 }
 pdf.setFillColor(21,51,70);pdf.rect(0,0,210,12,"F");
 pdf.setFont("helvetica","bold");pdf.setTextColor(25,61,75);pdf.setFontSize(18);
 const titles=pdf.splitTextToSize(doc.title,160) as string[];
 titles.forEach(line=>{pdf.text(line,margin,y);y+=9;});
 y+=4;pdf.setFont("helvetica","normal");pdf.setTextColor(57,125,107);pdf.setFontSize(9);pdf.text(doc.subtitle,margin,y);y+=14;
 for(const text of doc.meta)paragraph(text,10);
 y+=7;
 for(const sec of doc.sections){
  if(y>251)newPage();
  pdf.setDrawColor(190,210,206);pdf.line(margin,y-1,right,y-1);
  pdf.setFont("helvetica","bold");pdf.setTextColor(27,86,70);pdf.setFontSize(11);
  const headingLines=pdf.splitTextToSize(sec.heading,162) as string[];
  headingLines.forEach(line=>{if(y>266)newPage();pdf.text(line,margin,y+5);y+=7;});
  y+=5;paragraph(sec.text,11);
 }
 if(y>256)newPage();
 pdf.setFont("helvetica","italic");pdf.setTextColor(155,77,68);pdf.setFontSize(9);
 for(const line of pdf.splitTextToSize(doc.footer,163) as string[]){if(y>273)newPage();pdf.text(line,margin,y);y+=4;}
 footer();
 pdf.save(name);
}
export function ndaModel(brand:string,client:Case,law:string,clauses:NdaClause[]):DocumentModel{
 const a=ndaDocument(brand,client,law,clauses);
 return {...a,sections:[...a.sections,{heading:"Execution — placeholders only",text:"Party A signature: ____________________    Date: _________\nParty B signature: ____________________    Date: _________"}]};
}
export function proposalModel(client:Case,brand:string,mode:"pilot"|"scale",opp:Suggestion[],coverage:number,notes=""):DocumentModel{
 const choice=packages(client).find(x=>x.id===mode)||packages(client)[0];
 const e=economics(client,coverage),p=capacityPlan(mode,2,client),impact=allocatedImpacts(client,opp,coverage);
 return {
  title:"Transformation Opportunity Proposal",
  subtitle:"SCOPING DRAFT / BUSINESS CASE — NOT BINDING",
  meta:["Prepared by: "+(brand||"Your consultancy"),"Prepared for: "+(client.company||"[Client]"),"Sector: "+(client.sector||"Not confirmed"),"Decision sponsor: "+(client.decisionMaker||"Not confirmed")],
  sections:[
   {heading:"01  Executive objective",text:client.objective||"Business outcomes to be agreed."},
   {heading:"02  Current-state process",text:(client.process||"Not yet agreed")+". Systems and constraints: "+(client.systems||"Unknown")+". Exception governance: "+(client.exceptions||"To be verified")+"."},
   {heading:"03  Recommended improvements",text:impact.map((x,i)=>(i+1)+". "+x.title+" — indicative allocation "+Math.round(x.hours)+" hours/year and "+fmt(x.money)+" nominal value.").join("\n")},
   {heading:"04  Recommended commercial pathway",text:choice.name+". "+choice.scope+" Indicative upfront "+fmt(choice.price)+", recurring operating cost "+fmt(choice.monthly)+"/month. Delivery is conditional on discovery and integrations."},
   {heading:"05  Economic case and limitations",text:"Illustrative annual recoverable capacity "+Math.round(e.hoursYear)+" hours, nominal productive value "+fmt(e.annualGross)+", annual operating costs "+fmt(e.annualRun)+", year-one net "+fmt(e.netYear)+". This is an unverified scenario, not guaranteed cash savings. Opportunity allocations above must not be summed again."},
   {heading:"06  Delivery plan and approvals",text:"Illustrative baseline duration "+p.totalWeeks+" weeks with two contributors. Source access, human review, NDA, UAT and final acceptance must be confirmed before contracting."},
   {heading:"07  Next-step meeting",text:"45-minute solution-review meeting with the process owner and sponsor. Validate automation shortlist, financial assumptions, approval routes, commercial scope and deliverables."},
   {heading:"08  Consultant notes",text:notes||"To be reviewed with the client."}
  ],
  footer:"ILLUSTRATIVE PROPOSAL ONLY. PRICING, ROI, TIMING AND SCOPE MUST BE VALIDATED. NOT A CONTRACT OR BINDING QUOTATION."
 };
}
export function proposalLatex(client:Case,brand:string,mode:"pilot"|"scale",opp:Suggestion[],coverage:number,notes=""){
 const x=proposalModel(client,brand,mode,opp,coverage,notes);
 return toLatex(x.title,x.subtitle,x.meta,x.sections,x.footer);
}
export async function savePresentationPdf(client:Case,brand:string,mode:"pilot"|"scale",opp:Suggestion[],coverage:number,notes=""){
 const {jsPDF}=await import("jspdf");
 const pdf=new jsPDF({unit:"mm",format:"a4",orientation:"landscape"});
 const W=297,H=210;
 const e=economics(client,coverage),p=capacityPlan(mode,2,client),choice=packages(client).find(x=>x.id===mode)||packages(client)[0];
 function slide(k:number,heading:string,sub:string){
  if(k>1)pdf.addPage("a4","landscape");
  pdf.setFillColor(19,47,62);pdf.rect(0,0,W,18,"F");
  pdf.setFont("helvetica","bold");pdf.setFontSize(10);pdf.setTextColor(225,240,234);pdf.text((brand||"Consultancy").toUpperCase()+" / CLIENT ADVISORY",18,11);
  pdf.setFont("helvetica","bold");pdf.setTextColor(22,57,73);pdf.setFontSize(25);pdf.text(heading,22,43);
  pdf.setFont("helvetica","normal");pdf.setTextColor(93,119,122);pdf.setFontSize(12);pdf.text(sub,22,56);
  pdf.setDrawColor(220,230,227);pdf.line(22,187,275,187);
  pdf.setFontSize(9);pdf.text("FICTITIOUS DEMONSTRATION · NOT A BINDING QUOTE",22,195);pdf.text(String(k)+"/5",274,195,{align:"right"});
 }
 function block(title:string,body:string,x:number,y:number,w=116){
  pdf.setFillColor(244,248,246);pdf.roundedRect(x,y,w,70,3,3,"F");
  pdf.setFont("helvetica","bold");pdf.setFontSize(15);pdf.setTextColor(31,93,78);
  pdf.text(pdf.splitTextToSize(title,w-18) as string[],x+9,y+16);
  pdf.setFont("helvetica","normal");pdf.setFontSize(11);pdf.setTextColor(48,72,79);
  pdf.text(pdf.splitTextToSize(body,w-18) as string[],x+9,y+33);
 }
 slide(1,(client.company||"Client")+" — transformation",client.sector||"Consulting case");
 block("Business objective",client.objective||"Pending client review",22,76,250);
 slide(2,"Where automation makes sense","Ranked candidates with traceable assumptions");
 allocatedImpacts(client,opp,coverage).forEach((a,i)=>block(a.title,Math.round(a.hours)+" hours/year · "+fmt(a.money)+" modelled value",22+i*85,77,80));
 slide(3,"Economics & assumptions","Time capacity is not automatically equivalent to cash savings");
 block("Annual potential",fmt(e.annualGross)+" nominal value · "+Math.round(e.hoursYear)+" hours",22,78,116);
 block("Cost & payback",fmt(e.initial)+" initial · "+fmt(e.annualRun)+" annual operating",150,78,116);
 slide(4,"Two project pathways","Trade off upfront risk, breadth and speed");
 packages(client).forEach((x,i)=>block(x.name,fmt(x.price)+" upfront · "+fmt(x.monthly)+"/month. "+x.scope,22+i*128,78,116));
 slide(5,"Decision & next steps","Validate with the sponsor before implementation");
 block("Delivery approach",choice.name+" · roughly "+p.totalWeeks+" weeks at the assumed 2-person capacity.",22,78,116);
 block("Next meeting","Confirm owners, source permissions, NDA, KPIs, exceptions and approval. "+notes,150,78,116);
 pdf.save("transformation-presentation-"+safeName(client.company||"client")+".pdf");
}
export function artifactName(kind:"nda"|"proposal",company:string,ext:"pdf"|"tex"){
 return kind+"-"+safeName(company||"client")+"."+ext;
}
