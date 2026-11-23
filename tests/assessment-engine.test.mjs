import test from "node:test";
import assert from "node:assert/strict";
import {samples,emptyCase,missing,readinessPct,defaultNodes,parseText,recommendations,preferenceDefault,economics,packages,prospect,ndaText} from "../app/demos/ai-assessment/engine.ts";

test("blank discovery cannot bypass the required-information gate",()=>{
 const d=emptyCase();
 assert.ok(missing(d).length>=10);
 assert.ok(readinessPct(d)<25);
});

test("all fictional test cases have a complete mapable intake",()=>{
 for(const d of samples){assert.equal(missing(d).length,0,d.company);assert.equal(readinessPct(d),100);}
});

test("mapping preserves explicit human approval and output",()=>{
 const d=samples[0],steps=defaultNodes(d);
 assert.equal(steps[0].kind,"trigger");
 assert.ok(steps.some(x=>x.kind==="approval"));
 assert.equal(steps.at(-1).kind,"output");
 assert.ok(steps.every(x=>x.owner.length>0));
});

test("transcript extraction does not invent information",()=>{
 const input="Company: Acme Ltd\nProcess: Order entry\nWeekly volume: 140\nObjective: Reduce entry errors";
 const x=parseText(input);
 assert.equal(x.patch.company,"Acme Ltd");
 assert.equal(x.patch.process,"Order entry");
 assert.equal(x.patch.weeklyVolume,140);
 assert.equal(x.patch.owner,undefined);
 assert.equal(x.patch.systems,undefined);
});

test("conversational transcript extracts only directly evidenced facts",()=>{
 const x=parseText(samples[0].transcript);
 assert.equal(x.patch.weeklyVolume,210);
 assert.equal(x.patch.minutes,18);
 assert.match(x.patch.systems,/Dynamics/i);
 assert.equal(x.patch.company,undefined);
 assert.ok(x.evidence.length>=2);
});

test("consultant acceptance changes explainable recommendation scores",()=>{
 const d=samples[0],base=recommendations(d,preferenceDefault);
 const focus=base.find(x=>x.id==="capture");
 const changed=recommendations(d,{...preferenceDefault,accepted:["capture"]}).find(x=>x.id==="capture");
 assert.ok(focus&&changed&&changed.score>=focus.score);
});

test("consultant can add an assessed custom automation to local methodology",()=>{
 const r=recommendations(samples[0],{...preferenceDefault,custom:[{id:"special",title:"Vendor exception audit",description:"Review supplier mismatch reasons"}]});
 assert.ok(r.some(x=>x.id==="special"));
});

test("ROI includes infrastructure, licences and additional staffing",()=>{
 const d=samples[0],a=economics(d),b=economics(d,d.coverage,d.setup,1000);
 assert.ok(a.hoursYear>0&&a.annualGross>0);
 assert.equal(Math.round(b.annualRun-a.annualRun),12000);
 assert.equal(Math.round(a.netYear-b.netYear),12000);
});

test("two client proposal paths and lead-scoring remain bounded",()=>{
 for(const d of samples){
  const p=packages(d);
  assert.equal(p.length,2);
  assert.ok(p[1].price>p[0].price);
  const s=prospect(d);
  assert.ok(s.score>=10&&s.score<=95);
 }
});

test("NDA generator never represents the sample as signature-ready",()=>{
 const x=ndaText("Consultancy","Fictional Client","Discovery","To be agreed");
 assert.match(x,/DRAFT ONLY|UNREVIEWED EXAMPLE|ILLUSTRATIVE DRAFT ONLY/);
 assert.match(x,/Consultancy/);
 assert.match(x,/Fictional Client/);
});
