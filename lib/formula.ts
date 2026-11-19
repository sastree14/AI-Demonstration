/** A safe arithmetic expression interpreter. Deliberately does NOT use eval, new Function, SQL, or arbitrary JS. */
export function evaluateFormula(expression:string,scope:Record<string,number>):number {
  if(expression.length>140)throw Error("Formula is too long (maximum 140 characters).");
  const source=expression.replace(/\s/g,"");
  if(!source)throw Error("Enter a formula to preview it.");
  const tokens=source.match(/[A-Za-z_][A-Za-z_0-9]*|\d+(?:\.\d+)?|[()+*\/-]/g);
  if(!tokens||tokens.join("")!==source)throw Error("Only metric names, numbers, parentheses and + - * / are supported.");
  let pos=0;
  function atom():number {
    const t=tokens![pos++];
    if(t===undefined)throw Error("Incomplete expression.");
    if(t==="-")return -atom();
    if(t==="+")return atom();
    if(t==="("){const v=sum();if(tokens![pos++]!==")")throw Error("Missing closing parenthesis.");return v;}
    if(/^\d/.test(t))return Number(t);
    if(!Object.prototype.hasOwnProperty.call(scope,t))throw Error(`Unknown or unauthorized metric: ${t}`);
    return scope[t];
  }
  function product():number {let v=atom();while(tokens![pos]==="*"||tokens![pos]==="/"){const op=tokens![pos++];const rhs=atom();if(op==="/"&&rhs===0)throw Error("Division by zero.");v=op==="*"?v*rhs:v/rhs;}return v;}
  function sum():number {let v=product();while(tokens![pos]==="+"||tokens![pos]==="-"){const op=tokens![pos++];const rhs=product();v=op==="+"?v+rhs:v-rhs;}return v;}
  const out=sum();if(pos!==tokens.length)throw Error("Unexpected token in formula.");if(!Number.isFinite(out))throw Error("Non-finite result.");return out;
}
