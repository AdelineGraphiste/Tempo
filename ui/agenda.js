function readAgenda(text,now=Date.now()){
 const root=new ICAL.Component(ICAL.parse(text));
 if(root.name!=="vcalendar")throw Error("Format iCalendar attendu.");
 ICAL.TimezoneService.reset();
 for(const zone of root.getAllSubcomponents("vtimezone"))ICAL.TimezoneService.register(new ICAL.Timezone(zone));
 const until=now+32*86400000,items=[],masters=[],exceptions=new Map(),fmt=new Map();
 function stamp(t,p){
  const id=p?.getParameter("tzid");
  if(!id||t.zone.tzid!=="floating")return t.toJSDate().getTime();
  if(!fmt.has(id))fmt.set(id,new Intl.DateTimeFormat("en-GB",{timeZone:id,year:"numeric",month:"numeric",day:"numeric",hour:"numeric",minute:"numeric",second:"numeric",hourCycle:"h23"}));
  const goal=Date.UTC(t.year,t.month-1,t.day,t.hour,t.minute,t.second);let x=goal;
  for(let i=0;i<3;i++){let o={};for(const f of fmt.get(id).formatToParts(x))o[f.type]=+f.value;let diff=goal-Date.UTC(o.year,o.month-1,o.day,o.hour,o.minute,o.second);if(!diff)break;x+=diff;}return x;
 }
 for(const comp of root.getAllSubcomponents("vevent")){
  if(!comp.hasProperty("dtstart")&&!comp.hasProperty("recurrence-id"))continue;
  const e=new ICAL.Event(comp,{exceptions:[]});
  if(e.isRecurrenceException()){if(!exceptions.has(e.uid))exceptions.set(e.uid,new Map());exceptions.get(e.uid).set(e.recurrenceId.toString(),e);}
  else masters.push(e);
 }
 function add(e,t,p){
  if(!t)return;
  if(t.isDate||String(e.component.getFirstPropertyValue("status")).toUpperCase()==="CANCELLED")return;
  const at=stamp(t,p);if(at>=now-60000&&at<=until)items.push({at,title:e.summary||"Rendez-vous",key:e.uid+"@"+at});
 }
 for(const e of masters){
  if(e.startDate.isDate||String(e.component.getFirstPropertyValue("status")).toUpperCase()==="CANCELLED")continue;
  const p=e.component.getFirstProperty("dtstart"),over=exceptions.get(e.uid);
  if(!e.isRecurring()){add(e,e.startDate,p);continue;}
  const it=e.iterator();let t;let steps=0;
  while((t=it.next())){if(++steps>60000)throw Error("Trop d’occurrences pour ce calendrier.");if(stamp(t,p)>until)break;if(!over?.has(t.toString()))add(e,t,p);}
 }
 for(const series of exceptions.values())for(const e of series.values())add(e,e.startDate,e.component.getFirstProperty("dtstart"));
 return [...new Map(items.map(e=>[e.key,e])).values()].sort((a,b)=>a.at-b.at);
}
