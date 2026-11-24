// All transactions, financial periods, company entities and ROI assumptions below
// are synthetic demonstration data. Real Wigwam Storage data is NOT included.
// Demo policies are configurable hypotheses: actual PO exemptions, company structure,
// role permissions, approval thresholds and source-system mappings are unverified.
export type EntityId="operating"|"property"|"services";
export const entities:{id:EntityId;name:string;short:string}[]=[
 {id:"operating",name:"Operating entity A",short:"Operating A"},
 {id:"property",name:"Property entity B",short:"Property B"},
 {id:"services",name:"Services entity C",short:"Services C"}
];
export type InvoiceStatus="received"|"needs_review"|"pending_approval"|"approved"|"rejected";
export type Invoice={
 id:string;number:string;supplier:string;date:string;due:string;amount:number;vat:number;
 sourceCompany:EntityId;assignedCompany:EntityId;poId:string;document:string;status:InvoiceStatus;
 exceptionApproved:boolean;exceptionNote:string;booked:boolean;staged?:boolean
};
export type PurchaseOrder={id:string;supplier:string;entity:EntityId;amount:number;category:string;owner:string;status:"issued"|"received"|"closed"};
export type BankLine={id:string;date:string;system:"Stripe"|"GoCardless"|"Bank transfer"|"Space Manager";reference:string;amount:number;ledgerReference:string;ledgerAmount:number;entity:EntityId;reviewed:boolean;note:string};
export type CardSpend={id:string;holder:string;merchant:string;amount:number;date:string;entity:EntityId;poId:string;receipt:boolean;category:string};
export type Audit={id:string;when:string;actor:string;action:string;detail:string};
export const purchaseOrders:PurchaseOrder[]=[
 {id:"PO-1021",supplier:"Arbor Facilities",entity:"operating",amount:2300,category:"Facilities",owner:"Operations",status:"received"},
 {id:"PO-1022",supplier:"Northpoint Security",entity:"property",amount:3850,category:"Security",owner:"Operations",status:"received"},
 {id:"PO-1023",supplier:"BrightCloud IT",entity:"services",amount:950,category:"Software",owner:"Finance",status:"issued"},
 {id:"PO-1024",supplier:"Westfield Repairs",entity:"operating",amount:1640,category:"Maintenance",owner:"Operations",status:"received"},
 {id:"PO-1025",supplier:"Arbor Facilities",entity:"property",amount:1460,category:"Facilities",owner:"Operations",status:"received"},
 {id:"PO-1026",supplier:"Merton Services",entity:"services",amount:1990,category:"Contractors",owner:"Management",status:"issued"},
 {id:"PO-1027",supplier:"Metro Utilities",entity:"operating",amount:880,category:"Utilities",owner:"Finance",status:"received"}
];
export const seedInvoices:Invoice[]=[
 {id:"wi-1",number:"AF-1098",supplier:"Arbor Facilities",date:"2026-11-13",due:"2026-12-02",amount:2240,vat:448,sourceCompany:"operating",assignedCompany:"operating",poId:"PO-1021",document:"supplier-invoice-AF-1098.pdf",status:"pending_approval",exceptionApproved:false,exceptionNote:"",booked:false},
 {id:"wi-2",number:"NS-7421",supplier:"Northpoint Security",date:"2026-11-14",due:"2026-12-05",amount:3780,vat:756,sourceCompany:"property",assignedCompany:"operating",poId:"PO-1022",document:"security-service-7421.pdf",status:"needs_review",exceptionApproved:false,exceptionNote:"",booked:false},
 {id:"wi-3",number:"BC-516",supplier:"BrightCloud IT",date:"2026-11-12",due:"2026-12-08",amount:890,vat:178,sourceCompany:"services",assignedCompany:"services",poId:"PO-1023",document:"IT-BC-516.pdf",status:"pending_approval",exceptionApproved:false,exceptionNote:"",booked:false},
 {id:"wi-4",number:"WR-2319",supplier:"Westfield Repairs",date:"2026-11-15",due:"2026-12-12",amount:1595,vat:319,sourceCompany:"operating",assignedCompany:"operating",poId:"",document:"repair-2319.pdf",status:"needs_review",exceptionApproved:false,exceptionNote:"",booked:false},
 {id:"wi-5",number:"AF-1103",supplier:"Arbor Facilities",date:"2026-11-17",due:"2026-12-06",amount:1375,vat:275,sourceCompany:"property",assignedCompany:"property",poId:"PO-1025",document:"facilities-AF-1103.pdf",status:"received",exceptionApproved:false,exceptionNote:"",booked:false},
 {id:"wi-6",number:"MS-887",supplier:"Merton Services",date:"2026-11-15",due:"2026-12-14",amount:2140,vat:428,sourceCompany:"services",assignedCompany:"services",poId:"PO-1026",document:"Merton-MS-887.pdf",status:"needs_review",exceptionApproved:false,exceptionNote:"",booked:false},
 {id:"wi-7",number:"MU-9022",supplier:"Metro Utilities",date:"2026-11-09",due:"2026-11-29",amount:860,vat:172,sourceCompany:"operating",assignedCompany:"operating",poId:"PO-1027",document:"utility-MU-9022.pdf",status:"approved",exceptionApproved:false,exceptionNote:"",booked:false},
 {id:"wi-8",number:"WR-2319",supplier:"Westfield Repairs",date:"2026-11-17",due:"2026-12-12",amount:1595,vat:319,sourceCompany:"operating",assignedCompany:"operating",poId:"PO-1024",document:"repair-copy-2319.pdf",status:"needs_review",exceptionApproved:false,exceptionNote:"",booked:false},
 {id:"wi-9",number:"AF-1092",supplier:"Arbor Facilities",date:"2026-11-01",due:"2026-11-25",amount:1800,vat:360,sourceCompany:"operating",assignedCompany:"operating",poId:"PO-1021",document:"facilities-AF-1092.pdf",status:"approved",exceptionApproved:false,exceptionNote:"",booked:false},
 {id:"wi-10",number:"MS-900",supplier:"Merton Services",date:"2026-11-20",due:"2026-12-16",amount:1150,vat:230,sourceCompany:"services",assignedCompany:"services",poId:"",document:"merton-MS-900.pdf",status:"received",exceptionApproved:false,exceptionNote:"",booked:false}
];
export const seedBank:BankLine[]=[
 {id:"bn-1",date:"2026-11-16",system:"Stripe",reference:"STR-1028",amount:4120,ledgerReference:"STR-1028",ledgerAmount:4120,entity:"operating",reviewed:false,note:""},
 {id:"bn-2",date:"2026-11-17",system:"GoCardless",reference:"GC-3008",amount:2575,ledgerReference:"GC-3008",ledgerAmount:2575,entity:"property",reviewed:false,note:""},
 {id:"bn-3",date:"2026-11-18",system:"Bank transfer",reference:"BNK-882",amount:-2240,ledgerReference:"BNK-882",ledgerAmount:-2240,entity:"operating",reviewed:true,note:"Prior illustrative manual review"},
 {id:"bn-4",date:"2026-11-18",system:"Stripe",reference:"STR-1029",amount:3180,ledgerReference:"STR-1029",ledgerAmount:3120,entity:"operating",reviewed:false,note:""},
 {id:"bn-5",date:"2026-11-19",system:"GoCardless",reference:"GC-3009",amount:1940,ledgerReference:"GC-3099",ledgerAmount:1940,entity:"services",reviewed:false,note:""},
 {id:"bn-6",date:"2026-11-20",system:"Space Manager",reference:"SM-401",amount:590,ledgerReference:"SM-401",ledgerAmount:590,entity:"property",reviewed:false,note:""},
 {id:"bn-7",date:"2026-11-20",system:"Stripe",reference:"STR-1030",amount:2120,ledgerReference:"STR-1030",ledgerAmount:0,entity:"operating",reviewed:false,note:""}
];
export const cardSpends:CardSpend[]=[
 {id:"card-1",holder:"Site operations",merchant:"Supplier marketplace",amount:182,date:"2026-11-19",entity:"operating",poId:"",receipt:false,category:"Consumables"},
 {id:"card-2",holder:"Finance team",merchant:"Software subscription",amount:75,date:"2026-11-18",entity:"services",poId:"PO-1023",receipt:true,category:"IT"},
 {id:"card-3",holder:"Regional manager",merchant:"Fuel services",amount:126,date:"2026-11-17",entity:"property",poId:"",receipt:true,category:"Travel"},
 {id:"card-4",holder:"Site operations",merchant:"Building supplies",amount:625,date:"2026-11-15",entity:"operating",poId:"",receipt:false,category:"Maintenance"},
 {id:"card-5",holder:"Finance team",merchant:"Software subscription",amount:60,date:"2026-11-13",entity:"services",poId:"PO-1023",receipt:true,category:"IT"}
];
export const investorPeriods=[
 {id:"2025-Q1",name:"Q1 2025",revenue:235000,costs:182000,collections:227000,cash:185000,occupancy:77},
 {id:"2025-Q2",name:"Q2 2025",revenue:247000,costs:187000,collections:239000,cash:191000,occupancy:79},
 {id:"2025-Q3",name:"Q3 2025",revenue:253000,costs:192000,collections:251000,cash:200000,occupancy:81},
 {id:"2025-Q4",name:"Q4 2025",revenue:272000,costs:201000,collections:269000,cash:213000,occupancy:82},
 {id:"2026-Q1",name:"Q1 2026",revenue:269000,costs:197000,collections:261000,cash:221000,occupancy:82},
 {id:"2026-Q2",name:"Q2 2026",revenue:286000,costs:205000,collections:280000,cash:234000,occupancy:84},
 {id:"2026-Q3",name:"Q3 2026",revenue:303000,costs:217000,collections:297000,cash:245000,occupancy:86},
 {id:"2026-Q4F",name:"Q4 2026 · forecast",revenue:320000,costs:230000,collections:312000,cash:256000,occupancy:87}
];
export const scenarios=[
 {id:"ap",title:"Supplier invoice handling",problem:"Shared inbox → Hubdoc → Xero → ApprovalMax with opportunities to reduce manual hand-offs",value:"Potentially fewer hand-offs, earlier validation and retained human approvals",type:"Illustrative first workflow"},
 {id:"bank",title:"Multi-system reconciliation",problem:"Collection, bank and ledger entries may require cross-system reconciliation",value:"Could propose matches and expose differences for finance review",type:"Possible expansion"},
 {id:"report",title:"Quarterly investor reporting",problem:"Quarterly financial and operating reports can require repeatable source checks",value:"Could prepare draft reporting views with traceable inputs and human review",type:"Possible expansion"},
 {id:"spend",title:"Purchase orders & card spending",problem:"POs are in Monday.com and card controls are an area of interest; receipt policies are unknown",value:"Could test agreed PO and receipt rules and explain exceptions",type:"Possible expansion"}
];
export function money(n:number){return new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP",maximumFractionDigits:0}).format(n)}
export function moneyPrecise(n:number){return new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP",minimumFractionDigits:2,maximumFractionDigits:2}).format(n)}
export function entityName(id:EntityId){return entities.find(x=>x.id===id)?.name||id}
export function invoiceIssues(inv:Invoice,items:Invoice[]=seedInvoices,orders:PurchaseOrder[]=purchaseOrders){
 const issues:string[]=[];
 if(inv.assignedCompany!==inv.sourceCompany)issues.push("Entity differs from invoice evidence");
 if(!inv.poId)issues.push("Missing purchase order");
 else{
  const po=orders.find(p=>p.id===inv.poId);
  if(!po)issues.push("PO not found");
  else{
   if(po.entity!==inv.assignedCompany)issues.push("PO belongs to a different entity");
   if(po.supplier!==inv.supplier)issues.push("Supplier and PO do not match");
   if(inv.amount>po.amount)issues.push("Invoice exceeds authorised PO value");
  }
 }
 const duplicates=items.filter(x=>x.id!==inv.id&&x.status!=="rejected"&&x.number.trim().toLowerCase()===inv.number.trim().toLowerCase()&&x.supplier.trim().toLowerCase()===inv.supplier.trim().toLowerCase());
 if(duplicates.length)issues.push("Potential duplicate supplier invoice number");
 return issues;
}
export function canRoute(inv:Invoice,all:Invoice[]){
 const issues=invoiceIssues(inv,all);
 if(!issues.length)return true;
 // Entity misclassification, duplicate invoices, and PO supplier/entity mismatches
 // are hard stops, regardless of any waiver notes.
 const hardStop=issues.some(x=>/entity|duplicate|supplier and PO/i.test(x));
 if(hardStop)return false;
 return inv.exceptionApproved&&inv.exceptionNote.trim().length>=12;
}
export function canStage(inv:Invoice,all:Invoice[],role:"director"|"controller"){
 return role==="controller"&&inv.status==="approved"&&!inv.staged&&canRoute(inv,all);
}
export function workflowStage(inv:Invoice,all:Invoice[]):"intake"|"exceptions"|"approval"|"staging"|"ready"{
 if(inv.staged)return "ready";
 if(inv.status==="approved")return "staging";
 if(inv.status==="pending_approval")return "approval";
 if(inv.status==="needs_review"||invoiceIssues(inv,all).length)return "exceptions";
 return "intake";
}
export function canApprove(inv:Invoice,all:Invoice[],role:"director"|"controller"){
 return role==="controller"&&inv.status==="pending_approval"&&!inv.staged&&canRoute(inv,all);
}
export function bankCheck(item:BankLine):"match"|"amount"|"reference"|"missing"{
 if(item.ledgerAmount===0)return "missing";
 if(item.reference!==item.ledgerReference)return "reference";
 if(Math.abs(item.amount-item.ledgerAmount)>.01)return "amount";
 return "match";
}
export function cardIssues(c:CardSpend,orders:PurchaseOrder[]=purchaseOrders){
 const issues:string[]=[];
 if(!c.receipt)issues.push("Missing receipt");
 if(!c.poId)issues.push("No PO reference");
 else{
  const po=orders.find(x=>x.id===c.poId);
  if(!po)issues.push("PO record not found");
  else{
   if(po.entity!==c.entity)issues.push("PO belongs to a different legal entity");
   if(c.amount>po.amount)issues.push("Card value exceeds the PO amount");
  }
 }
 return issues;
}
export function investorMetrics(periodId:string){const item=investorPeriods.find(x=>x.id===periodId)||investorPeriods[6];return {...item,margin:(item.revenue-item.costs)/item.revenue*100,operatingResult:item.revenue-item.costs}}
export function calculateRoi(invoicesPerWeek:number,minutesPerInvoice:number,automatablePct:number,realisablePct:number,hourlyRate:number,runCostMonthly:number,setupCost:number,cashCapturePct:number){
 const baseline=invoicesPerWeek*minutesPerInvoice/60*52;
 const freed=baseline*automatablePct/100*realisablePct/100;
 const value=freed*hourlyRate;
 const annualRun=runCostMonthly*12;
 const cashBenefit=value*cashCapturePct/100;
 const netNominal=value-annualRun-setupCost;
 const netCash=cashBenefit-annualRun-setupCost;
 const paybackNominal=value>annualRun?setupCost/((value-annualRun)/12):null;
 return {baseline,freed,value,annualRun,cashBenefit,netNominal,netCash,paybackNominal};
}
export function csv(rows:(string|number)[][]){
 return rows.map(row=>row.map(cell=>{
  const raw=String(cell);
  // Spreadsheet applications may evaluate cells starting with formula operators.
  // Prefix untrusted text with apostrophe; numeric values remain numeric.
  const guarded=typeof cell==="string"&&/^[\s\u0000-\u001f]*[=+\-@]/.test(raw)?"'"+raw:raw;
  return '"'+guarded.replaceAll('"','""')+'"';
 }).join(",")).join("\r\n");
}
export function safeDownload(name:string,content:string,mime="text/csv;charset=utf-8"){
 const blob=new Blob([content],{type:mime});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
