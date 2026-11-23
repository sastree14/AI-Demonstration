import {type Case,type Suggestion,economics,packages,fmt,clamp} from "./engine";

/** Sequence-aware timeline: governance and acceptance cannot be accelerated by adding developers. */
export function capacityPlan(mode:"pilot"|"scale",contributors:number,client:Case){
 const n=clamp(Math.round(contributors),1,6);
 const effectiveFte=1+0.58*(n-1);
 const integrationCount=client.systems.split(/[,;\n]/).filter(x=>x.trim()).length;
 const complexity=1+(integrationCount>=4?.13:integrationCount>=3?.07:0)+(client.inputs.trim()?0:.15);
 const personWeeks=(mode==="pilot"?9:21)*complexity;
 const stages=[
  {id:"01",name:"Discovery and permissions",duration:2,owner:"Consultant / client sponsor",output:"Approved scope, NDA and data-access plan",technical:false},
  {id:"02",name:"Workflow and controls",duration:1.5,owner:"Process owner / architect",output:"Approved process map and acceptance criteria",technical:false},
  {id:"03",name:"Implementation and integration",duration:Math.max(mode==="pilot"?2:3.5,personWeeks/effectiveFte),owner:"Technical delivery partner",output:"Integrated prototype, audit trace and human-review queue",technical:true},
  {id:"04",name:"UAT and quality gates",duration:mode==="pilot"?1.5:2.5,owner:"Client reviewer / QA",output:"Baseline tests, exception validation and UAT sign-off",technical:false},
  {id:"05",name:mode==="pilot"?"Pilot decision":"Rollout and adoption",duration:mode==="pilot"?1:2.5,owner:"Client management",output:mode==="pilot"?"Go/no-go decision":"Training, monitoring and handover",technical:false}
 ];
 let cursor=0;
 const phases=stages.map(x=>{
  const start=cursor;
  cursor+=x.duration;
  return {...x,start,end:cursor,weeks:String(Math.max(1,Math.floor(start)+1))+"–"+String(Math.ceil(cursor)),duration:Number(x.duration.toFixed(1))};
 });
 return {phases,totalWeeks:Math.ceil(cursor),rawWeeks:cursor,effectiveFte:Number(effectiveFte.toFixed(2)),personWeeks:Number(personWeeks.toFixed(1)),contributors:n,complexity:Number(complexity.toFixed(2))};
}
export function allocatedImpacts(client:Case,items:Suggestion[],coverage=client.coverage){
 const e=economics(client,coverage);
 const top=items.slice(0,3);
 const denom=top.reduce((v,x)=>v+x.score,0)||1;
 return top.map(x=>({id:x.id,title:x.title,share:x.score/denom,hours:e.hoursYear*x.score/denom,money:e.annualGross*x.score/denom,summary:x.description}));
}
export function meetingAgenda(client:Case,items:Suggestion[],coverage=client.coverage){
 const impacts=allocatedImpacts(client,items,coverage);
 return [
  {title:"Confirm discovery and business constraints",minutes:8,detail:"Validate sponsor, process ownership, input records and approval rules."},
  {title:"Review automation and AI opportunities",minutes:12,detail:impacts.map((x,i)=>String(i+1)+". "+x.title+" — apportioned annual potential "+Math.round(x.hours)+" h and "+fmt(x.money)+" value.").join("\n")},
  {title:"Financial case and alternatives",minutes:10,detail:"Discuss "+fmt(economics(client,coverage).annualGross)+" nominal annual capacity value, realisable savings, investment and ongoing costs."},
  {title:"Compare two delivery pathways",minutes:8,detail:packages(client).map(x=>x.name+" — "+fmt(x.price)+" indicative upfront plus "+fmt(x.monthly)+"/month.").join("\n")},
  {title:"Agree decisions and follow-up",minutes:7,detail:"Validate access, NDA, "+(client.decisionMaker||"sponsor")+", integration owner and next approval gate."}
 ];
}
export function personalisedEmail(client:Case,brand:string,mode:"pilot"|"scale",coverage=client.coverage,customNotes=""){
 const o=packages(client).find(x=>x.id===mode)||packages(client)[0],e=economics(client,coverage);
 const subject="Next steps for "+(client.company||"your business")+" — "+(client.process||"AI transformation review");
 const body=[
  "Hello,","","Thank you for discussing "+(client.process||"your processes")+". Our initial focus would be to "+(client.objective||"deliver a measurable operational improvement")+".",
  "","We propose "+(mode==="pilot"?"a contained Proof of Value":"a governed rollout")+" with human approval for "+(client.exceptions||"the agreed exception cases")+".",
  "","Indicative value to validate: "+Math.round(e.hoursYear)+" hours/year of potentially recoverable capacity, nominal value "+fmt(e.annualGross)+". This is not guaranteed cash savings.",
  "Proposed scope: "+o.scope,
  "Example project estimate: "+fmt(o.price)+" upfront; "+fmt(o.monthly)+"/month operating (subject to final requirements and verification).",
  "","We recommend a 45-minute solution review with the sponsor and process owner. We can discuss the priority automations, ROI assumptions, two delivery paths, timeline, NDA and access requirements.",
  customNotes?"\nAdditional proposed discussion: "+customNotes:"",
  "","The draft assessment and proposal are available for your review.","","Kind regards,",brand||"Your consultancy",
  "","DEMONSTRATION DRAFT — VERIFY RECIPIENT, FIGURES AND ATTACHMENTS BEFORE SENDING."
 ].filter(Boolean).join("\n");
 return {subject,body};
}
