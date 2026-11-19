export type Role = "ceo" | "cfo" | "manager" | "sales";
export type View = "overview" | "data" | "workflows" | "intelligence" | "reports" | "agents" | "security" | "integrations";
export type Entity = "all" | "europe" | "gulf" | "asia";

export const roles: Record<Role, {name: string; detail: string; allowed: View[]; entities: Entity[]; agents: string[]; approve: boolean; edit: boolean}> = {
  ceo: {name:"Group CEO",detail:"Executive, all entities",allowed:["overview","data","workflows","intelligence","reports","agents","security","integrations"],entities:["all","europe","gulf","asia"],agents:["coordinator","financial","quality","automation","forecast","reporting","sales"],approve:true,edit:true},
  cfo: {name:"Group CFO",detail:"Group finance, all entities",allowed:["overview","data","workflows","intelligence","reports","agents","security","integrations"],entities:["all","europe","gulf","asia"],agents:["financial","quality","automation","forecast","reporting"],approve:true,edit:true},
  manager: {name:"EMEA Finance Manager",detail:"Europe business unit only",allowed:["overview","data","workflows","intelligence","reports","agents","security","integrations"],entities:["europe"],agents:["financial","quality","forecast","reporting"],approve:false,edit:false},
  sales: {name:"Sales Representative",detail:"Own commercial records only",allowed:["overview","agents","security","integrations"],entities:[],agents:["sales"],approve:false,edit:false},
};

export const entityLabels: Record<Entity, string> = {all:"Group consolidated",europe:"Aurelia Europe",gulf:"Aurelia Gulf",asia:"Aurelia Asia"};
export const months = ["May 2026","Jun 2026","Jul 2026","Aug 2026","Sep 2026","Oct 2026"];
export type FinanceRecord = {id:string;month:string;entity:Exclude<Entity,"all">;revenue:number;budget:number;cost:number;opex:number;cash:number;source:string;loadedAt:string;quality:"passed"|"review"};
const seeds: Array<{key:Exclude<Entity,"all">;revenue:number;cost:number;opex:number;cash:number;index:number}> = [
  {key:"europe",revenue:2350000,cost:1470000,opex:440000,cash:1480000,index:0},
  {key:"gulf",revenue:1760000,cost:1140000,opex:310000,cash:975000,index:1},
  {key:"asia",revenue:1210000,cost:810000,opex:185000,cash:755000,index:2},
];
export const records: FinanceRecord[] = seeds.flatMap(s => months.map((month,i) => {
  const factor = 1 + i*.018 - (i===4?.069:0) + (i===5?.026:0) + s.index*.006;
  const revenue=Math.round(s.revenue*factor/1000)*1000;
  return {id:`GL-${s.index+1}${i+101}`,month,entity:s.key,revenue,budget:Math.round(s.revenue*(1.035+i*.016)/1000)*1000,cost:Math.round(s.cost*(1+i*.012+(i===4?.021:0))/1000)*1000,opex:Math.round(s.opex*(1+i*.014)/1000)*1000,cash:Math.round(s.cash*(1+i*.01)/1000)*1000,source:i%2===0?"ERP / General ledger":"Excel / Finance planning",loadedAt:"2026-11-19 08:01 UTC",quality:(s.index===1&&i===4)?"review":"passed"};
}));
export type Metrics = {revenue:number;budget:number;variance:number;cost:number;opex:number;ebitda:number;margin:number;cash:number;items:number};
export function summarize(input: FinanceRecord[]): Metrics {
  const total=(key:keyof Pick<FinanceRecord,"revenue"|"budget"|"cost"|"opex"|"cash">)=>input.reduce((sum,r)=>sum+r[key],0);
  const revenue=total("revenue"),budget=total("budget"),cost=total("cost"),opex=total("opex"),ebitda=revenue-cost-opex;
  return {revenue,budget,variance:revenue-budget,cost,opex,ebitda,margin:revenue?ebitda/revenue*100:0,cash:total("cash"),items:input.length};
}
export const money=(v:number,compact=false)=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:compact?2:0,notation:compact?"compact":"standard"}).format(v);
export const pct=(n:number)=>`${n>=0?"+":""}${n.toFixed(1)}%`;
export const sampleSteps=[
  {time:"08:00:00",duration:"0.2s",name:"Execution started",details:"Procedure FIN-RPT-04 v2.3 · triggered by weekday schedule (Asia/Dubai)."},
  {time:"08:00:01",duration:"1.7s",name:"Sources retrieved",details:"Illustrative Excel planning workbook, ERP general ledger and bank snapshot. Demo dataset: 18 records across three entities."},
  {time:"08:00:03",duration:"2.1s",name:"Schema and permissions validated",details:"Expected fields, type checks, entity scope and simulated role policy checked. No external services contacted."},
  {time:"08:00:05",duration:"3.4s",name:"Reconciliation completed",details:"17 records passed; one intentionally flagged for review (Aurelia Gulf, September). Difference: $12,500."},
  {time:"08:00:09",duration:"1.8s",name:"Performance metrics calculated",details:"Revenue, EBITDA, budget variance and margins computed in deterministic JavaScript from synthetic records."},
  {time:"08:00:11",duration:"0.9s",name:"Narrative and board pack drafted",details:"Template-generated explanation using computed figures; no LLM or AI calls."},
  {time:"08:00:12",duration:"0.3s",name:"Approval requested",details:"Board pack staged in an approval queue. Original source data is unchanged."},
];
export type Schedule = {id:string;title:string;agent:string;time:string;zone:string;frequency:"weekdays"|"mondays"|"daily";enabled:boolean;needsApproval:boolean};
export const initialSchedules:Schedule[]=[
  {id:"FIN-RPT-04",title:"Daily financial close",agent:"automation",time:"08:00",zone:"Asia/Dubai",frequency:"weekdays",enabled:true,needsApproval:true},
  {id:"BOARD-PACK-07",title:"Executive board pack",agent:"reporting",time:"09:30",zone:"Asia/Dubai",frequency:"mondays",enabled:true,needsApproval:true},
  {id:"QA-LEDGER-02",title:"Ledger data-quality checks",agent:"quality",time:"07:45",zone:"Asia/Dubai",frequency:"daily",enabled:true,needsApproval:false},
];
export type Agent={id:string;name:string;department:string;description:string;initials:string;topics:string[]};
export const agents:Agent[]=[
  {id:"coordinator",name:"Executive Coordinator",department:"Cross-functional",description:"Routes business questions to authorised capabilities and summarises approved outcomes.",initials:"EC",topics:["What did the finance team complete?","Which approvals are pending?"]},
  {id:"financial",name:"Finance Analyst",department:"Financial reporting",description:"Explains financial KPIs, variances and their supporting records.",initials:"FA",topics:["Why is revenue below budget?","Which sources were used?"]},
  {id:"quality",name:"Data Quality Analyst",department:"Data foundations",description:"Identifies reconciliation gaps, source lineage and validation evidence.",initials:"DQ",topics:["Why was a record flagged?","Show data provenance"]},
  {id:"automation",name:"Workflow Operator",department:"Reliable automation",description:"Explains procedures, run duration, scheduling, approvals and next steps.",initials:"WO",topics:["How long did the task take?","Can I change the schedule?"]},
  {id:"forecast",name:"FP&A Scenario Analyst",department:"Quantitative intelligence",description:"Explores what-if impacts and authorised custom metrics.",initials:"FP",topics:["What if revenue falls by 5%?","Can I add a custom KPI?"]},
  {id:"reporting",name:"Board Pack Editor",department:"Decision-facing interfaces",description:"Prepares reports to an approved template, section list and writing style.",initials:"BP",topics:["How do I remove the conclusion?","How was this pack generated?"]},
  {id:"sales",name:"Sales Pipeline Assistant",department:"Commercial scope",description:"Answers about the signed-in seller's illustrative pipeline only.",initials:"SA",topics:["Show my open opportunities","Can I see other employees' payroll?"]},
];
export const pillars=[
  {number:"01",title:"Data foundations",sub:"Sources, quality and lineage",view:"data" as View},
  {number:"02",title:"Reliable automation",sub:"Scheduled workflows and controls",view:"workflows" as View},
  {number:"03",title:"Quantitative intelligence",sub:"Forecasting and scenario analysis",view:"intelligence" as View},
  {number:"04",title:"Decision-facing interfaces",sub:"CFO reporting and board packs",view:"reports" as View},
];
