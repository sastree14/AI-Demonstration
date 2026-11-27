"use client";
import {useMemo,useState} from "react";
import {Bot,BarChart3,FileText,ShieldCheck,Database,ArrowRight,LoaderCircle,Download,CheckCircle2} from "lucide-react";
import {records,entityLabels,type Entity} from "@/lib/demo";
import {reportingPeriod} from "@/lib/reportingPeriods";
import PeriodOptions from "./PeriodOptions";
import styles from "./AwaisCockpit.module.css";

type Region=Exclude<Entity,"all">;
const markets:Record<Region,string[]>={gulf:["United Arab Emirates","Saudi Arabia","Qatar","Oman","Kuwait","Bahrain"],europe:["Germany","Spain","France","United Kingdom","Italy","Netherlands","Poland"],asia:["India","Singapore","Malaysia","Thailand","Indonesia","Vietnam","Japan"]};
const divisions=["Core products","Growth products","Services"];
const sources=Array.from(new Set(records.map(r=>r.source)));
const currencies={USD:1,EUR:.92,AED:3.6725};
type Currency=keyof typeof currencies;
type Row={id:string;month:string;region:Region;country:string;division:string;source:string;revenue:number;budget:number;cost:number;opex:number;cash:number};
const rows:Row[]=records.flatMap(r=>markets[r.entity].flatMap((country,i)=>divisions.map((division,j)=>{
 const weights=markets[r.entity].map((_,k)=>Math.max(1,markets[r.entity].length-k));
 const w=weights[i]/weights.reduce((a,b)=>a+b,0)*[.52,.29,.19][j];
 return {id:r.id+"-"+i+"-"+j,month:r.month,region:r.entity,country,division,source:r.source,revenue:r.revenue*w,budget:r.budget*w,cost:r.cost*w,opex:r.opex*w,cash:r.cash*w};
})));
function totals(data:Row[],last:string|undefined){
 const t=data.reduce((a,r)=>({revenue:a.revenue+r.revenue,budget:a.budget+r.budget,cost:a.cost+r.cost,opex:a.opex+r.opex,cash:a.cash+(r.month===last?r.cash:0)}),{revenue:0,budget:0,cost:0,opex:0,cash:0});
 const gross=t.revenue-t.cost,ebitda=gross-t.opex,variance=t.revenue-t.budget;
 return {...t,gross,ebitda,variance,margin:t.revenue?ebitda/t.revenue*100:0,grossMargin:t.revenue?gross/t.revenue*100:0,variancePct:t.budget?variance/t.budget*100:0,costRatio:t.revenue?t.cost/t.revenue*100:0,opexRatio:t.revenue?t.opex/t.revenue*100:0,totalCosts:t.cost+t.opex};
}
type Metric=keyof ReturnType<typeof totals>;
const labels:Record<Metric,string>={revenue:"Revenue",budget:"Budget",cost:"Cost of sales",opex:"Operating expenses",cash:"Cash snapshot",gross:"Gross profit",ebitda:"EBITDA",variance:"Budget variance",margin:"EBITDA margin",grossMargin:"Gross margin",variancePct:"Budget variance %",costRatio:"Cost ratio",opexRatio:"Opex ratio",totalCosts:"Total costs"};
const keys=Object.keys(labels) as Metric[];
const ratio=(k:Metric)=>["margin","grossMargin","variancePct","costRatio","opexRatio"].includes(k);
type Group="month"|"country"|"division"|"source"|"region";
type Mode="overview"|"report"|"controls"|"sources";
type Command={label:string;agent:string;metrics?:Metric[];group?:Group;mode?:Mode;report?:string;note?:string;period?:string;};
const commands:Command[]=[
 {label:"Generate CFO daily brief",agent:"Executive Coordinator",mode:"report",report:"CFO daily brief"},
 {label:"Show group financial performance",agent:"Finance Analyst",metrics:["revenue","budget","ebitda"],group:"month"},
 {label:"Generate Q3 board pack",agent:"Board Pack Editor",mode:"report",report:"Q3 board pack",period:"q3"},
 {label:"Generate monthly management report",agent:"Board Pack Editor",mode:"report",report:"Monthly management report",period:"oct"},
 {label:"Compare Q3 2026 vs Q3 2025",agent:"Finance Analyst",metrics:["revenue","ebitda"],group:"month",note:"year"},
 {label:"Compare actuals vs budget",agent:"Finance Analyst",metrics:["revenue","budget","variance"],group:"month"},
 {label:"Explain revenue variance",agent:"Finance Analyst",metrics:["variance","variancePct"],group:"country"},
 {label:"Explain EBITDA performance",agent:"Finance Analyst",metrics:["ebitda","margin"],group:"division"},
 {label:"Show consolidated P&L",agent:"Finance Analyst",mode:"report",report:"Income statement"},
 {label:"Show cash position",agent:"Finance Analyst",metrics:["cash"],group:"country"},
 {label:"Show gross profit",agent:"Finance Analyst",metrics:["gross","grossMargin"],group:"month"},
 {label:"Rank markets by EBITDA",agent:"Finance Analyst",metrics:["ebitda"],group:"country"},
 {label:"Show revenue by country",agent:"Finance Analyst",metrics:["revenue"],group:"country"},
 {label:"Show costs by business unit",agent:"Finance Analyst",metrics:["cost","opex"],group:"division"},
 {label:"Identify underperforming divisions",agent:"Finance Analyst",metrics:["variance","margin"],group:"division"},
 {label:"Show high cost ratios",agent:"Finance Analyst",metrics:["costRatio","opexRatio"],group:"country"},
 {label:"Show FX presentation currency",agent:"Finance Analyst",note:"currency"},
 {label:"Show budget variance percentage",agent:"Finance Analyst",metrics:["variancePct"],group:"month"},
 {label:"Show revenue by source",agent:"Finance Analyst",metrics:["revenue"],group:"source"},
 {label:"Show regional performance",agent:"Finance Analyst",metrics:["revenue","ebitda"],group:"region"},
 {label:"Validate reporting data",agent:"Data Quality Analyst",mode:"controls"},
 {label:"Check consolidation exceptions",agent:"Data Quality Analyst",mode:"controls",note:"exception"},
 {label:"Inspect source coverage",agent:"Data Quality Analyst",mode:"sources"},
 {label:"Reconcile source totals",agent:"Data Quality Analyst",mode:"sources",metrics:["revenue","cost"],group:"source"},
 {label:"Trace KPI to its source",agent:"Data Quality Analyst",mode:"sources"},
 {label:"Generate executive commentary",agent:"Board Pack Editor",mode:"report",report:"Executive commentary"},
 {label:"Add EBITDA margin and gross profit",agent:"Finance Analyst",metrics:["margin","gross"],note:"add"},
 {label:"Schedule recurring financial reporting",agent:"Workflow Operator",mode:"report",report:"Recurring reporting template",note:"schedule"},
 {label:"Review pending approvals",agent:"Executive Coordinator",mode:"controls"},
 {label:"Prepare executive report for export",agent:"Board Pack Editor",mode:"report",report:"Executive financial report"}
];
const groupLabels:Record<Group,string>={month:"Month",country:"Country",division:"Business line",source:"Source",region:"Region"};
const roadmap=["Financial reporting","Margin & cost analysis","FP&A","Budgeting & forecasting","Close, reconcile & control","Cash & working capital","Financial modeling & scenarios","Integrated finance decision cockpit"];
type Props={period:string;setPeriod:(id:string)=>void;entity:Entity;setEntity:(e:Entity)=>void;resolved:boolean;canApprove:boolean};
export default function AwaisCockpit({period,setPeriod,entity,setEntity,resolved,canApprove}:Props){
 const [country,setCountry]=useState("all"),[division,setDivision]=useState("all"),[source,setSource]=useState("all"),[currency,setCurrency]=useState<Currency>("USD");
 const [metrics,setMetrics]=useState<Metric[]>(["revenue","budget","ebitda"]),[group,setGroup]=useState<Group>("month"),[mode,setMode]=useState<Mode>("overview");
 const [prompt,setPrompt]=useState(""),[busy,setBusy]=useState(false),[answer,setAnswer]=useState(""),[active,setActive]=useState("Executive Coordinator"),[report,setReport]=useState("Executive financial report"),[approvedKey,setApprovedKey]=useState(""),[schedule,setSchedule]=useState("Monthly"),[scheduleSaved,setScheduleSaved]=useState(""),[log,setLog]=useState<string[]>([]),[expanded,setExpanded]=useState(false);
 const marketsInScope=entity==="all"?Object.values(markets).flat():markets[entity];
 const scope=(p:string)=>rows.filter(r=>reportingPeriod(p).months.includes(r.month)&&(entity==="all"||r.region===entity)&&(country==="all"||r.country===country)&&(division==="all"||r.division===division)&&(source==="all"||r.source===source));
 const data=useMemo(()=>scope(period),[period,entity,country,division,source]);
 const last=reportingPeriod(period).months.filter(m=>data.some(r=>r.month===m)).at(-1);
 const t=totals(data,last);
 const fmt=(n:number,k:Metric)=>ratio(k)?n.toFixed(1)+"%":new Intl.NumberFormat("en-US",{style:"currency",currency,notation:"compact",maximumFractionDigits:2}).format(n*currencies[currency]);
 const periodLabel=reportingPeriod(period).label;
 const scopeText=[periodLabel,entityLabels[entity],country==="all"?"All markets":country,division==="all"?"All business lines":division,source==="all"?"All sources":source,currency].join(" · ");
 const snapshot=[scopeText,report,resolved].join("|");
 const approved=approvedKey===snapshot;
 const groups=useMemo(()=>{const names=Array.from(new Set(data.map(r=>r[group])));return names.map(name=>({name,t:totals(data.filter(r=>r[group]===name),group==="month"?name:last)}));},[data,group,last]);
 const sorted=group==="month"?groups:groups.slice().sort((a,b)=>b.t[metrics[0]]-a.t[metrics[0]]);
 function execute(c:Command){
  if(busy)return;setBusy(true);setActive(c.agent);setPrompt("");setAnswer("");
  const p=c.period||period,selected=scope(p),v=totals(selected,reportingPeriod(p).months.filter(m=>selected.some(r=>r.month===m)).at(-1));
  window.setTimeout(()=>{
   if(c.period)setPeriod(c.period);
   if(c.metrics)setMetrics(old=>c.note==="add"?Array.from(new Set([...old,...c.metrics!])):c.metrics!);
   if(c.group)setGroup(c.group);
   setMode(c.mode||"overview");
   if(c.report)setReport(c.report);
   let response=selected.length?c.label+": "+(c.metrics||["revenue","ebitda"]).map(k=>labels[k]+": "+fmt(v[k],k)).join(" · ")+".": "No records match the selected filters.";
   if(c.note==="year"){const prior=totals(scope("2025-q3"),"Sep 2025"),now=totals(scope("q3"),"Sep 2026");response="Q3 2026 versus Q3 2025: revenue "+fmt(now.revenue,"revenue")+" vs "+fmt(prior.revenue,"revenue")+"; EBITDA "+fmt(now.ebitda,"ebitda")+" vs "+fmt(prior.ebitda,"ebitda")+". Current chart uses the selected reporting period."; }
   if(c.note==="currency")response="Use the currency selector to convert every monetary result with fixed illustrative rates. This is not a live FX service.";
   if(c.mode==="controls")response=resolved?"The sample group reconciliation has been reviewed in the existing control workflow.":"Sample group reconciliation QA-17 remains open. Approval is blocked until the existing control is reviewed.";
   if(c.mode==="sources")response=selected.length+" illustrative allocated records; "+new Set(selected.map(r=>r.source)).size+" source types. Inspect the source table and download the selected records.";
   if(c.mode==="report")response=c.report+" prepared for "+reportingPeriod(p).label+". Review the figures and controls before approval.";
   if(c.note==="schedule")response="Select a frequency and save a local demonstration schedule. No external jobs will be created.";
   if(c.note==="add")response="Added "+c.metrics?.map(k=>labels[k]).join(" and ")+" to the chart; calculated from the current selection.";
   setAnswer(response);setLog(old=>[c.agent+" · "+c.label,...old].slice(0,12));setBusy(false);
  },750);
 }
 function ask(q:string){const v=q.trim().toLowerCase();if(!v||busy)return;const exact=commands.find(c=>c.label.toLowerCase()===v);if(exact){execute(exact);return;}
  if(/add|calculate|include/.test(v)){const found=keys.filter(k=>v.includes(labels[k].toLowerCase())).filter(k=>k!=="margin"||!v.includes("gross margin")||v.includes("ebitda margin"));if(found.length){execute({label:q,agent:"Finance Analyst",metrics:found,note:"add"});return;}}
  if(/board pack/.test(v)){execute(commands[2]);return;}if(/daily brief/.test(v)){execute(commands[0]);return;}if(/monthly.*report/.test(v)){execute(commands[3]);return;}if(/actual.*budget/.test(v)){execute(commands[5]);return;}if(/validat|reconcil|exception/.test(v)){execute(commands[20]);return;}if(/revenue.*country/.test(v)){execute(commands[12]);return;}setAnswer("This demonstration supports the prepared commands and metric additions. Choose one below; unrestricted AI is not connected.");
 }
 function download(name:string,body:string,type:string){const url=URL.createObjectURL(new Blob([body],{type}));const a=document.createElement("a");a.href=url;a.download=name;a.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000);}
 function exportData(){const cols=["id","month","region","country","division","source","revenue","budget","cost","opex","cash"] as const;download("finance-demo-selection.csv",cols.join(",")+"\n"+data.map(r=>cols.map(k=>typeof r[k]==="number"?Number(r[k]).toFixed(2):'"'+String(r[k]).replaceAll('"','""')+'"').join(",")).join("\n"),"text/csv");}
 function printReport(){const win=window.open("","_blank");if(!win)return;const doc=win.document;doc.title=report;const h=doc.createElement("h1");h.textContent=report;doc.body.append(h);const p=doc.createElement("p");p.textContent=scopeText+" · Fictional demonstration · "+(approved?"Reviewed in demo":"Draft");doc.body.append(p);const table=doc.createElement("table");table.style.cssText="border-collapse:collapse;width:100%;font:16px Arial";keys.forEach(k=>{const tr=table.insertRow();[labels[k],fmt(t[k],k)].forEach(value=>{const td=tr.insertCell();td.textContent=value;td.style.cssText="padding:9px;border-bottom:1px solid #ccc";});});doc.body.append(table);const n=doc.createElement("p");n.textContent="Sample control: "+(resolved?"reviewed":"open — not approved")+". Figures derive from illustrative source allocations.";doc.body.append(n);win.print();}
 const select=(label:string,value:string,onChange:(v:string)=>void,options:string[]) => <label className={styles.field}>{label}<select value={value} onChange={e=>onChange(e.target.value)}><option value="all">All</option>{options.map(o=><option key={o}>{o}</option>)}</select></label>;
 return <section className={styles.root} aria-label="Interactive CFO cockpit">
  <header className={styles.hero}><div><small>FINANCE INTELLIGENCE / TIER 1</small><h2>Interactive CFO cockpit</h2><p>Explore the same fictional financial ledger, ask a specialist agent and create management-ready outputs.</p></div><span>Illustrative data · guided AI</span></header>
  <div className={styles.filters}><label className={styles.field}>Cockpit reporting period<select value={period} onChange={e=>setPeriod(e.target.value)}><PeriodOptions/></select></label><label className={styles.field}>Region<select value={entity} onChange={e=>{setEntity(e.target.value as Entity);setCountry("all");}}>{Object.entries(entityLabels).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>{select("Country",country,setCountry,marketsInScope)}{select("Business line",division,setDivision,divisions)}{select("Source",source,setSource,sources)}<label className={styles.field}>Currency<select value={currency} onChange={e=>setCurrency(e.target.value as Currency)}>{Object.keys(currencies).map(c=><option key={c}>{c}</option>)}</select></label></div>
  <p className={styles.note}>20 illustrative markets · country and business-line values are synthetic allocations of the existing ledger. Fixed demo FX rates; source selection refers to the original records. Cash is the latest available snapshot. This view uses the original ledger before any manual adjustments in the separate workflow.</p>
  <div className={styles.kpis}>{(["revenue","ebitda","margin","variance","cash"] as Metric[]).map(k=><div key={k}><small>{labels[k]}</small><strong>{fmt(t[k],k)}</strong><span>{k==="cash"?"Latest snapshot":"Selected scope"}</span></div>)}</div>
  <div className={styles.layout}><aside className={styles.agents}><div className={styles.panelTitle}><Bot size={22}/><div><h3>Finance agents</h3><small>{active} · guided simulation</small></div></div><div className={styles.agentList}>{["Executive Coordinator","Finance Analyst","Data Quality Analyst","Board Pack Editor","Workflow Operator"].map(a=><span className={active===a?styles.selectedAgent:""} key={a}>{a}</span>)}</div><form className={styles.ask} onSubmit={e=>{e.preventDefault();ask(prompt)}}><input aria-label="Ask CFO cockpit agent" value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Add EBITDA margin and gross profit"/><button disabled={busy||!prompt.trim()} type="submit">Ask <ArrowRight size={14}/></button></form>{busy?<div role="status" className={styles.response}><LoaderCircle className={styles.spin} size={18}/> Reading selected records and preparing an output…</div>:answer?<div role="status" className={styles.response}>{answer}</div>:<p className={styles.note}>Try a prepared action. Financial calculations run on the data; agent responses are scripted.</p>}<div className={styles.commands}>{commands.slice(0,expanded?30:6).map(c=><button key={c.label} disabled={busy} onClick={()=>execute(c)}>{c.label}<ArrowRight size={13}/></button>)}</div><button className={styles.link} onClick={()=>setExpanded(!expanded)}>{expanded?"Show fewer actions":"Show all 30 actions"}</button></aside>
  <div className={styles.work}><nav className={styles.tabs} aria-label="CFO cockpit sections">{([["overview","Live dashboard"],["report","Reports"],["sources","Data & integrations"],["controls","Security & controls"]] as [Mode,string][]).map(([k,label])=><button aria-pressed={mode===k} key={k} onClick={()=>setMode(k)}>{label}</button>)}</nav>
  {mode==="overview"&&<><div className={styles.panelTitle}><BarChart3 size={21}/><div><h3>Build your financial view</h3><small>Every chart uses the active filters</small></div></div><label className={styles.field}>Break down by<select value={group} onChange={e=>setGroup(e.target.value as Group)}>{Object.entries(groupLabels).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label><div className={styles.metrics}>{keys.map(k=><button key={k} aria-pressed={metrics.includes(k)} onClick={()=>setMetrics(old=>old.includes(k)?old.length>1?old.filter(m=>m!==k):old:[...old,k])}>{labels[k]}</button>)}</div><div className={styles.charts}>{metrics.map(k=>{const max=Math.max(1,...sorted.map(g=>Math.abs(g.t[k])));return <section className={styles.chart} key={k}><h4>{labels[k]}</h4><strong>{fmt(t[k],k)}</strong>{sorted.length===0?<p>No matching data</p>:sorted.map(g=><div className={styles.barRow} key={g.name} title={g.name+": "+fmt(g.t[k],k)}><span>{g.name}</span><div><i style={{width:Math.abs(g.t[k])/max*100+"%",background:g.t[k]<0?"#c56c5a":undefined}}/></div><b>{fmt(g.t[k],k)}</b></div>)}</section>})}</div></>}
  {mode==="report"&&<><div className={styles.panelTitle}><FileText size={22}/><div><h3>{report}</h3><small>{approved?"Approved in demonstration":"Draft · review required"}</small></div></div><p className={styles.note}>{scopeText}</p><label className={styles.field}>Report template<select value={report} onChange={e=>setReport(e.target.value)}>{["Executive financial report","CFO daily brief","Q3 board pack","Monthly management report","Income statement","Executive commentary","Recurring reporting template"].map(r=><option key={r}>{r}</option>)}</select></label><p>Revenue is {fmt(t.revenue,"revenue")} with EBITDA of {fmt(t.ebitda,"ebitda")} and a budget variance of {fmt(t.variance,"variance")}. These figures reflect the current filters; underlying causes require supporting evidence.</p><table className={styles.table}><thead><tr><th>Metric</th><th>Selected result</th></tr></thead><tbody>{(["revenue","budget","cost","gross","opex","ebitda","margin","variance","cash"] as Metric[]).map(k=><tr key={k}><td>{labels[k]}</td><td>{fmt(t[k],k)}</td></tr>)}</tbody></table><p className={styles.note}>Group control: {resolved?"reviewed in the presentation":"QA-17 open — use the AI agents tab to review the sample discrepancy."}</p><div className={styles.actions}><button disabled={!canApprove||!resolved||!data.length||approved} onClick={()=>setApprovedKey(snapshot)}>{approved?"Approved snapshot":"Approve selected snapshot"}</button><button onClick={printReport}><Download size={16}/> Print / save cockpit report</button></div><label className={styles.field}>Recurring schedule (local example)<select value={schedule} onChange={e=>setSchedule(e.target.value)}>{["Daily","Weekly","Monthly","Quarterly"].map(x=><option key={x}>{x}</option>)}</select></label><button className={styles.link} disabled={!canApprove} onClick={()=>setScheduleSaved(schedule+" · "+report)}>Save demonstration schedule</button>{scheduleSaved&&<p className={styles.note}>{scheduleSaved} — saved for this session only; no actual scheduler.</p>}</>}
  {mode==="sources"&&<><div className={styles.panelTitle}><Database size={22}/><div><h3>Source evidence</h3><small>Illustrative ERP and planning records</small></div></div><table className={styles.table}><thead><tr><th>Source</th><th>Records</th><th>Revenue</th></tr></thead><tbody>{sources.map(s=>{const d=data.filter(r=>r.source===s);return <tr key={s}><td>{s}</td><td>{d.length}</td><td>{fmt(totals(d,last).revenue,"revenue")}</td></tr>})}</tbody></table><div className={styles.actions}><button onClick={exportData}><Download size={16}/> Download selected dummy data (USD)</button></div><p className={styles.note}>Connectors are illustrated only: ERP / accounting, planning exports, approved APIs and reporting tools.</p></>}
  {mode==="controls"&&<><div className={styles.panelTitle}><ShieldCheck size={22}/><div><h3>Reporting safeguards</h3><small>Proposed production architecture</small></div></div><div className={styles.controlGrid}>{["Approved data access and scoped permissions","Data minimisation and pseudonymisation before cloud AI","Automations without generative AI: calculations and reconciliations","Generative AI: commentary and guided requests","Human approval and versioned reporting","Audit evidence and source traceability"].map(x=><div key={x}><CheckCircle2 size={17}/>{x}</div>)}</div><p className={styles.note}>QA-17: {resolved?"reviewed in the original workflow":"open in the original workflow; approval is blocked."} These controls describe proposed production capabilities, not actual authentication or a security certification.</p><h4>Session activity</h4>{log.length?log.map((x,i)=><p className={styles.note} key={i}>{x}</p>):<p className={styles.note}>No commands executed yet.</p>}</>}
  </div></div><footer className={styles.roadmap}><h3>Finance automation roadmap</h3><div>{roadmap.map((r,i)=><span key={r}>{i+1}. {r} <small>{i===0?"Pilot focus":"Future scope"}</small></span>)}</div></footer>
 </section>;
}
