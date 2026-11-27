import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=(file)=>readFileSync(file,"utf8");
const base="app/demos/wigwam-finance/";
const ui=read(base+"MeetingPresentation.tsx");
const route=read(base+"page.tsx");
const docs=read("docs/WIGWAM_FINANCE_DEMO.md");
test("Public entry uses only the six-stage meeting presentation in order",()=>{
 assert.match(route,/return <MeetingPresentation\/>/);
 assert.doesNotMatch(route,/WigwamFinanceDemo/);
 assert.match(ui,/const tabs=\["Accounts Payable","Bank Reconciliation","Financial Reporting","AI Agents","Feasibility & security","Platform example"\]/);
 assert.match(ui,/page===3\?<AgentsPage\/>:page===4\?<FeasibilityPage\/>:<PlatformPage\/>/);
 assert.doesNotMatch(ui,/\b(?:Nick|Luke|Luc|Sarah|Sara)\b/i);
 assert.doesNotMatch(ui,/pain points/i);
 assert.doesNotMatch(ui.slice(ui.indexOf("function ProcessPage"),ui.indexOf("function EmailProposal")),/<textarea/i);
});
test("Reported needs and proposed workflows remain distinguished",()=>{
 assert.match(ui,/initial understanding/i);
 assert.match(ui,/exact steps are to be confirmed/i);
 assert.match(ui,/Questions arising from the workflow/);
 assert.match(ui,/For discussion · not final scope/);
 assert.match(docs,/Do not present these design assumptions as facts/);
 assert.match(docs,/precise authority, duties and approval thresholds are not known/);
});
test("Seven specialist responsibilities and coordinated handoffs are present",()=>{
 for(const name of ["Entity Allocation Agent","Purchase Order Agent","AP Exception Assistant","Bank Reconciliation Agent","Card Spend Control Agent","Financial Reporting Agent","Financial Monitoring Agent"])assert.match(ui,new RegExp(name));
 assert.match(ui,/Finance Orchestrator/);
 assert.match(ui,/Shared financial evidence/);
 assert.match(ui,/Seven agent workflows/);
});
test("Interactive example preserves financial safety and truthful simulation boundaries",()=>{
 assert.match(ui,/Scripted, local simulation/);
 assert.match(ui,/Original invoice evidence stays unchanged/);
 assert.match(ui,/Approval and payment remain with authorised people/);
 assert.match(ui,/native reconciliation must be confirmed/);
 assert.match(ui,/No email was sent/);
 assert.match(ui,/No system can guarantee zero security risk/);
 assert.match(ui,/Draft for review/);
 assert.match(ui,/Simulated send recorded\. No actual email was sent/);
 assert.match(ui,/Reversible pseudonymisation is not full anonymisation/);
 assert.match(ui,/ChatGPT Business.*separate product/);
});
