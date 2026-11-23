import {reportingPeriods} from "@/lib/reportingPeriods";

export default function PeriodOptions(){
  return <>{Array.from(new Set(reportingPeriods.map(p=>p.group))).map(group=>
    <optgroup key={group} label={group}>
      {reportingPeriods.filter(p=>p.group===group).map(p=><option key={p.id} value={p.id}>{p.label}</option>)}
    </optgroup>
  )}</>;
}
