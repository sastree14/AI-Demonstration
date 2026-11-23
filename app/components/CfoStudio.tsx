"use client";

import {useEffect,useMemo,useState} from "react";
import {AlertTriangle,ArrowDownRight,ArrowRight,BarChart3,Check,CheckCircle2,ChevronRight,ClipboardCheck,Download,FileText,Filter,HelpCircle,LayoutDashboard,Plus,Printer,RefreshCw,Send,ShieldAlert,SlidersHorizontal,Sparkles,Table2,Trash2,Workflow} from "lucide-react";
import {entityLabels,months,records,type Entity} from "@/lib/demo";
import styles from "./CfoStudio.module.css";

type Tab="overview"|"ledger"|"studio"|"controls"|"report";
import PeriodOptions from "./PeriodOptions";
import {reportingPeriod} from "@/lib/reportingPeriods";
type Product="all"|"core"|"growth"|"services";
type Measure="revenue"|"budget"|"cost"|"opex"|"ebitda"|"variance"|"cash";
type Operation="ratio"|"difference"|"sum";
type Expense={id:string;month:string;entity:Exclude<Entity,"all">;product:Exclude<Product,"all">;category:string;amount:number;note:string};
type Kpi={id:string;name:string;a:Measure;b:Measure;operation:Operation;asPercent:boolean;frequency:"Monthly"|"Quarterly"};
type Proposal=Omit<Kpi,"id">;
type Message={sender:"cfo"|"assistant";body:string};
type ReportPart="summary"|"performance"|"costs"|"kpis"|"controls"|"decisions";
type Slice={id:string;month:string;entity:Exclude<Entity,"all">;product:Exclude<Product,"all">;revenue:number;budget:number;cost:number;opex:number};
type Totals={revenue:number;budget:number;cost:number;opex:number;ebitda:number;variance:number;cash:number};

const products:[Exclude<Product,"all">,number,string][]=[["core",.52,"Core products"],["growth",.29,"Growth products"],["services",.19,"Services"]];
const initialParts:ReportPart[]=["summary","performance","costs","kpis","controls","decisions"];
const partLabels:Record<ReportPart,string>={summary:"Executive summary",performance:"Financial performance",costs:"Costs & adjustments",kpis:"Custom indicators",controls:"Controls & exceptions",decisions:"Decision record"};
const measureLabels:Record<Measure,string>={revenue:"Revenue",budget:"Budget",cost:"Cost of sales",opex:"Operating expenses",ebitda:"EBITDA",variance:"Budget variance",cash:"Cash snapshot"};
const money=(n:number)=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n);
const shortMoney=(n:number)=>new Intl.NumberFormat("en-US",{notation:"compact",maximumFractionDigits:2}).format(n);
const number=(n:number)=>new Intl.NumberFormat("en-US",{maximumFractionDigits:1}).format(n);
const blankTotals=():Totals=>({revenue:0,budget:0,cost:0,opex:0,ebitda:0,variance:0,cash:0});
const seedKpis:Kpi[]=[];
const key="sc-finance-cfo-studio-v1";

function makeSlices():Slice[]{
 return records.flatMap(r=>{
  let used={revenue:0,budget:0,cost:0,opex:0};
  return products.map(([id,weight],index)=>{
   const last=index===products.length-1;
   const values={revenue:last?r.revenue-used.revenue:Math.round(r.revenue*weight),budget:last?r.budget-used.budget:Math.round(r.budget*weight),cost:last?r.cost-used.cost:Math.round(r.cost*weight),opex:last?r.opex-used.opex:Math.round(r.opex*weight)};
   used={revenue:used.revenue+values.revenue,budget:used.budget+values.budget,cost:used.cost+values.cost,opex:used.opex+values.opex};
   return {id:r.id+"-"+id,month:r.month,entity:r.entity,product:id,...values};
  });
 });
}
const syntheticRows=makeSlices();
function calc(rows:Slice[],expenses:Expense[],cash:number):Totals{
 const v=blankTotals();
 for(const r of rows){v.revenue+=r.revenue;v.budget+=r.budget;v.cost+=r.cost;v.opex+=r.opex;}
 for(const x of expenses){v.opex+=x.amount;}
 v.ebitda=v.revenue-v.cost-v.opex;v.variance=v.revenue-v.budget;v.cash=cash;
 return v;
}
function getValue(t:Totals,m:Measure){return t[m];}
function evaluate(k:Proposal|Kpi,t:Totals):number|null{
 const a=getValue(t,k.a),b=getValue(t,k.b);
 if(k.operation==="sum")return a+b;
 if(k.operation==="difference")return a-b;
 if(!b)return null;
 return a/b*(k.asPercent?100:1);
}
function formula(k:Proposal|Kpi):string{
 const x=measureLabels[k.a],y=measureLabels[k.b];
 return k.operation==="ratio"?"("+x+" ÷ "+y+")"+(k.asPercent?" × 100":""):k.operation==="sum"?x+" + "+y:x+" − "+y;
}
function propose(request:string):{proposal:Proposal;confidence:boolean}{
 const s=request.toLowerCase();
 const is=(...v:string[])=>v.some(t=>s.includes(t));
 let a:Measure="opex",b:Measure="revenue",name="Operating expense ratio",operation:Operation="ratio",asPercent=true,confidence=true;
 if(is("gross margin","gross profit")){a="revenue";b="cost";operation="difference";asPercent=false;name="Gross profit";}
 else if(is("ebitda","operating margin","profit margin")){a="ebitda";b="revenue";name="EBITDA margin";}
 else if(is("budget attainment","budget achievement","actual versus budget","actual vs budget")){a="revenue";b="budget";name="Budget attainment";}
 else if(is("budget variance","budget deviation")){a="revenue";b="budget";operation="difference";asPercent=false;name="Budget variance";}
 else if(is("cost of sales","cost to revenue","cogs")){a="cost";b="revenue";name="Cost of sales ratio";}
 else if(is("cash coverage","cash to expense")){a="cash";b="opex";asPercent=false;name="Cash to expenses (snapshot ratio)";}
 else if(is("expense","opex","overhead")){a="opex";b="revenue";name="Operating expense ratio";}
 else {confidence=false;name=request.trim().slice(0,55)||"New financial indicator";}
 return {proposal:{name,a,b,operation,asPercent,frequency:"Monthly"},confidence};
}
function pythonExample(k:Proposal|Kpi):string{
 const a=k.a,b=k.b;
 if(k.operation==="ratio")return "numerator = totals[\""+a+"\"]\ndenominator = totals[\""+b+"\"]\nvalue = (numerator / denominator * "+(k.asPercent?"100":"1")+") if denominator else None";
 return "value = totals[\""+a+"\"] "+(k.operation==="sum"?"+":"-")+" totals[\""+b+"\"]";
}
const nav:[Tab,string,typeof LayoutDashboard][]=[["overview","Overview",LayoutDashboard],["ledger","Data & adjustments",Table2],["studio","KPI design",Sparkles],["controls","Review & controls",ShieldAlert],["report","Board pack",FileText]];
const startingMessages:Message[]=[{sender:"assistant",body:"Describe the indicator you would like to monitor. I will propose a calculation, explain its inputs and ask for your approval before adding it to the dashboard. This is a guided simulation, not a live AI model."}];

export default function CfoStudio({onAdvanced,embedded=false,initialTab="overview",period,setPeriod}:{period:string;setPeriod:(id:string)=>void;onAdvanced:()=>void;embedded?:boolean;initialTab?:Tab}){
 const [tab,setTab]=useState<Tab>(initialTab);
 const selection=reportingPeriod(period);
 const [entity,setEntity]=useState<Entity>("all");
 const [product,setProduct]=useState<Product>("all");
 const [expenses,setExpenses]=useState<Expense[]>([]);
 const [saved,setSaved]=useState<Kpi[]>(seedKpis);
 const [reviewNote,setReviewNote]=useState("");
 const [approved,setApproved]=useState(false);
 const [reviewedNote,setReviewedNote]=useState("");
 const [reportParts,setReportParts]=useState<ReportPart[]>(initialParts);
 const [showAdd,setShowAdd]=useState(false);
 const [amount,setAmount]=useState("");
 const [expenseMonth,setExpenseMonth]=useState("Sep 2026");
 const [expenseEntity,setExpenseEntity]=useState<Exclude<Entity,"all">>("gulf");
 const [expenseProduct,setExpenseProduct]=useState<Exclude<Product,"all">>("core");
 const [expenseCategory,setExpenseCategory]=useState("Other operating expense");
 const [expenseNote,setExpenseNote]=useState("");
 const [feedback,setFeedback]=useState("");
 const [request,setRequest]=useState("");
 const [proposal,setProposal]=useState<Proposal|null>(null);
 const [messages,setMessages]=useState<Message[]>(startingMessages);
 const [loaded,setLoaded]=useState(false);
 useEffect(()=>{
  try{
   const s=JSON.parse(localStorage.getItem(key)||"{}") as {expenses?:Expense[];saved?:Kpi[];approved?:boolean;reviewedNote?:string;reportParts?:ReportPart[]};
   if(Array.isArray(s.expenses))setExpenses(s.expenses.filter(x=>Number.isFinite(x.amount)&&x.amount>0));
   if(Array.isArray(s.saved))setSaved(s.saved);
   if(typeof s.approved==="boolean")setApproved(s.approved);
   if(typeof s.reviewedNote==="string")setReviewedNote(s.reviewedNote);
   if(Array.isArray(s.reportParts))setReportParts(s.reportParts);
  }catch{}
  setLoaded(true);
 },[]);
 useEffect(()=>{if(loaded){localStorage.setItem(key,JSON.stringify({expenses,saved,approved,reviewedNote,reportParts}));window.dispatchEvent(new Event("sc-finance:changed"));}},[expenses,saved,approved,reviewedNote,reportParts,loaded]);
 const monthsIn=selection.months;
 const scoped=useMemo(()=>syntheticRows.filter(r=>monthsIn.includes(r.month)&&(entity==="all"||entity===r.entity)&&(product==="all"||product===r.product)),[monthsIn,entity,product]);
 const added=useMemo(()=>expenses.filter(x=>monthsIn.includes(x.month)&&(entity==="all"||entity===x.entity)&&(product==="all"||product===x.product)),[expenses,monthsIn,entity,product]);
 const cash=useMemo(()=>{
  const end=months.filter(m=>monthsIn.includes(m)).slice(-1)[0];
  return records.filter(x=>x.month===end&&(entity==="all"||x.entity===entity)).reduce((s,x)=>s+x.cash,0);
 },[monthsIn,entity]);
 const totals=useMemo(()=>calc(scoped,added,cash),[scoped,added,cash]);
 const monthly=useMemo(()=>monthsIn.map(m=>({month:m.slice(0,3),...calc(scoped.filter(r=>r.month===m),added.filter(x=>x.month===m),0)})),[scoped,added,monthsIn]);
 const maxChart=Math.max(1,...monthly.map(x=>Math.max(x.revenue,x.budget)));
 const pending=approved?0:1;
 const grossProfit=totals.revenue-totals.cost;
 const margin=totals.revenue?totals.ebitda/totals.revenue*100:0;
 const variancePct=totals.budget?totals.variance/totals.budget*100:0;
 const closeMonth=monthsIn[monthsIn.length-1];
 const gulfSep=records.find(x=>x.entity==="gulf"&&x.month==="Sep 2026");
 const ledger=gulfSep?.cash||0;
 const bank=ledger-12500;
 const notify=(msg:string)=>{setFeedback(msg);};
 function addExpense(e:React.FormEvent){
  e.preventDefault();
  const value=Number(amount);
  if(!Number.isFinite(value)||value<=0){notify("Enter an amount greater than zero.");return;}
  if(!expenseNote.trim()){notify("Add a description so the adjustment can be reviewed.");return;}
  setExpenses(prev=>[...prev,{id:"EXP-"+Date.now(),month:expenseMonth,entity:expenseEntity,product:expenseProduct,category:expenseCategory,amount:value,note:expenseNote.trim()}]);
  setAmount("");setExpenseNote("");setShowAdd(false);notify("Expense added to the local analysis and board pack. Original source files are unchanged.");
 }
 function ask(e:React.FormEvent){
  e.preventDefault();
  const q=request.trim();if(!q)return;
  const d=propose(q);
  setProposal(d.proposal);
  setMessages(prev=>[...prev,{sender:"cfo",body:q},{sender:"assistant",body:d.confidence?"I have drafted a proposed definition. Please check the inputs, calculation, reporting frequency and any scope filters below. Nothing is added until you approve it.":"I cannot reliably infer this indicator from the wording alone. Please choose the source measures and calculation below, then approve the definition."}]);
  setRequest("");
 }
 function saveKpi(){
  if(!proposal||!proposal.name.trim()){notify("Give the KPI a name first.");return;}
  if(proposal.operation==="ratio"&&proposal.a===proposal.b){notify("For a ratio, choose two different measures.");return;}
  const k={...proposal,id:"KPI-"+Date.now()};
  setSaved(prev=>[...prev,k]);
  setMessages(prev=>[...prev,{sender:"assistant",body:"Approved: "+k.name+" = "+formula(k)+". It now appears on this dashboard and in the selected report section. The saved definition is local to this browser. A production version would submit a reviewed rule to the governed calculation pipeline; this demo does not edit Python or deploy code."}]);
  setProposal(null);notify("Saved KPI added to dashboard and board pack.");
 }
 function approve(){
  if(reviewNote.trim().length<8){notify("Please record at least eight characters describing your review decision.");return;}
  setApproved(true);setReviewedNote(reviewNote.trim());setReviewNote("");notify("Exception acknowledgement saved locally. The source discrepancy has not been corrected.");
 }
 const selectParts=(p:ReportPart)=>setReportParts(x=>x.includes(p)?x.filter(v=>v!==p):[...x,p]);
 const labelProduct=product==="all"?"All business lines":products.find(x=>x[0]===product)?.[2];
 return <div className={`${styles.shell} ${embedded?styles.embedded:""}`}>
  {!embedded&&<header className={styles.header}>
   <div className={styles.brand}><div className={styles.symbol}>S<span>.</span></div><div><strong>SC-Analytics</strong><small>FINANCE INTELLIGENCE / DEMONSTRATION</small></div></div>
   <div className={styles.topNote}><span className={styles.pulse}/>Illustrative data only <span className={styles.topDivider}>/</span> Browser-only workspace</div>
  </header>}
  <div className={styles.navBar}><div className={styles.navInner}>{nav.map(([id,title,Icon])=><button key={id} type="button" className={tab===id?styles.activeNav:styles.nav} onClick={()=>{setTab(id);setFeedback("");}}><Icon size={16}/><span>{title}</span></button>)}</div></div>
  <main className={styles.main}>
   <div className={styles.heading}><div><div className={styles.overline}>AURELIA GROUP <span className={styles.sep}>/</span> CFO WORKSPACE</div><h1>{tab==="overview"?"A clearer view of the numbers":tab==="ledger"?"Make changes with context":tab==="studio"?"Define the indicators you need":tab==="controls"?"Review exceptions before reporting":"A board pack worth presenting"}</h1><p>{tab==="overview"?"Financial performance, controls and decisions in one place.":tab==="ledger"?"Explore the source records and model additional operating expenses without altering an ERP.":tab==="studio"?"Describe a KPI, review the calculation and add it to your reporting.":tab==="controls"?"See where two simulated source records disagree and document the decision.":"Select only what your board needs. Preview the finished report and save it as a PDF."}</p></div><div className={styles.headingAside}><span>FINANCE PERIOD</span><strong>{selection.label}</strong><small>Fictional organisation · USD</small></div></div>
   <div className={styles.toolbar}>
    <label>Period <select aria-label="Period" value={period} onChange={e=>setPeriod(e.target.value)}><PeriodOptions/></select></label>
    <label>Business unit <select value={entity} onChange={e=>setEntity(e.target.value as Entity)}><option value="all">Group consolidated</option><option value="europe">Europe</option><option value="gulf">Gulf</option><option value="asia">Asia</option></select></label>
    <label>Product / line <select value={product} onChange={e=>setProduct(e.target.value as Product)}><option value="all">All business lines</option>{products.map(p=><option key={p[0]} value={p[0]}>{p[2]}</option>)}</select></label>
    <span className={styles.toolbarNote}><Filter size={13}/> Filters apply to figures and report</span>
   </div>
   {feedback&&<div className={styles.feedback} role="status"><CheckCircle2 size={16}/>{feedback}<button onClick={()=>setFeedback("")} aria-label="Dismiss notification">×</button></div>}
   {tab==="overview"&&<>
    <div className={styles.metricGrid}>
     <div className={styles.metric}><span>Revenue</span><strong>{shortMoney(totals.revenue)}</strong><small>Actual · {selection.label}</small></div>
     <div className={styles.metric}><span>EBITDA</span><strong>{shortMoney(totals.ebitda)}</strong><small>{number(margin)}% operating margin</small></div>
     <div className={styles.metric}><span>vs. budget</span><strong className={totals.variance<0?styles.negative:styles.positive}>{shortMoney(totals.variance)}</strong><small>{number(variancePct)}% of plan</small></div>
     <div className={styles.metric}><span>Cash snapshot</span><strong>{shortMoney(totals.cash)}</strong><small>Latest selected month · entity-level</small></div>
    </div>
    <div className={styles.contentGrid}>
     <section className={styles.panel}><div className={styles.panelHead}><div><span className={styles.kicker}>PERFORMANCE</span><h2>Actual vs. budget</h2></div><span className={styles.mini}>Revenue, USD</span></div><div className={styles.legend}><span><i className={styles.actualKey}/> Actual</span><span><i className={styles.budgetKey}/> Budget</span></div><div className={styles.chart}>{monthly.map(x=><div className={styles.barGroup} key={x.month}><div className={styles.barPair}><div className={styles.actualBar} style={{height:(x.revenue/maxChart*100)+"%"}} title={"Actual "+money(x.revenue)}/><div className={styles.budgetBar} style={{height:(x.budget/maxChart*100)+"%"}} title={"Budget "+money(x.budget)}/></div><span>{x.month}</span></div>)}</div><p className={styles.insight}>Operating profit reflects {added.length} manual adjustment{added.length!==1?"s":""} in this selection. The cash balance is an end-of-period snapshot, not the sum of monthly balances.</p></section>
     <section className={styles.panel}><div className={styles.panelHead}><div><span className={styles.kicker}>REQUIRES ATTENTION</span><h2>Close readiness</h2></div><span className={pending?styles.warningPill:styles.goodPill}>{pending?"1 control outstanding":"Review recorded"}</span></div><div className={styles.alert}><AlertTriangle size={20}/><div><strong>Bank and ledger mismatch</strong><p>Aurelia Gulf · September 2026</p><p>Difference of <b>{money(12500)}</b> across two illustrative sources.</p></div></div><div className={styles.workflowRows}><div><Check size={16}/>Data collected and structured</div><div><Check size={16}/>Financial KPIs recalculated</div><div className={pending?styles.awaiting:undefined}><span>{pending?"!":"✓"}</span>{pending?"Manual review required":"Exception documented"}</div><div><span>{pending?"○":"✓"}</span>Board pack {pending?"ready as draft":"available for approval"}</div></div><button className={styles.linkButton} onClick={()=>setTab("controls")}>Open review & controls <ArrowRight size={15}/></button></section>
    </div>
    <div className={styles.bottomGrid}>
     <section className={styles.panel}><div className={styles.panelHead}><div><span className={styles.kicker}>CUSTOM METRICS</span><h2>Your indicators</h2></div><button className={styles.textButton} onClick={()=>setTab("studio")}><Plus size={15}/> Design KPI</button></div>{saved.length===0?<p className={styles.empty}>No custom KPIs yet. Tell the guided assistant which financial indicator you need and approve its definition.</p>:<div className={styles.kpiGrid}>{saved.map(k=><div className={styles.savedKpi} key={k.id}><small>{k.name}</small><strong>{evaluate(k,totals)===null?"N/A":k.asPercent&&k.operation==="ratio"?number(evaluate(k,totals)!)+"%":number(evaluate(k,totals)!)}</strong><span>{formula(k)}</span></div>)}</div>}</section>
     <section className={styles.panel}><div className={styles.panelHead}><div><span className={styles.kicker}>DELIVERABLE</span><h2>Board-ready PDF report</h2></div><FileText size={18}/></div><p className={styles.empty}>A structured executive report with configurable sections, supporting KPIs and an explicit review status.</p><button className={styles.primary} onClick={()=>setTab("report")}>Prepare board pack <ChevronRight size={16}/></button></section>
    </div>
   </>}
   {tab==="ledger"&&<>
    <div className={styles.contentGrid}>
     <section className={styles.panel}><div className={styles.panelHead}><div><span className={styles.kicker}>DATA FOUNDATION</span><h2>Inputs and calculations</h2></div><span className={styles.goodPill}>Fictional dataset</span></div><div className={styles.sourceRow}><span>01</span><div><strong>ERP / general ledger</strong><small>Actual revenue, cost of sales and monthly balances</small></div></div><div className={styles.sourceRow}><span>02</span><div><strong>Planning workbook</strong><small>Budget comparison and reporting dimensions</small></div></div><div className={styles.sourceRow}><span>03</span><div><strong>Manual addenda</strong><small>Locally entered expenses applied to the KPI layer</small></div></div><div className={styles.explainer}><HelpCircle size={16}/>Product allocation is simulated from the aggregate source rows. In a real engagement, product-level figures require transaction-level source data.</div></section>
     <section className={styles.panel}><div className={styles.panelHead}><div><span className={styles.kicker}>MANUAL ADJUSTMENT</span><h2>Add an operating expense</h2></div><button className={styles.textButton} onClick={()=>{if(!showAdd)setExpenseMonth(closeMonth);setShowAdd(v=>!v)}}><Plus size={16}/>{showAdd?"Close":"Add expense"}</button></div><p className={styles.muted}>Test what happens when an unrecorded cost needs to be included in the reporting layer. The original ledger is not changed.</p>{showAdd?<form onSubmit={addExpense} className={styles.form}><div className={styles.fields}><label>Amount (USD)<input type="number" min="0.01" step="0.01" required value={amount} onChange={e=>setAmount(e.target.value)} placeholder="1250"/></label><label>Month<select value={expenseMonth} onChange={e=>setExpenseMonth(e.target.value)}>{months.map(x=><option key={x}>{x}</option>)}</select></label><label>Entity<select value={expenseEntity} onChange={e=>setExpenseEntity(e.target.value as Exclude<Entity,"all">)}><option value="europe">Europe</option><option value="gulf">Gulf</option><option value="asia">Asia</option></select></label><label>Business line<select value={expenseProduct} onChange={e=>setExpenseProduct(e.target.value as Exclude<Product,"all">)}>{products.map(x=><option value={x[0]} key={x[0]}>{x[2]}</option>)}</select></label><label>Category<select value={expenseCategory} onChange={e=>setExpenseCategory(e.target.value)}><option>Other operating expense</option><option>Software subscription</option><option>External consulting</option><option>Travel & operations</option><option>Marketing expense</option></select></label><label>Reason<input required value={expenseNote} onChange={e=>setExpenseNote(e.target.value)} placeholder="Why was this expense added?"/></label></div><button type="submit" className={styles.primary}><Plus size={15}/> Apply adjustment</button></form>:<div className={styles.callout}><strong>{money(added.reduce((n,x)=>n+x.amount,0))}</strong><span>Additional expenses applied to current filters</span><button className={styles.secondary} onClick={()=>setShowAdd(true)}>Add another</button></div>}</section>
    </div>
    <section className={styles.panel}><div className={styles.panelHead}><div><span className={styles.kicker}>ADJUSTMENTS</span><h2>Locally entered expenses</h2></div><span className={styles.mini}>{expenses.length} total</span></div>{expenses.length?<div className={styles.tableScroll}><table className={styles.table}><thead><tr><th>Period</th><th>Entity</th><th>Business line</th><th>Category / reason</th><th className={styles.right}>Amount</th><th/></tr></thead><tbody>{expenses.map(x=><tr key={x.id}><td>{x.month}</td><td>{entityLabels[x.entity]}</td><td>{products.find(p=>p[0]===x.product)?.[2]}</td><td><strong>{x.category}</strong><small>{x.note}</small></td><td className={styles.right}>{money(x.amount)}</td><td><button className={styles.iconButton} onClick={()=>setExpenses(old=>old.filter(y=>y.id!==x.id))} aria-label={"Remove "+x.category}><Trash2 size={15}/></button></td></tr>)}</tbody></table></div>:<p className={styles.empty}>No adjustments recorded. Add an expense to see EBITDA, margins, the dashboard and the report update automatically.</p>}</section>
    <section className={styles.panel}><div className={styles.panelHead}><div><span className={styles.kicker}>TRACEABLE FIGURES</span><h2>Financial source rows</h2></div><span className={styles.mini}>{scoped.length} synthetic allocations</span></div><div className={styles.tableScroll}><table className={styles.table}><thead><tr><th>Month</th><th>Entity</th><th>Product / line</th><th className={styles.right}>Revenue</th><th className={styles.right}>Budget</th><th className={styles.right}>Cost</th><th className={styles.right}>OpEx</th></tr></thead><tbody>{scoped.slice(-24).reverse().map(x=><tr key={x.id}><td>{x.month}</td><td>{entityLabels[x.entity]}</td><td>{products.find(p=>p[0]===x.product)?.[2]}</td><td className={styles.right}>{money(x.revenue)}</td><td className={styles.right}>{money(x.budget)}</td><td className={styles.right}>{money(x.cost)}</td><td className={styles.right}>{money(x.opex)}</td></tr>)}</tbody></table></div><p className={styles.caption}>Showing the latest 24 allocations for readability. Group and period aggregates include all selected records.</p></section>
   </>}
   {tab==="studio"&&<div className={styles.studioGrid}>
    <section className={styles.panel}><div className={styles.panelHead}><div><span className={styles.kicker}>GUIDED KPI DESIGN</span><h2>Describe what you want to measure</h2></div><span className={styles.mini}>Deterministic simulation</span></div><div className={styles.chat}>{messages.map((m,i)=><div className={m.sender==="cfo"?styles.userMessage:styles.assistantMessage} key={i}><small>{m.sender==="cfo"?"FINANCE DIRECTOR":"KPI DESIGN ASSISTANT"}</small><p>{m.body}</p></div>)}</div><form onSubmit={ask} className={styles.chatForm}><input value={request} onChange={e=>setRequest(e.target.value)} placeholder="e.g. Show me EBITDA margin by quarter" aria-label="Describe a KPI"/><button type="submit" aria-label="Send request"><Send size={17}/></button></form><div className={styles.suggestions}><span>Try:</span>{["EBITDA margin by quarter","Operating expense ratio","Budget attainment"].map(x=><button key={x} onClick={()=>setRequest(x)}>{x}</button>)}</div><div className={styles.explainer}><HelpCircle size={16}/>This demonstration proposes supported financial formulas using rules, not an external AI model. No code is executed or modified on a server.</div></section>
    <section className={styles.panel}><div className={styles.panelHead}><div><span className={styles.kicker}>DEFINITION & APPROVAL</span><h2>{proposal?"Review proposed calculation":"Your measurement rules"}</h2></div></div>{proposal?<div className={styles.form}><label>KPI name<input value={proposal.name} onChange={e=>setProposal({...proposal,name:e.target.value})}/></label><div className={styles.fields}><label>First measure<select value={proposal.a} onChange={e=>setProposal({...proposal,a:e.target.value as Measure})}>{Object.entries(measureLabels).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label><label>Second measure<select value={proposal.b} onChange={e=>setProposal({...proposal,b:e.target.value as Measure})}>{Object.entries(measureLabels).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label><label>Calculation<select value={proposal.operation} onChange={e=>setProposal({...proposal,operation:e.target.value as Operation})}><option value="ratio">Ratio</option><option value="difference">Difference</option><option value="sum">Sum</option></select></label><label>Recalculation cadence<select value={proposal.frequency} onChange={e=>setProposal({...proposal,frequency:e.target.value as Proposal["frequency"]})}><option>Monthly</option><option>Quarterly</option></select></label></div><label className={styles.checkbox}><input type="checkbox" checked={proposal.asPercent} disabled={proposal.operation!=="ratio"} onChange={e=>setProposal({...proposal,asPercent:e.target.checked})}/> Show ratio as percentage</label><div className={styles.definition}><small>PROPOSED CALCULATION</small><strong>{formula(proposal)}</strong><span>Selected scope: {selection.label} / {entityLabels[entity]} / {labelProduct}</span><strong className={styles.previewValue}>Preview: {evaluate(proposal,totals)===null?"Not available (zero denominator)":proposal.operation==="ratio"&&proposal.asPercent?number(evaluate(proposal,totals)!)+"%":number(evaluate(proposal,totals)!)}</strong></div><div className={styles.buttonRow}><button className={styles.primary} onClick={saveKpi}><Check size={16}/> Approve & save KPI</button><button className={styles.secondary} onClick={()=>setProposal(null)}>Discard</button></div><p className={styles.caption}>The formula is evaluated over the current filters. The definition is saved for later sessions in this browser only. It is not deployed to a real calculation pipeline.</p></div>:<div className={styles.definition}><span>01 &nbsp; Describe a decision you need to make</span><span>02 &nbsp; Validate the proposed measures and formula</span><span>03 &nbsp; Preview across periods and entities</span><span>04 &nbsp; Approve a reusable KPI for reports</span></div>}
    <div className={styles.divider}/>
    <div className={styles.panelHead}><h2>Saved indicators</h2><span className={styles.mini}>{saved.length} saved</span></div>{saved.length===0?<p className={styles.empty}>Saved definitions will appear here and automatically flow into the overview and board pack.</p>:saved.map(k=><div className={styles.savedRow} key={k.id}><div><strong>{k.name}</strong><small>{formula(k)} · {k.frequency}</small><small>Current value: {evaluate(k,totals)===null?"N/A":number(evaluate(k,totals)!)+(k.operation==="ratio"&&k.asPercent?"%":"")}</small></div><button className={styles.iconButton} aria-label={"Remove "+k.name} onClick={()=>setSaved(x=>x.filter(y=>y.id!==k.id))}><Trash2 size={15}/></button></div>)}
    {saved.length>0&&<details className={styles.codeDetails}><summary>Example Python calculation for implementation</summary><p>Illustrative code only; it is not executed or committed to a server.</p><pre>{pythonExample(saved[saved.length-1])}</pre></details>}
    </section></div>}
   {tab==="controls"&&<>
    <div className={styles.reviewGrid}><section className={styles.panel}><div className={styles.panelHead}><div><span className={styles.kicker}>RECONCILIATION</span><h2>One exception requires attention</h2></div><span className={approved?styles.goodPill:styles.warningPill}>{approved?"Acknowledged":"Open for review"}</span></div><p className={styles.muted}>Our fictional bank snapshot and general-ledger balance disagree for the same entity and reporting date. A normal workflow would pause publication until a finance owner investigates.</p><div className={styles.compare}><div><small>GENERAL LEDGER</small><strong>{money(ledger)}</strong><span>Source: ERP export</span></div><div><small>BANK SNAPSHOT</small><strong>{money(bank)}</strong><span>Source: bank statement</span></div></div><div className={styles.discrepancy}><AlertTriangle size={18}/><span>Unexplained balance difference</span><strong>{money(ledger-bank)}</strong></div><div className={styles.evidence}><strong>What should the finance team check?</strong><p>Posting date, missing bank transaction, duplicate entry, timing difference or the mapping between account balances. This demo does not automatically declare one explanation to be true.</p></div></section>
    <section className={styles.panel}><div className={styles.panelHead}><div><span className={styles.kicker}>HUMAN DECISION</span><h2>Document your review</h2></div><ClipboardCheck size={19}/></div>{approved?<div className={styles.reviewed}><CheckCircle2 size={22}/><strong>Decision recorded</strong><p>{reviewedNote}</p><small>Discrepancy remains visible in the report. This action does not change either source.</small><button className={styles.secondary} onClick={()=>setApproved(false)}>Reopen review</button></div>:<><p className={styles.muted}>Record what was investigated or why publication is approved with an outstanding exception. Never silently modify source balances.</p><label className={styles.form}>Review note<textarea rows={5} value={reviewNote} onChange={e=>setReviewNote(e.target.value)} placeholder="e.g. CFO checked the September bank cut-off. Timing difference accepted for the draft pack, follow-up assigned to finance operations."/></label><button className={styles.primary} onClick={approve}><Check size={15}/> Acknowledge & record decision</button></>}</section></div>
    <section className={styles.panel}><div className={styles.panelHead}><div><span className={styles.kicker}>GOVERNED WORKFLOW</span><h2>From data to a board pack</h2></div><Workflow size={18}/></div><div className={styles.steps}>{[["01","Collect","Synthetic ERP, workbook and bank data"],["02","Validate","Source checks detect an unresolved $12,500 variance"],["03","Calculate","Recompute financial KPIs with approved local adjustments"],["04","Review",approved?"CFO acknowledgement documented":"Finance owner action still required"],["05","Publish",approved?"Board pack may be exported with exception note":"Report stays marked as draft"]].map(([id,t,desc],i)=><div className={styles.step} key={id}><span>{id}</span><div><strong>{t}</strong><small>{desc}</small></div><b className={i<3||approved?styles.stepDone:styles.stepWaiting}>{i<3||approved?"✓":"·"}</b></div>)}</div></section>
   </>}
   {tab==="report"&&<div className={styles.reportGrid}>
    <aside className={styles.reportOptions}><section className={styles.panel}><div className={styles.panelHead}><div><span className={styles.kicker}>REPORT BUILDER</span><h2>Include in the report</h2></div><SlidersHorizontal size={17}/></div><p className={styles.muted}>Choose the sections your board needs. The preview updates immediately.</p><div className={styles.checkList}>{initialParts.map(p=><label key={p}><input type="checkbox" checked={reportParts.includes(p)} onChange={()=>selectParts(p)}/><span>{partLabels[p]}</span></label>)}</div><div className={styles.divider}/><span className={approved?styles.goodPill:styles.warningPill}>{approved?"Reviewed · exception documented":"Draft · pending review"}</span><p className={styles.caption}>Use your browser’s Print / Save as PDF dialog to create the report. The data is local and fictional.</p><button className={styles.primary} onClick={()=>window.print()}><Printer size={16}/> Print / Save PDF</button></section></aside>
    <article className={styles.reportPage}><div className={styles.reportTop}><strong>SC-ANALYTICS / FINANCE INTELLIGENCE</strong><span>BOARD REPORT · DEMO</span></div><div className={styles.reportHero}><div className={styles.kicker}>AURELIA GROUP · EXECUTIVE FINANCE</div><h2>Management performance report</h2><p>{selection.label} · {entityLabels[entity]} · {labelProduct}</p><div className={styles.reportStatus}>{approved?"FINANCE REVIEW RECORDED":"DRAFT — FINANCE REVIEW REQUIRED"}</div></div><div className={styles.reportBody}>
     {reportParts.includes("summary")&&<section className={styles.reportSection}><h3>01 / Executive summary</h3><p>Revenue was {money(totals.revenue)} against a budget of {money(totals.budget)}, representing a variance of {money(totals.variance)} ({number(variancePct)}%). Operating EBITDA totalled {money(totals.ebitda)}, corresponding to a {number(margin)}% margin.</p><p>This report includes {added.length} locally entered adjustment{added.length===1?"":"s"} within the selected scope. Figures use entirely fictional source records.</p></section>}
     {reportParts.includes("performance")&&<section className={styles.reportSection}><h3>02 / Financial performance</h3><div className={styles.reportNumbers}>{[["Revenue",totals.revenue],["Budget",totals.budget],["EBITDA",totals.ebitda],["Cash closing balance",totals.cash]].map(([name,v])=><div key={String(name)}><small>{String(name)}</small><strong>{money(Number(v))}</strong></div>)}</div><p>Closing cash uses the final selected month for the chosen entities; it is not allocated by product line.</p></section>}
     {reportParts.includes("costs")&&<section className={styles.reportSection}><h3>03 / Operating costs</h3><div className={styles.reportFacts}><span>Cost of sales</span><b>{money(totals.cost)}</b><span>Operating expenses (incl. addenda)</span><b>{money(totals.opex)}</b><span>Gross profit</span><b>{money(grossProfit)}</b><span>Manual expenses in scope</span><b>{money(added.reduce((a,x)=>a+x.amount,0))}</b></div></section>}
     {reportParts.includes("kpis")&&<section className={styles.reportSection}><h3>04 / Approved custom indicators</h3>{saved.length?saved.map(k=><div className={styles.reportFacts} key={k.id}><span>{k.name} — {formula(k)}</span><b>{evaluate(k,totals)===null?"N/A":number(evaluate(k,totals)!)+(k.operation==="ratio"&&k.asPercent?"%":"")}</b></div>):<p>No additional indicators have been approved in this browser.</p>}</section>}
     {reportParts.includes("controls")&&<section className={styles.reportSection}><h3>05 / Controls and exceptions</h3><p>A simulated discrepancy of {money(12500)} between the September bank snapshot and general ledger of Aurelia Gulf remains recorded. Status: {approved?"acknowledged by the finance reviewer":"awaiting human review"}.</p><p>The acknowledgement does not resolve or modify the underlying source balances.</p></section>}
     {reportParts.includes("decisions")&&<section className={styles.reportSection}><h3>06 / Decision record</h3><p>{approved?reviewedNote:"No approval decision recorded. This report remains a draft for review."}</p><p>Scope: {selection.label}, {entityLabels[entity]}, {labelProduct}. Adjustments are a local demonstration and require validation before any real publication.</p></section>}
     </div><footer className={styles.reportFoot}>SIMULATED FINANCIAL DATA · NOT A LIVE CLIENT REPORT <span>SC-ANALYTICS</span></footer></article>
   </div>}
  </main>
  {!embedded&&<footer className={styles.footer}><span>SC-Analytics · CFO demonstration · All business data is fictional · Adjustments and KPIs are saved in this browser only</span><button onClick={onAdvanced}>Explore detailed system capabilities <ArrowRight size={13}/></button></footer>}
 </div>;
}
