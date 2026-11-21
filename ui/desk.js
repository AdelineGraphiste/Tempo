const $=x=>document.getElementById(x),bridge=window.chrome.webview;
function post(op,v="",extra={}){bridge.postMessage({op,v:String(v),...extra});}
const names={console:"Console",todo:"À faire",music:"Musique",agenda:"Agenda",history:"Activité",settings:"Réglages",themes:"Thèmes",guide:"Aide"};
const colors=["#ff5944","#80ff83","#ffb841","#8ecbff","#ff60d1","#46e6cf","#ff7538","#bd91ff","#ffa2b1","#fff2ce"];
const colorNames=["Rouge néon","Vert phosphore","Ambre","Bleu glacier","Magenta","Turquoise","Orange braise","Violet","Rose","Blanc chaud"];
let S={},P={},page="console",offset=0,events=[],sent=new Set(),lastH=0,timer;
function showMsg(s,ms=6500){$("msg").textContent=s;$("msg").hidden=false;clearTimeout(timer);timer=setTimeout(()=>$("msg").hidden=true,ms);}
$("msg").onclick=()=>$("msg").hidden=true;
function button(text,fn){let b=document.createElement("button");b.textContent=text;b.onclick=fn;return b;}
function show(p){if(S.mini)post("expand");page=p;syncPlayerTab();for(const k in names){$(k).classList.toggle("active",k===p);$("tab"+k)?.classList.toggle("on",k===p);}if(p==="history")requestHistory();if(p==="themes")galleryScenes();}
for(const k of Object.keys(names).filter(x=>x!=="guide")){let b=button(names[k],()=>show(k));b.id="tab"+k;$("tabs").append(b);}show("console");
const segments=["3,1 18,1 20,3 17,5 5,5 1,3","19,5 21,3 21,16 19,18 17,16 17,8","19,19 21,21 21,33 19,35 17,32 17,22","4,33 17,33 19,36 17,37 3,37 1,35","2,19 4,21 4,31 1,34 0,32 0,22","2,4 4,7 4,16 2,18 0,16 0,6","4,17 17,17 19,19 17,21 4,21 2,19"];
const masks=[63,6,91,79,102,109,125,7,127,111];
function digits(el,str){str=String(str);if(el.dataset.d===str)return;el.dataset.d=str;el.innerHTML=[...str].map(c=>c===":"?"<span class=divider></span>":'<svg aria-hidden="true" viewBox="0 0 22 38">'+segments.map((s,i)=>'<polygon class="'+((masks[+c]&(1<<i))?'lit':'off')+'" points="'+s+'"/>').join("")+'</svg>').join("");el.setAttribute("aria-label",str);}
const lines=[["Heure locale","HEURES","MINUTES","SECONDES"],["Temps restant","HEURES","MINUTES","SECONDES"],["Aujourd’hui","H TRAVAIL","MIN TRAVAIL","PAUSES"]];
lines.forEach((l,i)=>{let el=document.createElement("div");el.className="beam";el.innerHTML='<div class="ident"><span class="plaque">'+l[0].toUpperCase()+'</span><strong id="big'+i+'"></strong><small id="sub'+i+'"></small></div>'+l.slice(1).map((u,j)=>'<div class="window"><span class="unit">'+u+'</span><div class="digits" id="d'+i+j+'"></div></div>').join("");$("beams").append(el);});
lines.forEach((l,r)=>{let label=document.createElement("label");label.className="field";label.append(l[0]);let sel=document.createElement("select");sel.id="c"+r;colorNames.forEach((c,i)=>sel.add(new Option(c,i)));sel.onchange=()=>post("colors",sel.value,{row:String(r)});label.append(sel);$("palettes").append(label);});
function state(s){let was=S.mini;S=s;document.body.classList.toggle("mini",s.mini);$("compact").textContent=s.mini?"Console":"Mini";$("pin").textContent=s.pin?"Épinglé":"Épingler";$("sub0").textContent=s.date;$("sub1").textContent=s.phase?"Pause "+s.phase.slice(3):s.status;$("sub2").textContent=s.rest+" min de pause";
 const marks=[new Date().toLocaleDateString("fr",{month:"short"}).replace(".","").toUpperCase(),s.phase?"PAU":s.status==="EN SESSION"?"RUN":s.status==="TERMINÉE"?"FIN":s.status==="ARRÊTÉE"?"STOP":"PRÊT","JOUR"];marks.forEach((mark,i)=>{$("big"+i).textContent=mark;$("big"+i).closest(".beam").style.setProperty("--facecolor",lamp(s,i));});const vals=[s.at.split(":"),s.remain.split(":"),[Math.floor(s.work/60),s.work%60,s.breaks]];
 vals.forEach((v,i)=>{v.forEach((n,j)=>{let d=$("d"+i+j);digits(d,String(n).padStart(2,"0"));d.style.color=lamp(s,i);});$("c"+i).value=s.colors[i];});if(skin&&skin.style!=="circuit"){$("miniTime").textContent=s.at;$("miniTime").dataset.d="";}else digits($("miniTime"),s.at);$("miniTime").style.color=lamp(s,0);
 document.body.style.setProperty("--green",lamp(s,1));document.body.style.setProperty("--amber",lamp(s,2));
 $("start").textContent=s.phase?"Reprendre":"Démarrer";$("start").disabled=s.status==="EN SESSION";$("pause").disabled=s.status!=="EN SESSION";$("extend").disabled=$("stop").disabled=!(s.phase||s.status==="EN SESSION");
 $("station").textContent=P.stations?.[s.idx]||"Radio";$("listen").textContent=s.radio?"Couper":"Écouter";$("off").disabled=!s.radio;
 [...$("stations").children].forEach((b,i)=>b.classList.toggle("on",i===s.idx&&s.radio));
 $("feedback").textContent=s.radio?(s.station||"Radio"):(s.mini?s.status:(P.len||60)+" min · "+(P.num??2)+" pause(s) de "+(P.rest||5)+" min");
 if(Date.now()-lastH>5000){requestHistory();lastH=Date.now();post("pollCal");}reminders();worldState();
}
function prefs(p){let old=P;P=p;for(let k of ["len","num","rest","playlist","lead","volume"]){if(!old.kind||p[k]!==old[k])$(k).value=p[k];}
 $("mute").textContent=p.mute?"Réactiver le son":"Silencieux";$("sound").textContent=p.sound+(p.mute?" · silencieux":"");$("calStatus").textContent=p.connected?"Agenda connecté · synchronisation toutes les 10 minutes.":"Connecte un calendrier par abonnement privé ou fichier .ics.";$("unlink").disabled=!p.connected;
 if(!$("stations").children.length)p.stations.forEach((v,i)=>$("stations").append(button(v,()=>post("tune",i))));}
function requestHistory(){post("history",0,{mode:"jour"});if(page==="history")post("history",offset,{mode:$("period").value});}
function duration(v){v=Math.floor(v);return Math.floor(v/60)+" h "+String(v%60).padStart(2,"0");}
function chart(el,bars){const max=Math.max(1,...bars.map(b=>b.w+b.p));el.replaceChildren(...bars.map(b=>{let bar=document.createElement("div");bar.className="bar";bar.style.height=(b.w+b.p)/max*100+"%";bar.title=b.label+" · "+duration(b.w)+" de travail · "+Math.round(b.p)+" min de pause";if(b.w+b.p===0)return bar;let w=document.createElement("i"),p=document.createElement("em");w.style.height=b.w/(b.w+b.p||1)*100+"%";p.style.flex=1;bar.append(w,p);return bar;}));}
function history(s){if(s.mode==="jour"&&!s.offset)chart($("dayChart"),s.bars);if(page!=="history"||s.mode!==$("period").value||s.offset!==offset)return;
 chart($("hChart"),s.bars);$("periodTitle").textContent=s.title;$("forward").disabled=!offset;$("stats").textContent=duration(s.bars.reduce((a,b)=>a+b.w,0))+" de travail · "+s.count+" pause(s) · "+duration(s.bars.reduce((a,b)=>a+b.p,0))+" en pause";$("hAxis").replaceChildren(...[s.bars[0],s.bars.at(-1)].map(b=>Object.assign(document.createElement("span"),{textContent:b.label})));}
function listEvents(){const now=Date.now();let items=events.filter(e=>e.at>=now-60000).slice(0,8);$("events").replaceChildren(...items.map(e=>Object.assign(document.createElement("p"),{textContent:new Date(e.at).toLocaleString("fr-FR",{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})+" · "+e.title})));if(!items.length)$("events").textContent="Aucun rendez-vous horaire à venir sur les 32 prochains jours.";}
function reminders(){let now=Date.now();for(const e of events){if(e.at>now+(P.lead??10)*60000)break;if(e.at<now-60000||sent.has(e.key))continue;sent.add(e.key);let note=new Date(e.at).toLocaleTimeString("fr",{hour:"2-digit",minute:"2-digit"})+" · "+e.title;showMsg(note,30000);post("remind",note);} }
bridge.addEventListener("message",({data:s})=>{if(s.kind==="state")state(s);if(s.kind==="prefs")prefs(s);if(s.kind==="history")history(s);if(s.kind==="notice")showMsg(s.text);if(s.kind==="clear"){events=[];sent.clear();$("url").value="";listEvents();}if(s.kind==="ical"){try{events=readAgenda(s.raw);post("calOK",s.version);$("url").value="";listEvents();}catch{showMsg("Lecture iCalendar impossible. Vérifie le format et les fuseaux du calendrier.");}}});
function click(id,fn){$(id).onclick=fn;}
["min","quit","pin","mute","ring","wav","resetSound"].forEach(k=>click(k,()=>post(k)));click("help",()=>show("guide"));click("compact",()=>post("mini"));click("station",()=>show("music"));
["start","pause","extend","stop"].forEach((id,n)=>click(id,()=>post("command",n)));click("listen",()=>post(S.radio?"stopRadio":"tune",S.idx));click("off",()=>post("stopRadio"));click("prev",()=>post("tune",(S.idx+5)%6));click("next",()=>post("tune",(S.idx+1)%6));$("volume").onchange=()=>post("vol",$("volume").value);click("openLink",()=>post("link",$("playlist").value.trim()));click("local",()=>post("musicFile"));
click("plan",()=>post("plan","",{len:$("len").value,num:$("num").value,rest:$("rest").value}));click("connect",()=>post("calendar",$("url").value.trim()));click("importer",()=>post("ics"));click("unlink",()=>post("disconnect"));$("lead").onchange=()=>post("lead",$("lead").value);
$("period").onchange=()=>{offset=0;requestHistory();};click("back",()=>{offset--;requestHistory();});click("forward",()=>{offset=Math.min(0,offset+1);requestHistory();});
$("handle").onmousedown=e=>{if(e.button===0&&!e.target.closest("button"))post("drag");};let resize=null;
$("grip").onpointerdown=e=>{if(e.button!==0)return;e.preventDefault();$("grip").setPointerCapture(e.pointerId);resize={x:e.screenX,y:e.screenY,w:innerWidth,h:innerHeight};};
$("grip").onpointermove=e=>{if(resize)post("size",Math.round((resize.w+e.screenX-resize.x)*devicePixelRatio),{height:String(Math.round((resize.h+e.screenY-resize.y)*devicePixelRatio))});};
$("grip").onlostpointercapture=()=>{resize=null;};document.onkeydown=e=>{if(e.target.matches("input,select,button"))return;if(e.key==="Escape")show("console");if(e.key==="F1"){e.preventDefault();show("guide");}if(e.code==="Space"){e.preventDefault();post("command",S.status==="EN SESSION"?1:0);}};
let builtinCount=10,themes=[],selected=0,taskId="",taskDay="",tasks=[],skin,draftArt="";
const fields={shell:"Façade",panel:"Panneaux",accent:"Touches",clock:"Horloge",timer:"Décompte",summary:"Bilan"};
function paintVars(el,t){el.dataset.skin=t.style;el.classList.toggle("art",!!t.image);el.style.setProperty("--illustration",t.image?'url("'+t.image+'")':"none");for(const [key,prop] of Object.entries({shell:"--case",panel:"--surface",accent:"--tint",clock:"--d1"}))el.style.setProperty(prop,t[key]);}
function lamp(s,i){return skin?[skin.clock,skin.timer,skin.summary][i]:colors[s.colors[i]];}
function skinsView(m){
 builtinCount=m.builtinCount;themes=m.items;selected=m.index;skin=themes[selected]||themes[0];paintVars(document.body,skin);
 $("skinsGrid").replaceChildren(...themes.map((t,i)=>{const b=button("",()=>post("skin",i));b.className="tile";b.setAttribute("aria-pressed",String(i===selected));const art=document.createElement("span");art.className="swatch";paintVars(art,t);const lcd=document.createElement("strong");lcd.textContent="08:25";art.append(lcd);const name=document.createElement("span");name.textContent=t.name;b.append(art,name);return b;}));
 $("skinName").value=skin.name;draftArt=skin.image||"";$("artFile").value="";artLabel();$("skinStyle").replaceChildren(...themes.slice(0,builtinCount).map(t=>new Option(t.name,t.style)));$("skinStyle").value=skin.style;
 $("colorEdit").replaceChildren(...Object.entries(fields).map(([k,v])=>{let l=document.createElement("label");l.textContent=v;let input=document.createElement("input");input.type="color";input.value=skin[k];input.id="edit"+k;l.append(input);return l;}));
 if(S.kind)state(S);if(page==="themes")galleryScenes();
}
function artLabel(){$("artLabel").textContent=draftArt?"Illustration incluse dans le thème.":"Motif graphique du thème.";$("removeArt").disabled=!draftArt;}
$("removeArt").onclick=()=>{draftArt="";$("artFile").value="";artLabel();};
$("artFile").onchange=async()=>{const f=$("artFile").files[0];if(!f)return;try{if(f.size>16000000)throw Error();
 const bitmap=await createImageBitmap(f);let c=document.createElement("canvas"),factor=Math.min(1,900/Math.max(bitmap.width,bitmap.height));c.width=Math.max(1,Math.round(bitmap.width*factor));c.height=Math.max(1,Math.round(bitmap.height*factor));let ctx=c.getContext("2d");ctx.fillStyle="#181b1b";ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(bitmap,0,0,c.width,c.height);bitmap.close();let url=c.toDataURL("image/jpeg",.74);if(url.length>440000)url=c.toDataURL("image/jpeg",.45);if(url.length>440000)throw Error();draftArt=url;artLabel();}catch{showMsg("Choisis une image PNG, JPEG ou WebP de moins de 16 Mo.");}};
$("createSkin").onclick=()=>{let t={version:1,image:draftArt,name:$("skinName").value.trim(),style:$("skinStyle").value};for(let k in fields)t[k]=$("edit"+k).value;if(!t.name){showMsg("Donne un nom à ton thème.");return;}post("customSkin",JSON.stringify(t));};
for(let id of ["importSkin","exportSkin"])$(id).onclick=()=>post(id);
function cancelTask(){timeTouched=false;taskId="";$("taskForm").reset();$("saveTask").textContent="Ajouter";$("cancelTask").hidden=true;}
$("cancelTask").onclick=cancelTask;
let timeTouched=false;
$("taskTime").oninput=()=>{timeTouched=true;};
$("taskName").oninput=()=>{if(timeTouched||taskId)return;
 const m=$("taskName").value.match(/(?:^|\b(?:à|vers)\s+|\sà\s+)([01]?\d|2[0-3])\s*(?:h(?:eures?)?|:)\s*([0-5]\d)?\b/i);
 $("taskTime").value=m?m[1].padStart(2,"0")+":"+(m[2]||"00"):"";};
$("taskForm").onsubmit=e=>{e.preventDefault();let title=$("taskName").value.trim();if(!title)return;
 let time=$("taskTime").value;
 post("taskSave",taskId,{title,time});cancelTask();};
function taskView(m){tasks=m.items;taskDay=m.day;$("taskDate").textContent=new Date(m.day+"T12:00:00").toLocaleDateString("fr",{day:"numeric",month:"long"});const pending=tasks.filter(t=>!t.Done);$("taskCount").textContent=pending.length+" à faire · "+(tasks.length-pending.length)+" terminée(s)";
 $("taskList").replaceChildren(...tasks.map(t=>{let line=document.createElement("div");line.className="taskline"+(t.Done?" done":"");let check=document.createElement("input");check.type="checkbox";check.checked=t.Done;check.id="tick-"+t.Id;check.onchange=()=>post("taskDone",t.Id);
 let l=document.createElement("label");l.htmlFor=check.id;l.textContent=t.Title;let small=document.createElement("small");small.textContent=(t.Day!==taskDay?t.Day.slice(8)+"/"+t.Day.slice(5,7)+" · ":"")+t.Time;
 let edit=button("Modifier",()=>{taskId=t.Id;$("taskName").value=t.Title;$("taskTime").value=t.Time;$("saveTask").textContent="Enregistrer pour aujourd’hui";$("cancelTask").hidden=false;$("taskName").focus();});
 let del=button("Retirer",()=>post("taskDelete",t.Id));line.append(check,l,small,edit,del);return line;}));
 if(!tasks.length)$("taskList").textContent="Ta liste est vide pour aujourd’hui.";
 let next=pending.find(t=>t.Day===taskDay&&t.Time&&!t.Notified)||pending[0];$("peekText").textContent=next?(next.Time?next.Time+" · ":"")+next.Title:"Ajouter une tâche";$("peekCount").textContent=pending.length+" à faire";
}
$("taskPeek").onclick=()=>show("todo");
bridge.addEventListener("message",({data:m})=>{if(m.kind==="skins")skinsView(m);if(m.kind==="tasks")taskView(m);if(m.kind==="taskAlert")showMsg(m.text,30000);});

function syncPlayerTab(){
 const frame=$("ytScreen").firstElementChild;
 if(frame&&page!=="music")frame.contentWindow.postMessage(JSON.stringify({event:"command",func:"pauseVideo",args:[]}),"https://www.youtube.com");
 $("ytDock").hidden=page!=="music"||!frame;
}
function closeYT(){$("ytScreen").replaceChildren();$("ytDock").hidden=true;}
$("ytClose").onclick=closeYT;
bridge.addEventListener("message",({data:m})=>{if(m.kind==="closeYT")closeYT();if(m.kind!=="youtube")return;
 if(page!=="music")return;const f=document.createElement("iframe");f.title="Lecteur YouTube";f.allow="autoplay; encrypted-media; fullscreen; picture-in-picture";f.allowFullscreen=true;f.referrerPolicy="strict-origin-when-cross-origin";f.src=m.url;$("ytScreen").replaceChildren(f);syncPlayerTab();
});
$("uninstall").onclick=()=>post("uninstall");
listEvents();post("ready");
