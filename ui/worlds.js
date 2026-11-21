const worlds={
galaxy:{"name": "Star Wars", "layout": "bridge", "primary": "clock", "font": "Consolas,monospace"},
springfield:{"name": "Les Simpson", "layout": "toon", "primary": "clock", "font": "Trebuchet MS,sans-serif"},
overgrown:{"name": "The Last of Us", "layout": "field", "primary": "session", "font": "Consolas,monospace"},
highway:{"name": "The Walking Dead", "layout": "roadbook", "primary": "session", "font": "Georgia,serif"},
lab:{"name": "Breaking Bad", "layout": "periodic", "primary": "clock", "font": "Georgia,serif"},
vice:{"name": "GTA VI", "layout": "boulevard", "primary": "clock", "font": "Impact,sans-serif"},

 matrix:{name:"Matrix",layout:"terminal",primary:"session",second:"clock",font:"Consolas,monospace"},
 rift:{name:"Stranger Things",layout:"cinema",primary:"clock",second:"session",font:"Georgia,serif"},
 manga:{name:"Encre manga",layout:"panels",primary:"clock",second:"session",font:"Impact,'Arial Narrow',sans-serif"},
 sunset:{name:"Soleil néon",layout:"horizon",primary:"clock",second:"session",font:"'Trebuchet MS',sans-serif"},
 orbit:{name:"Orbiteur lunaire",layout:"cockpit",primary:"session",second:"clock",font:"'Segoe UI Light',sans-serif"},
 pixel:{name:"Borne d’arcade",layout:"cabinet",primary:"session",second:"clock",font:"Consolas,monospace"},
 mecha:{name:"Atelier mecha",layout:"telemetry",primary:"session",second:"clock",font:"Impact,sans-serif"},
 sakura:{name:"Sakura nocturne",layout:"paper",primary:"clock",second:"session",font:"Georgia,serif"},
 sonar:{name:"Radar abyssal",layout:"scope",primary:"session",second:"clock",font:"Consolas,monospace"}
};
const hero=document.createElement("section");hero.id="worldHero";
hero.innerHTML='<canvas aria-hidden="true"></canvas><div class="readout"><span class="worldTitle"></span><small class="worldLabel"></small><strong class="worldTime"></strong><span class="worldDetail"></span></div>';
const instruments=document.createElement("section");instruments.id="instruments";instruments.innerHTML='<div><small></small><b></b></div><div><small>TRAVAIL AUJOURD’HUI</small><b></b></div><div><small>PAUSES</small><b></b></div>';
$("console").prepend(hero,instruments);
const worldCanvas=hero.firstChild,miniCanvas=document.createElement("canvas");miniCanvas.id="miniArt";miniCanvas.setAttribute("aria-hidden","true");$("shell").prepend(miniCanvas);
let activeWorld="",lastFrame=-1;
function worldState(){
 if(!S.kind||!skin)return;
 const code=worlds[skin.style]?skin.style:"",w=worlds[code];
 if(activeWorld!==code){worldCanvas.getContext("2d").clearRect(0,0,worldCanvas.width,worldCanvas.height);miniCanvas.getContext("2d").clearRect(0,0,miniCanvas.width,miniCanvas.height);activeWorld=code;lastFrame=-1;document.body.dataset.layout=w?w.layout:"";document.body.style.setProperty("--worldFont",w?w.font:"inherit");}
 if(!w)return;
 const clock=w.primary==="clock",stateLabel=S.phase?"Pause · "+S.phase.slice(3):S.status;
 hero.querySelector(".worldTitle").textContent=selected<builtinCount?w.name:skin.name;
 hero.querySelector(".worldLabel").textContent=clock?"HEURE LOCALE":"TEMPS RESTANT";
 hero.querySelector(".worldTime").textContent=clock?S.at:S.remain;
 hero.querySelector(".worldDetail").textContent=clock?S.date:stateLabel;
 const spans=instruments.children;
 spans[0].firstChild.textContent=clock?"SÉANCE · "+stateLabel:"HEURE LOCALE";
 spans[0].lastChild.textContent=clock?S.remain:S.at;
 spans[1].lastChild.textContent=Math.floor(S.work/60)+" h "+String(S.work%60).padStart(2,"0");
 spans[2].lastChild.textContent=S.breaks+" · "+S.rest+" min";
 hero.style.setProperty("--heroInk",clock?skin.clock:skin.timer);
}
function scene(canvas,style,t){
 const W=Math.round(canvas.clientWidth),H=Math.round(canvas.clientHeight);if(W<1||H<1)return;
 const d=Math.min(1.5,devicePixelRatio);if(canvas.width!==Math.round(W*d)||canvas.height!==Math.round(H*d)){canvas.width=Math.round(W*d);canvas.height=Math.round(H*d);}
 const c=canvas.getContext("2d");c.setTransform(d*W/640,0,0,d*H/240,0,0);
 const w=640,h=240;let seed=41987;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 function rect(x,y,a,b,col){c.fillStyle=col;c.fillRect(x,y,a,b);}
 function path(pts,col,fill=true,width=1){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));if(fill){c.closePath();c.fillStyle=col;c.fill();}else{c.strokeStyle=col;c.lineWidth=width;c.stroke();}}
 function disk(x,y,r,col){c.fillStyle=col;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();}
 function sky(a,b){let g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,a);g.addColorStop(1,b);rect(0,0,w,h,g);}
 function glow(x,y,r,col){let g=c.createRadialGradient(x,y,1,x,y,r);g.addColorStop(0,col);g.addColorStop(1,"transparent");rect(x-r,y-r,2*r,2*r,g);}
 function stars(n,col){for(let i=0;i<n;i++)disk(rand()*w,rand()*h,.3+rand()*1.2,col);}
 function pine(x,y,s,color){
 let edges=[],count=13;for(let j=1;j<=count;j++){let z=j/count,b=s*(.011+z*.16)*(.8+rand()*.4);
 edges.push([b*.42,y-s+z*s*.87-2],[b,y-s+z*s*.92+rand()*3]);}
 path([[x,y-s],...edges.map(([a,b])=>[x+a,b]),[x+s*.012,y],[x-s*.012,y],...edges.slice().reverse().map(([a,b])=>[x-a*(.9+rand()*.2),b])],color);}
 // Vector illustrations use a shared 640 × 240 artboard, including thumbnails and Mini.
 function line(pts,col,width=2){path(pts,col,false,width);}
 function form(points,fill,stroke="#161720",width=2){path(points,fill);line([...points,points[0]],stroke,width);}
 function ellipse(x,y,rx,ry,fill,stroke,width=2){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
 function cloud(x,y,s){for(const [dx,dy,r] of [[-26,0,13],[-14,-8,14],[2,-11,18],[20,-5,13],[32,0,10]])disk(x+dx*s,y+dy*s,r*s,"#fffaf0");rect(x-26*s,y,58*s,9*s,"#fffaf0");}
 function road(sky1,sky2){sky(sky1,sky2);path([[0,152],[70,119],[153,139],[242,109],[346,150],[470,123],[579,141],[640,114],[640,240],[0,240]],"#5b5950");}
 if(style==="galaxy"){
 sky("#17162d","#ec9658");stars(75,"#fff3c0");glow(436,100,64,"#ffb65d");disk(436,100,18,"#ffe9af");disk(481,85,12,"#ffb776");
 path([[0,172],[92,151],[181,146],[280,161],[358,137],[451,162],[540,148],[640,141],[640,240],[0,240]],"#9c5843");
 path([[0,207],[130,182],[240,187],[342,168],[482,200],[640,169],[640,240],[0,240]],"#744034");
 for(let i=0;i<19;i++){let x=260+rand()*345,y=154+rand()*38,size=5+rand()*14;rect(x,y,size,size*.52,"#513538");ellipse(x+size*.48,y,size*.48,size*.34,"#66413b");}
 c.save();c.translate(479,87+Math.sin(t*.45)*2);c.rotate(-.15);
 form([[-74,8],[-11,-2],[28,-12],[49,-7],[8,6],[-56,14]],"#b9b1a0");form([[-16,1],[28,-48],[48,-55],[15,0]],"#b8b9b0");form([[1,1],[63,18],[70,29],[15,14]],"#aaa99b");
 for(const y of [-42,17]){line([[25,y],[-35,y+4]],"#ded9c7",3);rect(25,y-3,21,5,"#554e4d");glow(50,y,9,"#ff6c51");}form([[-24,3],[-9,-5],[5,-7],[9,-3]],"#4c7183");c.restore();
 }else if(style==="springfield"){
 sky("#50b7f4","#b8e6ff");cloud(115,43,1.2);cloud(397,34,.84);cloud(607,59,.7);
 for(let i=0;i<25;i++){let x=i*28;ellipse(x,167,32,29+rand()*13,"#75af56","#365c47");}
 rect(0,175,640,65,"#94ca58");form([[409,105],[550,101],[580,193],[401,193]],"#edb39d");form([[393,113],[443,66],[542,72],[568,109]],"#af654b");
 form([[486,122],[573,118],[600,146],[493,146]],"#9d5845");form([[493,145],[592,145],[592,194],[493,194]],"#e6a385");rect(507,156,71,37,"#af765a");for(let y=161;y<193;y+=7)line([[508,y],[577,y]],"#815640",1);
 for(const x of [419,461]){form([[x,120],[x+22,120],[x+22,141],[x,141]],"#85c7d6");line([[x+11,121],[x+11,140]],"#f7ecd5",2);}
 form([[449,151],[474,151],[474,194],[448,194]],"#92644b");disk(467,174,2,"#ffe06b");path([[505,194],[573,194],[621,240],[476,240]],"#dbbcac");
 path([[0,229],[640,215],[640,240],[0,240]],"#85899c");line([[0,225],[640,212]],"#f1d5bf",6);
 for(let i=0;i<8;i++){let x=296+i*10;form([[x,175],[x+4,169],[x+8,175],[x+8,199],[x,199]],"#e2c291","#765441",1);}
 }else if(style==="overgrown"){
 sky("#445e5a","#ddd29b");glow(482,57,110,"#ead391");
 for(let i=0;i<11;i++){let x=240+i*43,y=28+rand()*65;rect(x,y,36,171-y,"#6a7164");for(let j=0;j<18;j++)rect(x+3+(j%3)*11,y+6+Math.floor(j/3)*13,6,8,"#364746");}
 for(let i=0;i<85;i++){let x=250+rand()*400,y=33+rand()*120;for(let j=0;j<6;j++){let xx=x+Math.sin(j)*4;disk(xx,y+j*3,2+rand()*3,["#5e743f","#73834c","#455e35"][i%3]);}}
 path([[0,190],[189,168],[437,155],[640,168],[640,240],[0,240]],"#70715b");
 for(let i=0;i<90;i++){let x=rand()*640,y=163+rand()*83;line([[x,y],[x+rand()*6-3,y-3-rand()*9]],"#52643e",1);}
 for(const [x,y,k] of [[492,168,1],[529,177,.72]]){disk(x,y-22*k,5*k,"#263329");path([[x-5*k,y-17*k],[x+5*k,y-17*k],[x+7*k,y],[x-6*k,y]],"#303d2d");ellipse(x-6*k,y-9*k,5*k,9*k,"#564c37");line([[x-3*k,y],[x-6*k,y+14*k]],"#283229",4*k);line([[x+3*k,y],[x+8*k,y+12*k]],"#283229",4*k);}
 for(let i=0;i<28;i++){let x=rand()*640;ellipse(x,rand()*12-3,18+rand()*15,7+rand()*12,"#334b36");}
 }else if(style==="highway"){
 road("#807768","#debe90");glow(500,79,90,"#f4c487");path([[361,148],[381,148],[590,240],[0,240]],"#595651");line([[368,151],[135,240]],"#ddd1ae",2);
 for(let i=0;i<5;i++){let f=(i+1)/5,x=377+f*117,y=151+f*f*72;line([[x,y],[x+f*16,y+f*10]],"#c3a75e",f*2+1);}
 for(let i=0;i<6;i++){let x=401+i*i*5,y=149+i*i*2.1,k=.32+i*.15;rect(x,y,37*k,8*k,"#4c4840");path([[x+4*k,y],[x+10*k,y-8*k],[x+24*k,y-8*k],[x+31*k,y]],"#62574c");disk(x+7*k,y+8*k,4*k,"#282a26");disk(x+30*k,y+8*k,4*k,"#282a26");}
 for(let i=0;i<5;i++){let x=440+i*37,y=146+i*4;rect(x,y-33-i*3,2+i*.5,36+i*3,"#3a3832");line([[x-7,y-30-i*3],[x+9,y-30-i*3]],"#494135",2);}
 for(let i=0;i<8;i++){let x=322+rand()*65,y=158+rand()*13;disk(x,y-5,1.8,"#32332b");line([[x,y-3],[x-1,y+3],[x+1,y+7]],"#33352c",2);}
 }else if(style==="lab"){
 sky("#285044","#b0a45e");disk(530,54,24,"#d9cd8f");path([[0,155],[86,142],[136,145],[198,104],[242,105],[268,143],[341,147],[384,121],[441,120],[472,149],[565,131],[640,137],[640,240],[0,240]],"#847451");
 rect(0,171,640,69,"#b29a65");for(let i=0;i<70;i++){let x=rand()*640,y=175+rand()*66;line([[x,y],[x+rand()*9,y-1]],"#8b794e",1);}
 for(let i=0;i<13;i++){let x=514+Math.sin(t*.3+i*.47)*(3+i),y=130-i*6;glow(x,y,9+i*.8,"#b8d29b4d");}
 form([[425,136],[544,133],[565,153],[566,183],[416,184],[416,151]],"#d9d0aa","#4f5142");rect(421,164,139,7,"#996b48");rect(421,171,142,3,"#a39761");
 for(let i=0;i<4;i++)rect(428+i*23,143,18,14,"#50645c");form([[525,141],[541,141],[553,155],[525,155]],"#657973","#48584d",1);
 for(const x of [443,542]){disk(x,182,9,"#373c35");disk(x,182,4,"#aaa494");}
 }else if(style==="manga"){
 sky("#fff7dd","#e7decc");for(let x=0;x<640;x+=6)for(let y=0;y<240;y+=6)if(x>260)disk(x,y,1.2,"#51483f55");
 // Inked face and eyes with asymmetrical bangs inside a diagonal comic panel.
 path([[336,0],[640,0],[640,240],[266,240]],"#181622");
 form([[380,-15],[608,-12],[624,83],[606,175],[549,242],[464,228],[400,176],[378,104]],"#fff7df","#13131b",4);
 path([[377,0],[626,0],[632,83],[604,142],[603,65],[570,112],[577,47],[526,104],[547,35],[473,105],[490,55],[427,123],[439,60],[381,144],[388,80],[363,105]],"#171723");
 form([[433,140],[455,119],[482,121],[493,129],[478,143],[457,148]],"#fff","#1c1924",3);ellipse(472,133,8,11,"#24232d");disk(474,129,3,"#fff");
 form([[538,122],[558,102],[586,100],[582,111],[559,125]],"#fff","#181621",3);ellipse(563,113,7,9,"#26222d");disk(565,110,2.4,"#fff");line([[432,130],[456,109],[486,113]],"#171622",4);line([[538,111],[555,96],[585,90]],"#171622",4);
 line([[520,138],[526,157],[516,166]],"#332d35",2);line([[497,190],[527,184],[548,179]],"#2d2630",2.5);
 for(let i=0;i<16;i++){line([[411+i*2,158+i*.7],[423+i*2,170+i*.7]],"#54454b",.8);}
 for(let i=0;i<15;i++){let y=i*17;line([[0,y],[160+rand()*70,110+(y-110)*.24]],"#34303a",i%4?.7:2);}
 path([[321,0],[336,0],[265,240],[250,240]],"#fffaf0");
 }else if(style==="vice"){
 sky("#783c9e","#ff9e7f");disk(460,112,39,"#ffe9a0");
 for(let i=0;i<31;i++){let x=i*22,y=70+rand()*78;rect(x,y,20,178-y,"#583a67");for(let j=0;j<8;j++)rect(x+3+(j%2)*9,y+5+Math.floor(j/2)*10,4,3,"#ffc593");}
 rect(0,170,640,19,"#318d9a");for(let i=0;i<50;i++)rect(rand()*640,171+rand()*18,rand()*13,1,"#8bc1c0");
 rect(0,189,640,51,"#4a344d");line([[0,222],[640,214]],"#e89896",2);
 function palm(x,y,s){c.save();c.translate(x,y);c.scale(s,s);line([[0,0],[-3,-40],[2,-79],[8,-98]],"#241d3a",5);for(let i=0;i<10;i++){let a=(i-5)*.34,dx=Math.sin(a)*52,dy=-Math.cos(a)*16;let pts=[[8,-98]];for(let j=1;j<=12;j++){let f=j/12;pts.push([8+dx*f,-98+dy*f+26*f*f+(j%2?4:0)]);}pts.push([8+dx*.55,-104+dy*.55],[8,-98]);path(pts,"#241d3a");}c.restore();}
 palm(615,195,1.42);palm(363,185,.77);palm(563,189,1.02);
 form([[407,190],[434,183],[456,166],[498,166],[522,181],[549,187],[553,200],[405,201]],"#ef748c","#2b2542",3);form([[443,182],[458,170],[475,169],[473,182]],"#323b5a");form([[479,169],[496,170],[512,181],[478,182]],"#344261");line([[419,191],[540,188]],"#ffe1bb",2);for(let x of [433,523]){disk(x,200,9,"#26253d");disk(x,200,4,"#c1a9ba");}
 }else if(style==="matrix"){
 sky("#010704","#03160c");const glyph="アイウエオカキクケコサシスセソ0123456789";c.font="13px Consolas, monospace";
 for(let i=0;i<52;i++){let x=i*13,y=(rand()*430+t*(10+rand()*20))%380-30;let len=5+Math.floor(rand()*18);
 for(let j=0;j<len;j++){let a=(1-j/len)*(x<370?.29:.96);c.fillStyle=j===0?'rgba(193,255,209,'+a+')':'rgba(53,240,117,'+a+')';c.fillText(glyph[Math.floor(rand()*glyph.length)],x,y-j*13);}}
 }else if(style==="rift"){
 sky("#110d20","#a33430");glow(328,155,215,"#e4533710");for(let i=0;i<66;i++){let x=rand()*w,y=58+rand()*85;glow(x,y,19+rand()*64,"#e3463420");}
 path([[455,0],[430,21],[442,23],[418,37],[428,37],[408,59]],"#f3a2a071",false,1.2);
 for(let layer=0;layer<3;layer++){let col=["#4d2839","#2a1e30","#100f1b"][layer];for(let i=0;i<50;i++){let x=i*14+rand()*8,edge=Math.abs(x-320)/320;pine(x,194+layer*23+rand()*10,20+rand()*30+edge*edge*(29+layer*42),col);}}
 path([[0,194],[160,196],[280,189],[390,199],[480,186],[640,190],[640,240],[0,240]],"#141320");path([[298,194],[326,194],[374,240],[259,240]],"#38202b");
 for(let i=0;i<50;i++)disk(rand()*w,(rand()*h+t*2)%h,.4+rand()*.9,"#ffbe985a");
 }else if(style==="sunset"){
 sky("#351754","#fa6e92");disk(466,104,64,"#ffc274");for(let i=0;i<7;i++)rect(399,105+i*8,135,1+i*.65,"#c24d89");
 path([[0,159],[69,117],[100,140],[160,88],[231,146],[288,135],[355,168],[430,131],[490,152],[578,94],[640,142],[640,240],[0,240]],"#40285d");
 rect(0,170,640,70,"#261b46");for(let i=-8;i<14;i++)path([[320+i*5,170],[320+i*100,240]],"#e878bc7a",false);for(let i=0;i<7;i++)rect(0,170+Math.pow(i,2)*1.8,640,1,"#ae69b9");
 }else if(style==="orbit"){
 sky("#09121d","#1e3145");stars(140,"#cfedff");glow(560,235,160,"#4587aa");disk(560,247,127,"#7a9ab0");disk(548,252,125,"#3c5269");for(let i=0;i<70;i++){let x=465+rand()*150,y=135+rand()*113;if(Math.hypot(x-551,y-248)<114)disk(x,y,1+rand()*6,"#7486964d");}
 }else if(style==="pixel"){
 sky("#100c27","#232044");for(let i=0;i<44;i++){let x=Math.floor(rand()*158)*4,y=Math.floor(rand()*52)*4;rect(x,y,3,3,"#9d9da7");}
 for(let i=0;i<22;i++){let x=i*30,y=150+Math.floor(rand()*10)*5;rect(x,y,28,240-y,"#39275c");for(let j=0;j<6;j++)rect(x+4+(j%2)*9,y+5+Math.floor(j/2)*10,4,4,"#cc6993");}
 const sprite=["001000100","000101000","001111100","011010110","111111111","101111101","101000101","000101000"];sprite.forEach((r,i)=>[...r].forEach((v,j)=>{if(v==="1")rect(490+j*6,49+i*6,6,6,"#9af7ce");}));
 }else if(style==="sonar"){
 sky("#04292b","#031919");const cx=450,cy=111;for(let r=24;r<210;r+=26){c.beginPath();c.arc(cx,cy,r,0,Math.PI*2);c.strokeStyle="#4ed3a34d";c.stroke();}
 for(let i=0;i<12;i++){let a=i*Math.PI/6;path([[cx,cy],[cx+215*Math.cos(a),cy+215*Math.sin(a)]],"#67d8b421",false);}
 for(let i=0;i<28;i++){let a=t*.24-i*.011;path([[cx,cy],[cx+183*Math.cos(a),cy+183*Math.sin(a)]],"rgba(108,254,171,"+(.32-i*.011)+")",false,2);}
 for(let i=0;i<10;i++){let x=345+rand()*220,y=rand()*200;glow(x,y,6,"#70f9a5");}
 }else if(style==="sakura"){
 sky("#261d35","#6b4864");disk(478,64,32,"#f6d6cb");path([[0,196],[90,148],[174,168],[285,98],[412,170],[524,127],[640,161],[640,240],[0,240]],"#392b44");
 function twig(x,y,len,a,depth){let ex=x+Math.cos(a)*len,ey=y+Math.sin(a)*len;path([[x,y],[ex,ey]],"#211923",false,depth*1.8);if(depth>1){twig(ex,ey,len*.68,a-.36-rand()*.2,depth-1);twig(ex,ey,len*.67,a+.32+rand()*.2,depth-1);}else{for(let i=0;i<7;i++)disk(ex+rand()*22-11,ey+rand()*14-7,1.3+rand()*2.7,"#e3afc4");}}
 twig(653,211,92,-2.21,5);for(let i=0;i<18;i++){let x=(rand()*640+t*3)%640,y=(rand()*240+t*2)%240;disk(x,y,1.8,"#f6d3de88");}
 }else if(style==="mecha"){
 sky("#172329","#324854");for(let x=-100;x<750;x+=34)path([[x,0],[x-100,240]],"#b3d6df12",false);
 for(let i=0;i<5;i++){let x=455+i*20;path([[x,48],[x+29,48],[x-14,112],[x-42,112]],i%2?"#df8547":"#26333a");}
 for(let i=0;i<40;i++)rect(400+i*5,157,2,i%5?5:12,"#8fadb1");
 }
}
function animateWorld(ms){requestAnimationFrame(animateWorld);if(!activeWorld||document.hidden||(!S.mini&&page!=="console"))return;
 const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches,frame=Math.floor(ms/(reduced?2000:160));if(frame===lastFrame)return;lastFrame=frame;scene(S.mini?miniCanvas:worldCanvas,activeWorld,reduced?0:ms/1000);
}
requestAnimationFrame(animateWorld);

function galleryScenes(){
 requestAnimationFrame(()=>{for(const el of document.querySelectorAll("#skinsGrid .swatch")){
 let id=el.dataset.skin;if(!worlds[id]||el.classList.contains("art"))continue;
 let canvas=el.querySelector("canvas");if(!canvas){canvas=document.createElement("canvas");canvas.setAttribute("aria-hidden","true");el.prepend(canvas);el.classList.add("scenePreview");}
 if(canvas.clientWidth)scene(canvas,id,8);
 }});
}
