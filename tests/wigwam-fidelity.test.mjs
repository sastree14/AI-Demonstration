import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const ui=readFileSync("app/demos/wigwam-finance/WigwamFinanceDemo.tsx","utf8");
const guide=readFileSync("app/demos/wigwam-finance/GuidedJourney.tsx","utf8");
const map=readFileSync("app/demos/wigwam-finance/OperationsDesk.tsx","utf8");
const engine=readFileSync("app/demos/wigwam-finance/engine.ts","utf8");
const docs=readFileSync("docs/WIGWAM_FINANCE_DEMO.md","utf8");

test("Lead with Nick-confirmed facts, distinguish hypotheses and ask the finance team",()=>{
 for(const text of ["CONFIRMED BY NICK","ILLUSTRATIVE EXAMPLES","QUESTIONS FOR THE FINANCE TEAM","no live integrations","proposed architecture"]){
  assert.ok(ui.toLowerCase().includes(text.toLowerCase()),"Missing disclosure: "+text);
 }
 assert.match(guide,/Sample policy: this demo flags a missing PO/);
 assert.match(docs,/What Nick actually confirmed/);
 assert.match(docs,/Do not present these design assumptions as facts/);
});
test("No invented email provider or claim of re-keying across each software system",()=>{
 for(const unsupported of [/Outlook \/ shared email/i,/bookkeeper re-enters details/i,/Five disconnected hand-offs/i,/Retain the original in SharePoint for a reviewer/i]){
  assert.doesNotMatch(ui+"\n"+guide+"\n"+map+"\n"+engine,unsupported);
 }
});
test("AI specialists and external connections are disclosed as proposals, not actual implementations",()=>{
 assert.match(ui,/OPTIONAL CAPABILITIES/);
 assert.match(map,/OPTIONAL AI-ASSISTED CAPABILITY/);
 assert.match(map,/most connections are unverified/);
 assert.match(ui,/DEMO NOT CONNECTED/);
 assert.match(guide,/sample accounting hand-off CSV/);
 assert.match(ui,/no live integrations/i);
});
test("Report metrics and operational role assignments are labelled fictional or unverified",()=>{
 assert.match(ui,/Not actual Wigwam data or rules/);
 assert.doesNotMatch(map,/Sarah resolves the exception/);
 assert.doesNotMatch(map,/Sarah → SharePoint/);
 assert.match(ui,/Nick has not shared his actual investor reporting format/);
 assert.match(docs,/precise authority, duties and approval thresholds are not known/);
});
