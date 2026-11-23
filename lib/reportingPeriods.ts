const names = ["January","February","March","April","May","June","July","August","September","October","November","December"];
function calendar(year:number, count:number) {
  return names.slice(0,count).map(name=>name.slice(0,3)+" "+year);
}
const priorYear = calendar(2025,12);
const currentYear = calendar(2026,10);
export const months = [...priorYear,...currentYear];
type ReportingPeriod = {id:string; label:string; group:string; months:string[]};
function yearOptions(year:number, available:string[]):ReportingPeriod[] {
  const group = String(year);
  const fullYear = available.length===12;
  const options = [{
    id:fullYear?"fy2025":"ytd2026", group,
    label:fullYear?"Full year 2025":"2026 year to date · January–October",
    months:available
  }];
  for(let q=1;q<=Math.floor(available.length/3);q++) {
    options.push({id:year===2026&&q===3?"q3":year+"-q"+q, group,
      label:"Q"+q+" "+year+" · "+names[(q-1)*3]+"–"+names[q*3-1],
      months:available.slice((q-1)*3,q*3)});
  }
  if(year===2026) options.push({id:"sixmonths",group,label:"May–October 2026",months:available.slice(4)});
  return options.concat(available.map((month,i)=>({
    id:month==="Oct 2026"?"oct":year+"-"+String(i+1).padStart(2,"0"),
    group:"Monthly · "+year,label:names[i]+" "+year,months:[month]
  })));
}
export const reportingPeriods = [...yearOptions(2026,currentYear),...yearOptions(2025,priorYear)];
export function reportingPeriod(id:string) {
  const period = reportingPeriods.find(option=>option.id===id);
  if(!period) throw new Error("Unknown reporting period: "+id);
  return period;
}
