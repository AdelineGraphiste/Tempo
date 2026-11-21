using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Net;
using System.Reflection;
using System.Windows.Forms;
using System.Drawing;
using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Threading.Tasks;
using System.Web.Script.Serialization;
using System.Collections.Generic;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;
class Boot{
 [STAThread]public static void Main(string[] args){Setup();Run(args);}
 [System.Runtime.CompilerServices.MethodImpl(System.Runtime.CompilerServices.MethodImplOptions.NoInlining)]static void Run(string[] args){Tempo.Main(args);}
 [DllImport("kernel32.dll",CharSet=CharSet.Unicode)]static extern bool SetDllDirectory(string dir);
 public static Stream Resource(string n){return Assembly.GetExecutingAssembly().GetManifestResourceStream(n);}
 public static string Read(string n){using(var r=new StreamReader(Resource(n)))return r.ReadToEnd();}
 public static void Setup(){
 AppDomain.CurrentDomain.AssemblyResolve+=(s,e)=>{string n=new AssemblyName(e.Name).Name+".dll";using(var r=Resource(n)){if(r==null)return null;using(var m=new MemoryStream()){r.CopyTo(m);return Assembly.Load(m.ToArray());}}};
 var dir=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),"TempoRadio","runtime2903");Directory.CreateDirectory(dir);string dll=Path.Combine(dir,"WebView2Loader.dll");if(!File.Exists(dll)){string tmp=dll+Guid.NewGuid();using(var r=Resource("loader"))using(var f=File.Create(tmp))r.CopyTo(f);try{File.Move(tmp,dll);}catch(IOException){File.Delete(tmp);}}SetDllDirectory(dir);
 }}
public partial class Tempo{
 WebView2 view;NotifyIcon tray;bool ready; readonly JavaScriptSerializer json=new JavaScriptSerializer{MaxJsonLength=12000000};
 [DllImport("user32.dll")]static extern bool ReleaseCapture();
 [DllImport("user32.dll")]static extern IntPtr SendMessage(IntPtr h,int m,IntPtr w,IntPtr l);
 void InitConsole(){
 MinimumSize=data.Mini?new Size(220,98):new Size(410,420);ClientSize=data.Mini?new Size(316,112):new Size(Math.Max(410,data.Wide),Math.Max(420,data.Tall));BackColor=Color.FromArgb(39,40,41);
 tray=new NotifyIcon{Icon=this.Icon,Text="Tempo",Visible=true};tray.BalloonTipClicked+=(s,e)=>{WindowState=FormWindowState.Normal;Activate();};
 view=new WebView2{Dock=DockStyle.Fill,DefaultBackgroundColor=BackColor};Controls.Add(view);Shown+=async(s,e)=>{try{
 var env=await CoreWebView2Environment.CreateAsync(null,Path.Combine(folder,"interface"));await view.EnsureCoreWebView2Async(env);
 var core=view.CoreWebView2;core.Settings.AreDevToolsEnabled=false;core.Settings.AreDefaultContextMenusEnabled=false;core.Settings.IsStatusBarEnabled=false;core.Settings.IsZoomControlEnabled=false;
 const string home="https://tempo.local/index.html";core.NewWindowRequested+=(x,y)=>y.Handled=true;core.NavigationStarting+=(x,y)=>{if(y.Uri!=home)y.Cancel=true;};core.WebMessageReceived+=(x,y)=>{if(y.Source==home)Receive(y.WebMessageAsJson);};
 var html=Boot.Read("desk.html").Replace("/*ICAL*/",Boot.Read("ical.js")).Replace("/*CAL*/",Boot.Read("agenda.js")).Replace("/*APP*/",Boot.Read("desk.js")).Replace("/*WORLD_CSS*/",Boot.Read("worlds.css")).Replace("/*WORLDS*/",Boot.Read("worlds.js"));core.AddWebResourceRequestedFilter(home,CoreWebView2WebResourceContext.Document);core.WebResourceRequested+=(s2,e2)=>{if(e2.Request.Uri==home)e2.Response=env.CreateWebResourceResponse(new MemoryStream(Encoding.UTF8.GetBytes(html)),200,"OK","Content-Type: text/html; charset=utf-8");};core.Navigate(home);
 }catch{MessageBox.Show(this,"L’interface nécessite Microsoft Edge WebView2 Runtime pour Windows.","Tempo");Close();}};
 ResizeEnd+=(s,e)=>Save();
 }
 void Send(object value){if(ready&&!IsDisposed)view.CoreWebView2.PostWebMessageAsJson(json.Serialize(value));}
 void Notice(string text){Send(new{kind="notice",text=text});}
 void Publish(){if(!ready)return;var now=DateTime.Now;var day=now.Date;
 var h=data.History.Where(s=>s.End>=day&&s.Start<=now).ToArray();
 Send(new{kind="state",at=now.ToString("HH:mm:ss"),date=now.ToString("dd.MM.yy"),remain=live==null?(status=="PRÊTE"?Short(TimeSpan.FromMinutes(data.Duration)):"00:00:00"):Remaining(finish,now),status=status,phase=live!=null&&live.Rest?Remaining(change,now):"",work=(int)h.Where(s=>!s.Rest).Sum(s=>Overlap(s,day,now)),breaks=h.Count(s=>s.Rest&&s.Start>=day),rest=(int)h.Where(s=>s.Rest).Sum(s=>Overlap(s,day,now)),radio=radio!=null,station=station,idx=data.Station,mini=data.Mini,pin=data.Pin,colors=new[]{ColorIndex(0),ColorIndex(1),ColorIndex(2)}});
 }
 static double Overlap(Session s,DateTime a,DateTime b){return Math.Max(0,((s.End<b?s.End:b)-(s.Start>a?s.Start:a)).TotalMinutes);}
 void Prefs(){Send(new{kind="prefs",len=data.Duration,num=data.Breaks,rest=data.RestMinutes,volume=data.Volume,lead=data.Lead,mute=data.Mute,playlist=data.Playlist,connected=data.CalendarKey!="",stations=stations,sound=String.IsNullOrEmpty(data.Sound)?"Carillon Windows":"Son personnel"});}
 void HistoryView(string mode,int offset){DateTime today=DateTime.Today;int n;DateTime start;
 if(mode=="mois"){start=new DateTime(today.Year,today.Month,1).AddMonths(offset);n=DateTime.DaysInMonth(start.Year,start.Month);}
 else if(mode=="semaine"){start=today.AddDays(-((int)today.DayOfWeek+6)%7+offset*7);n=7;}else{start=today.AddDays(offset);n=24;}
 var end=mode=="jour"?start.AddDays(1):start.AddDays(n);var hits=data.History.Where(s=>s.End>start&&s.Start<end).ToList();
 var bars=Enumerable.Range(0,n).Select(i=>{var a=mode=="jour"?start.AddHours(i):start.AddDays(i);var b=mode=="jour"?a.AddHours(1):a.AddDays(1);return new{label=mode=="jour"?i+" h":a.ToString("dd/MM"),w=hits.Where(s=>!s.Rest).Sum(s=>Overlap(s,a,b)),p=hits.Where(s=>s.Rest).Sum(s=>Overlap(s,a,b))};}).ToArray();
 Send(new{kind="history",bars=bars,title=start.ToString("dd/MM/yyyy")+(mode=="jour"?"":" — "+end.AddDays(-1).ToString("dd/MM/yyyy")),count=hits.Count(s=>s.Rest&&s.Start>=start),mode=mode,offset=offset});}
 static string Protect(string v){return Convert.ToBase64String(ProtectedData.Protect(Encoding.UTF8.GetBytes(v),null,DataProtectionScope.CurrentUser));}
 static string Reveal(string v){return Encoding.UTF8.GetString(ProtectedData.Unprotect(Convert.FromBase64String(v),null,DataProtectionScope.CurrentUser));}
 int revision;DateTime nextLoad;bool fetching;
 async Task LoadCalendar(string source,bool first){
 int version=++revision;fetching=true;try{
 string raw=await Task.Run(()=>{using(var wc=new WebClient()){Stream input;
 if(Path.IsPathRooted(source)){input=File.OpenRead(source);}else{Uri url;if(!WebLink(source,out url))throw new Exception();ServicePointManager.SecurityProtocol|=SecurityProtocolType.Tls12;input=wc.OpenRead(url);}
 using(input)using(var buf=new MemoryStream()){byte[] block=new byte[8192];int k;while((k=input.Read(block,0,block.Length))>0){if(buf.Length+k>4000000)throw new Exception();buf.Write(block,0,k);}return Encoding.UTF8.GetString(buf.ToArray());}}});
 if(version!=revision||IsDisposed)return;if(!raw.Contains("BEGIN:VCALENDAR"))throw new Exception();
 Send(new{kind="ical",raw=raw,version=version});pendingSource=source;
 }catch{if(version==revision)Notice("Agenda inaccessible. Vérifie le lien iCalendar ou le fichier .ics.");}finally{if(version==revision){fetching=false;nextLoad=DateTime.Now.AddMinutes(10);}}
 }
 string pendingSource="";
 void RefreshCalendar(){if(!fetching&&data.CalendarKey!=""&&DateTime.Now>=nextLoad){try{var task=LoadCalendar(Reveal(data.CalendarKey),false);}catch{Notice("Reconnecte ton agenda.");nextLoad=DateTime.Now.AddHours(1);}}}
 async void Receive(string payload){try{var msg=json.Deserialize<Dictionary<string,string>>(payload);string op=msg["op"];string v=msg.ContainsKey("v")?msg["v"]:"";int n;int.TryParse(v,out n);
 switch(op){
 case "ready":ready=true;LibraryView();TaskView();Prefs();Publish();RefreshCalendar();break;
 case "skin":case "customSkin":case "importSkin":case "exportSkin":ThemeCommand(op,v,n);return;
 case "taskSave":case "taskDone":case "taskDelete":TaskCommand(op,v,msg);return;
 case "pollCal":RefreshCalendar();break;
 case "command":if(n>=0&&n<=3)Command(n,DateTime.Now);break;
 case "pin":TopMost=data.Pin=!data.Pin;break;
 case "min":WindowState=FormWindowState.Minimized;return;
 case "uninstall":UninstallTempo();return;
 case "quit":Close();return;
 case "drag":case "resize":ReleaseCapture();SendMessage(Handle,0xA1,(IntPtr)(op=="drag"?2:17),IntPtr.Zero);return;
 case "expand":if(!data.Mini)return;goto case "mini";
 case "size":Size=new Size(Math.Max(MinimumSize.Width,Math.Min(3000,n)),Math.Max(MinimumSize.Height,Math.Min(2000,int.Parse(msg["height"]))));return;
 case "mini":if(!data.Mini){Send(new{kind="closeYT"});data.Wide=Width;data.Tall=Height;}data.Mini=!data.Mini;MinimumSize=data.Mini?new Size(220,98):new Size(410,420);Size=data.Mini?new Size(316,112):new Size(Math.Max(410,data.Wide),Math.Max(420,data.Tall));break;
 case "history":HistoryView(msg["mode"],Math.Max(-2000,Math.Min(0,n)));return;
 case "tune":if(n>=0&&n<stations.Length){Send(new{kind="closeYT"});SelectStation(n);}break;
 case "stopRadio":StopRadio();break;
 case "vol":data.Volume=Math.Max(0,Math.Min(100,n));if(radio!=null)radio.Volume=data.Volume/100f;break;
 case "link":Uri u;if(!WebLink(v,out u)){Notice("Entre un lien HTTPS de playlist.");return;}if(IsYouTube(u)){string embed=YouTubeEmbed(u);if(embed==null){Notice("Colle le lien d’une vidéo ou d’une playlist YouTube.");return;}data.Playlist=u.AbsoluteUri;StopRadio();Send(new{kind="youtube",url=embed});}else{data.Playlist=u.AbsoluteUri;OpenPlaylist();Send(new{kind="closeYT"});}break;
 case "musicFile":using(var f=new OpenFileDialog{Filter="Musique|*.mp3;*.wav;*.flac;*.m4a;*.ogg"})if(f.ShowDialog(this)==DialogResult.OK){ProcessLocal(f.FileName);StopRadio();Send(new{kind="closeYT"});}break;
 case "plan":int a=int.Parse(msg["len"]),b=int.Parse(msg["num"]),c=int.Parse(msg["rest"]);if(a<1||a>480||b<0||b>12||c<1||c>60||b*c>=a){Notice("Garde au moins une minute de travail et vérifie les durées.");return;}data.Duration=a;data.Breaks=b;data.RestMinutes=c;Notice("Programme enregistré pour la prochaine séance.");break;
 case "colors":int row=int.Parse(msg["row"]);if(n<0||n>9)return;if(row==0)data.ClockColor=n;else if(row==1)data.TimerColor=n;else data.DayColor=n;break;
 case "mute":data.Mute=!data.Mute;StopSound();break;
 case "ring":Ring();return;
 case "resetSound":data.Sound="";break;
 case "wav":using(var f=new OpenFileDialog{Filter="Son WAV PCM|*.wav"})if(f.ShowDialog(this)==DialogResult.OK){using(var p=new System.Media.SoundPlayer(f.FileName)){p.Load();}Directory.CreateDirectory(folder);string dest=Path.Combine(folder,"sonnerie.wav");if(!String.Equals(dest,f.FileName,StringComparison.OrdinalIgnoreCase))File.Copy(f.FileName,dest,true);data.Sound=dest;Ring();}break;
 case "lead":data.Lead=Math.Max(0,Math.Min(120,n));break;
 case "calendar":if(v.StartsWith("webcal://",StringComparison.OrdinalIgnoreCase))v="https://"+v.Substring(9);Uri address;if(!WebLink(v,out address)){Notice("Entre un lien HTTPS ou webcal.");return;}await LoadCalendar(address.AbsoluteUri,true);return;
 case "ics":using(var f=new OpenFileDialog{Filter="Calendrier iCalendar|*.ics"})if(f.ShowDialog(this)==DialogResult.OK)await LoadCalendar(f.FileName,true);return;
 case "calOK":if(n!=revision||pendingSource=="")return;data.CalendarKey=Protect(pendingSource);pendingSource="";break;
 case "disconnect":revision++;fetching=false;pendingSource="";data.CalendarKey="";Send(new{kind="clear"});break;
 case "remind":Ring();tray.ShowBalloonTip(9000,"Rendez-vous",v.Length>240?v.Substring(0,240):v,ToolTipIcon.Info);return;
 default:return;
 }Save();Prefs();Publish();}catch{Notice("Cette action n’a pas abouti. Vérifie la saisie ou réessaie.");}}
 static bool IsYouTube(Uri u){return new[]{"www.youtube.com","youtube.com","music.youtube.com","m.youtube.com","youtu.be","www.youtube-nocookie.com"}.Contains(u.Host.ToLowerInvariant());}
 static string YouTubeEmbed(Uri u){
 var q=System.Web.HttpUtility.ParseQueryString(u.Query);var parts=u.AbsolutePath.Trim('/').Split('/');string id=q["v"],list=q["list"];
 if(u.Host=="youtu.be")id=parts[0];else if(parts.Length==2&&new[]{"shorts","live","embed"}.Contains(parts[0]))id=parts[1];
 bool video=id!=null&&System.Text.RegularExpressions.Regex.IsMatch(id,"^[A-Za-z0-9_-]{11}$");
 bool playlist=list!=null&&System.Text.RegularExpressions.Regex.IsMatch(list,"^[A-Za-z0-9_-]{2,180}$");
 if(!video&&!playlist)return null;
 return "https://www.youtube.com/embed/"+(video?id:"videoseries")+"?playsinline=1&autoplay=1&enablejsapi=1&origin=https%3A%2F%2Ftempo.local"+(playlist?"&list="+list:"");
 }
 void UninstallTempo(){
 using(var key=Microsoft.Win32.Registry.CurrentUser.OpenSubKey(@"Software\AdelineCourtois\Tempo")){
 Guid code;string value=key==null?null:key.GetValue("ProductCode") as string;
 if(!Guid.TryParse(value,out code)){Notice("Utilise Paramètres Windows > Applications > Tempo pour désinstaller cette version.");return;}
 System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.System),"msiexec.exe"),"/x "+code.ToString("B")){UseShellExecute=true});
 Close();
 }}
 static void ProcessLocal(string f){System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo(f){UseShellExecute=true});}
}
