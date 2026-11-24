import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const ui=readFileSync("app/demos/wigwam-finance/WigwamFinanceDemo.tsx","utf8");
const guide=readFileSync("app/demos/wigwam-finance/GuidedJourney.tsx","utf8");
const map=readFileSync("app/demos/wigwam-finance/OperationsDesk.tsx","utf8");
const engine=readFileSync("app/demos/wigwam-finance/engine.ts","utf8");
const docs=readFileSync("docs/WIGWAM_FINANCE_DEMO.md","utf8");
const publicCopy=ui+"\n"+guide+"\n"+map+"\n"+engine;

test("Public presentation focuses on benefits, workflow and human control, not meeting preparation",()=>{
 for(const claim of ["DOCUMENT INTAKE","CONTROLLED VALIDATION","HUMAN OVERSIGHT","FINANCE OPERATIONS","HUMAN CONTROLLED"]){
  assert.match(publicCopy,new RegExp(claim.replaceAll(" ","\\s+"),"i"),"Missing presentation concept: "+claim);
 }
 for(const internal of [/\bNick\b/i,/\bSarah\b/i,/QUESTIONS FOR THE FINANCE TEAM/i,/CURRENT OPEN QUESTIONS/i,/LIVE CLIENT STORY/i,/What we must ask in discovery/i,/The client has not shared/i,/Named by Nick/i]){
  assert.doesNotMatch(publicCopy,internal,"Internal reference leaked into public presentation");
 }
 const brandMentions=[...ui.matchAll(/Wigwam Storage/gi)].length;
 assert.equal(brandMentions,1,"Company name should appear only as presentation branding");
});

test("Source constraints remain documented internally without turning into visitor questions",()=>{
 assert.match(docs,/What Nick actually confirmed/);
 assert.match(docs,/Do not present these design assumptions as facts/);
 assert.doesNotMatch(publicCopy,/Outlook \/ shared email|bookkeeper re-enters details|Five disconnected hand-offs|Retain the original in SharePoint for a reviewer/i);
 assert.match(guide,/Illustrative PO policy/);
 assert.match(ui,/sample records and rules/i);
});

test("Optional AI and integration examples are never presented as live connections",()=>{
 assert.match(ui,/OPTIONAL CAPABILITIES/);
 assert.match(map,/SIMULATED EXAMPLE/);
 assert.match(map,/All illustrated connections are proposed, not live/);
 assert.match(ui,/DEMO NOT CONNECTED/);
 assert.match(guide,/sample accounting hand-off CSV/);
 assert.match(ui,/No live financial system access/i);
});

test("Financial examples preserve clear limits and no unsupported approval assignment",()=>{
 assert.match(ui,/Illustrative data only/);
 assert.match(guide,/Live permissions are configured separately/);
 assert.doesNotMatch(map,/Sarah resolves the exception|Sarah → SharePoint/);
 assert.match(ui,/human review/i);
 assert.match(docs,/precise authority, duties and approval thresholds are not known/);
});
