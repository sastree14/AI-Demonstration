import {type Case} from "./engine.ts";
export type NdaClause={id:string;heading:string;text:string;selected:boolean;recommended:boolean;why:string};
const defs=[
 ["definition","Confidential information","Confidential Information means non-public technical, commercial, operational and financial information disclosed for the agreed Purpose, whether oral, electronic or written, and identified or reasonably understood as confidential."],
 ["purpose","Permitted use and access","The Receiving Party will use Confidential Information solely to assess the agreed Purpose and disclose it only to authorised employees and advisers bound by appropriate confidentiality duties."],
 ["exclusions","Exclusions","Information is excluded if public without breach, lawfully known beforehand, independently developed without reliance on the Confidential Information, or lawfully received from a third party."],
 ["security","Protection and safeguards","Each Party must apply reasonable technical and organisational safeguards and limit access according to business need, taking account of the sensitivity and format of the information."],
 ["term","Duration and survival","The Parties must agree the contract term and post-termination confidentiality survival period in writing, with suitable treatment of any trade secrets."],
 ["return","Return and secure deletion","At the Disclosing Party's request, Confidential Information will be returned or securely deleted, subject to applicable legal retention, and any legally retained copy remains protected."],
 ["required","Compelled disclosure","If required by law to disclose, the Receiving Party will notify the Disclosing Party where legally allowed and limit disclosure to the required information."],
 ["ip","No IP licence or assignment","Disclosure does not transfer intellectual property and grants no licence other than the limited right to evaluate the defined Purpose. Ownership of project deliverables must be agreed separately."],
 ["ai","AI models and external processors","Confidential Information will not be submitted to third-party or public AI services unless the Parties approve the relevant processors, purposes, confidentiality terms, retention and controls in writing."],
 ["personal","Personal data and recordings","Where personal data, employee records, call recordings or customer records are involved, the Parties must establish roles, notices, lawful basis, security and any required data-processing agreement before processing."],
 ["subprocessors","Subprocessors and data transfers","Third-party access, relevant cloud locations and international transfers require approved contractual terms, limited access, recordkeeping and deletion procedures."],
 ["nonsolicit","Optional non-solicitation","Where lawfully agreed, neither Party will specifically solicit named project personnel for a negotiated duration. This clause must be reviewed for enforceability and proportionality."],
 ["liability","Liability and remedies — unresolved","The Parties must negotiate liability allocation, caps, remedies, exceptions and dispute resolution before signature. No liability allocation is agreed in this demonstration wording."]
] as const;
export function clausesFor(client:Case):NdaClause[]{
 const t=(client.sector+" "+client.process+" "+client.inputs+" "+client.systems+" "+client.transcript).toLowerCase();
 const personal=/customer|guest|employee|patient|email|call|recording|personal|staff/.test(t);
 const infra=/google|microsoft|sharepoint|cloud|sql|sap|drive|salesforce|dynamics|api/.test(t);
 const recommended=new Set(["definition","purpose","exclusions","security","term","return","required","ip","ai"]);
 if(personal)recommended.add("personal");if(infra)recommended.add("subprocessors");
 return defs.map(([id,heading,text])=>({id,heading,text,selected:recommended.has(id),recommended:recommended.has(id),why:recommended.has(id)?"Suggested from the case's process, information and integration risks; review with counsel":"Optional or unresolved clause; add only after commercial/legal approval"}));
}
export function ndaDocument(brand:string,client:Case,law:string,clauses:NdaClause[]){
 return {
  title:"MUTUAL NON-DISCLOSURE AGREEMENT",
  subtitle:"ILLUSTRATIVE DRAFT — SUBJECT TO LEGAL REVIEW",
  meta:[
   "Disclosing / receiving party A: "+(brand||"[Consultancy legal entity]"),
   "Disclosing / receiving party B: "+(client.company||"[Client legal entity]"),
   "Permitted purpose: "+(client.process||"[Purpose]"),
   "Effective date: [TO BE AGREED]",
   "Governing law: "+(law||"[To be agreed]")
  ],
  sections:clauses.filter(x=>x.selected).map((x,i)=>({heading:String(i+1)+". "+x.heading,text:x.text})),
  footer:"NOT FOR EXECUTION WITHOUT JURISDICTION-SPECIFIC LEGAL REVIEW, COMPLETED TERMS AND BOTH PARTIES' APPROVAL."
 };
}
const escTex=(s:string)=>s.replace(/\\/g,"\\textbackslash{}").replace(/[&%$#_{}]/g,m=>"\\"+m).replace(/~/g,"\\textasciitilde{}").replace(/\^/g,"\\textasciicircum{}");
export function toLatex(title:string,subtitle:string,meta:string[],sections:{heading:string;text:string}[],footer:string){
 return [
 "\\documentclass[11pt,a4paper]{article}",
 "\\usepackage[T1]{fontenc}",
 "\\usepackage[utf8]{inputenc}",
 "\\usepackage[a4paper,margin=24mm]{geometry}",
 "\\usepackage{lmodern}",
 "\\usepackage{xcolor}",
 "\\usepackage{parskip}",
 "\\usepackage{fancyhdr}",
 "\\definecolor{navy}{HTML}{17384A}",
 "\\pagestyle{fancy}\\fancyhf{}",
 "\\lhead{\\small CONFIDENTIAL — DRAFT}",
 "\\rhead{\\small ADVISORY DOCUMENT}",
 "\\cfoot{\\thepage}",
 "\\begin{document}",
 "\\begin{center}{\\LARGE\\bfseries\\color{navy} "+escTex(title)+"}\\\\[4mm]",
 "{\\small "+escTex(subtitle)+"}\\end{center}",
 "\\vspace{4mm}",
 ...meta.map(x=>"\\noindent "+escTex(x)+"\\\\"),
 "\\vspace{7mm}",
 ...sections.map(x=>"\\section*{"+escTex(x.heading)+"}\n"+escTex(x.text)+"\n"),
 "\\vfill",
 "{\\footnotesize\\color{red} "+escTex(footer)+"}",
 "\\end{document}"
 ].join("\n");
}
export function ndaLatex(brand:string,client:Case,law:string,clauses:NdaClause[]){
 const x=ndaDocument(brand,client,law,clauses);
 return toLatex(x.title,x.subtitle,x.meta,x.sections,x.footer);
}
