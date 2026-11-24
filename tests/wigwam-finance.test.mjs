import test from "node:test";
import assert from "node:assert/strict";
import {seedInvoices,purchaseOrders,invoiceIssues,canRoute,canApprove,seedBank,bankCheck,cardSpends,cardIssues,investorPeriods,investorMetrics,calculateRoi,canStage,workflowStage} from "../app/demos/wigwam-finance/engine.ts";

test("Source-based AP case includes proposed wrong company and other high-risk exceptions",()=>{
 const wrong=seedInvoices.find(x=>x.id==="wi-2");
 assert.ok(wrong);
 assert.ok(invoiceIssues(wrong,seedInvoices).some(x=>x.includes("Entity")));
 assert.ok(invoiceIssues(seedInvoices.find(x=>x.id==="wi-4"),seedInvoices).some(x=>x.includes("purchase order")));
 assert.ok(invoiceIssues(seedInvoices.find(x=>x.id==="wi-8"),seedInvoices).some(x=>x.includes("duplicate")));
});
test("Changing entity clears wrong-company and PO-entity mismatch but not other issues",()=>{
 const original=seedInvoices.find(x=>x.id==="wi-2");
 const corrected={...original,assignedCompany:"property"};
 const issues=invoiceIssues(corrected,seedInvoices);
 assert.equal(issues.length,0);
 assert.equal(original.status,"needs_review");
 assert.ok(canRoute(corrected,seedInvoices));
});
test("Approvals never happen as director or before a controlled hand-off",()=>{
 const ready=seedInvoices.find(x=>x.id==="wi-1");
 assert.equal(canApprove(ready,seedInvoices,"director"),false);
 assert.equal(canApprove(ready,seedInvoices,"controller"),true);
 const invalid=seedInvoices.find(x=>x.id==="wi-2");
 assert.equal(canApprove(invalid,seedInvoices,"controller"),false);
 const override={...invalid,exceptionApproved:true,exceptionNote:"Investigated by Finance Controller",status:"pending_approval"};
 assert.equal(canApprove(override,seedInvoices,"controller"),false);
});
test("An exception note is required for any override",()=>{
 const x=seedInvoices.find(x=>x.id==="wi-2");
 assert.equal(canRoute({...x,exceptionApproved:true,exceptionNote:"short"},seedInvoices),false);
 assert.equal(canRoute({...x,exceptionApproved:true,exceptionNote:"Signed off after checking the source company"},seedInvoices),false);
 const missingPo=seedInvoices.find(y=>y.id==="wi-10");
 assert.equal(canRoute({...missingPo,exceptionApproved:true,exceptionNote:"PO not supplied: Controller authorised without PO"},seedInvoices),true);
});
test("Bank line checks distinguish exact, amount, reference and missing",()=>{
 assert.deepEqual(seedBank.map(bankCheck),["match","match","match","amount","reference","match","missing"]);
});
test("Card controls flag a missing receipt or PO",()=>{
 assert.ok(cardIssues(cardSpends[0]).length===2);
 assert.equal(cardIssues(cardSpends[1]).length,0);
});
test("Investor quarters distinguish the forecast and closing cash snapshot",()=>{
 assert.equal(investorPeriods.at(-1).id,"2026-Q4F");
 const q=investorMetrics("2026-Q3");
 assert.equal(q.operatingResult,q.revenue-q.costs);
 assert.ok(q.margin>0);
});
test("ROI scenario separates nominal freed capacity from actual cash",()=>{
 const a=calculateRoi(65,11,55,80,25,125,4500,0);
 const b=calculateRoi(65,11,55,80,25,125,4500,100);
 assert.ok(a.freed>0&&a.value>0);
 assert.equal(a.cashBenefit,0);
 assert.equal(a.netCash,-6000);
 assert.ok(Math.abs(b.cashBenefit-b.value)<0.000001);
 assert.ok(b.netCash>a.netCash);
});
test("Proposed PO register and invoices contain only fictional entity IDs",()=>{
 const valid=new Set(["operating","property","services"]);
 assert.ok(seedInvoices.every(x=>valid.has(x.sourceCompany)&&valid.has(x.assignedCompany)));
 assert.ok(purchaseOrders.every(x=>valid.has(x.entity)));
});

test("approved-only Xero staging requires a human decision and cannot be repeated",()=>{
 const candidate=seedInvoices.find(x=>x.id==="wi-1");
 assert.equal(canStage(candidate,seedInvoices,"controller"),false);
 const approved={...candidate,status:"approved"};
 assert.equal(canStage(approved,seedInvoices,"director"),false);
 assert.equal(canStage(approved,seedInvoices,"controller"),true);
 assert.equal(canStage({...approved,staged:true},seedInvoices,"controller"),false);
});
test("shared workflow reflects evidence correction, approval and staging",()=>{
 const bad=seedInvoices.find(x=>x.id==="wi-2");
 assert.equal(workflowStage(bad,seedInvoices),"exceptions");
 const corrected={...bad,assignedCompany:"property",status:"pending_approval"};
 assert.equal(workflowStage(corrected,seedInvoices),"approval");
 assert.equal(workflowStage({...corrected,status:"approved"},seedInvoices),"staging");
 assert.equal(workflowStage({...corrected,status:"approved",staged:true},seedInvoices),"ready");
});
test("a rejected duplicate invoice no longer blocks review",()=>{
 const original=seedInvoices.find(x=>x.id==="wi-8");
 const lines=seedInvoices.map(x=>x.id==="wi-4"?{...x,status:"rejected"}:x);
 assert.ok(!invoiceIssues(original,lines).some(x=>/duplicate/i.test(x)));
});

test("card policy checks PO existence, entity and value rather than checking a nonempty reference only",()=>{
 const original=cardSpends[0];
 assert.ok(cardIssues({...original,receipt:true,poId:"UNKNOWN"}).includes("PO record not found"));
 assert.ok(cardIssues({...original,receipt:true,poId:"PO-1022"}).some(s=>/different legal entity/.test(s)));
 assert.ok(cardIssues({...original,receipt:true,poId:"PO-1021",amount:9000}).some(s=>/exceeds/.test(s)));
});

test("An amount one penny above the authorised PO needs review",()=>{
 const po=purchaseOrders.find(x=>x.id==="PO-1022");
 const invoice={...seedInvoices[1],sourceCompany:po.entity,assignedCompany:po.entity,supplier:po.supplier,poId:po.id,amount:po.amount+.01};
 assert.ok(invoiceIssues(invoice,[invoice]).some(issue=>issue.includes("exceeds")));
 assert.ok(cardIssues({...cardSpends[0],entity:po.entity,poId:po.id,amount:po.amount+.01}).some(issue=>issue.includes("exceeds")));
});
