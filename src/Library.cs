using System;
using System.Linq;
using System.Collections.Generic;
using System.IO;
using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using System.Windows.Forms;
public class DayTask {
 public string Id="",Title="",Day="",Time="";
 public bool Done,Notified;
}
public class Skin {
 public int version=1;
 public string image=""; public string name="",style="",shell="",panel="",accent="",clock="",timer="",summary="";
}
public partial class Tempo {
 List<Skin> catalogue;
 string displayedDay="";
 void InitLibrary(){
 catalogue=json.Deserialize<List<Skin>>(Boot.Read("skins.json"));
 if(data.Tasks==null)data.Tasks=new List<DayTask>();
 if(data.Designs==null)data.Designs=new List<Skin>();
 if(data.SkinIndex>=data.CatalogueSize)data.SkinIndex+=catalogue.Count-data.CatalogueSize;data.CatalogueSize=catalogue.Count;if(data.SkinIndex<0||data.SkinIndex>=Library().Count)data.SkinIndex=0;
 // Carry the previous version's individual display colours into the original theme.
 var legacy=new[]{"#ff5944","#80ff83","#ffb841","#8ecbff","#ff60d1","#46e6cf","#ff7538","#bd91ff","#ffa2b1","#fff2ce"};
 if(data.ClockColor!=0||data.TimerColor!=1||data.DayColor!=2){
 catalogue[0].clock=legacy[ColorIndex(0)];catalogue[0].timer=legacy[ColorIndex(1)];catalogue[0].summary=legacy[ColorIndex(2)];}
 }
 List<Skin> Library(){return catalogue.Concat(data.Designs).ToList();}
 void LibraryView(){Send(new{kind="skins",items=Library(),builtinCount=catalogue.Count,index=data.SkinIndex});}
 bool ValidArt(string art){
 if(String.IsNullOrEmpty(art))return true;
 const string prefix="data:image/jpeg;base64,";
 if(art.Length>440000||!art.StartsWith(prefix,StringComparison.Ordinal))return false;
 try{byte[] bytes=Convert.FromBase64String(art.Substring(prefix.Length));return bytes.Length>=4&&bytes[0]==255&&bytes[1]==216&&bytes[bytes.Length-2]==255&&bytes[bytes.Length-1]==217;}catch(FormatException){return false;}
 }
 bool ValidSkin(Skin t){return t!=null&&ValidArt(t.image)&&t.version==1&&!String.IsNullOrWhiteSpace(t.name)&&t.name.Trim().Length<=50&&catalogue.Any(x=>x.style==t.style)&&new[]{t.shell,t.panel,t.accent,t.clock,t.timer,t.summary}.All(c=>c!=null&&Regex.IsMatch(c,@"^#[0-9A-Fa-f]{6}$"));}
 void AcceptSkin(string raw){
 if(raw.Length>450000)throw new InvalidDataException();
 var dict=json.Deserialize<Dictionary<string,object>>(raw);
 if(!dict.ContainsKey("version"))throw new InvalidDataException();
 var t=json.Deserialize<Skin>(raw);if(!ValidSkin(t))throw new InvalidDataException();
 t.name=t.name.Trim();var all=Library();int i=all.FindIndex(x=>json.Serialize(x)==json.Serialize(t));
 if(i<0){data.Designs.Add(t);i=all.Count;}data.SkinIndex=i;Save();LibraryView();Notice("Thème ajouté à la galerie et appliqué.");
 }
 void ImportSkin(string file){if(new FileInfo(file).Length>450000)throw new InvalidDataException();AcceptSkin(File.ReadAllText(file,Encoding.UTF8));}
 void ThemeCommand(string op,string v,int n){
 try{if(op=="skin"){if(n<0||n>=Library().Count)return;data.SkinIndex=n;Save();LibraryView();}
 if(op=="customSkin")AcceptSkin(v);
 if(op=="importSkin")using(var f=new OpenFileDialog{Filter="Thème Tempo|*.tempo-theme;*.json"})if(f.ShowDialog(this)==DialogResult.OK)ImportSkin(f.FileName);
 if(op=="exportSkin")using(var f=new SaveFileDialog{Filter="Thème Tempo|*.tempo-theme",FileName="Mon-theme.tempo-theme",DefaultExt="tempo-theme"})if(f.ShowDialog(this)==DialogResult.OK){File.WriteAllText(f.FileName,json.Serialize(Library()[data.SkinIndex]),new UTF8Encoding(false));Notice("Fichier de thème prêt à partager.");}
 }catch{Notice("Ce thème ne peut pas être lu ou enregistré. Vérifie le format Tempo version 1.");}}
 static string DayKey(DateTime d){return d.ToString("yyyy-MM-dd",CultureInfo.InvariantCulture);}
 void TaskView(){string today=DayKey(DateTime.Now);displayedDay=today;Send(new{kind="tasks",day=today,items=data.Tasks.Where(t=>t.Day==today||!t.Done).OrderBy(t=>t.Done).ThenBy(t=>t.Day).ThenBy(t=>t.Time==""?"99":t.Time).ToArray()});}
 void TaskCommand(string op,string id,Dictionary<string,string> msg){
 var t=data.Tasks.FirstOrDefault(x=>x.Id==id);
 if(op=="taskSave"){
 string title=msg["title"].Trim(),time=msg["time"];if(title.Length==0||title.Length>160||time!=""&&!Regex.IsMatch(time,@"^([01][0-9]|2[0-3]):[0-5][0-9]$")){Notice("Vérifie le titre et l’heure du rappel.");return;}
 if(t==null){if(id!="")return;t=new DayTask{Id=Guid.NewGuid().ToString("N"),Day=DayKey(DateTime.Now)};data.Tasks.Add(t);}
 if(t.Time!=time||t.Day!=DayKey(DateTime.Now))t.Notified=false;
 t.Day=DayKey(DateTime.Now);t.Title=title;t.Time=time;
 }else if(t!=null){if(op=="taskDone"){t.Done=!t.Done;}else if(op=="taskDelete")data.Tasks.Remove(t);}
 Save();TaskView();
 }
 void CheckTasks(DateTime now){
 if(!ready)return;string today=DayKey(now);if(displayedDay!=today)TaskView();
 var due=data.Tasks.Where(t=>!t.Done&&!t.Notified&&t.Day==today&&t.Time!=""&&String.CompareOrdinal(t.Time,now.ToString("HH:mm",CultureInfo.InvariantCulture))<=0).ToArray();
 if(due.Length==0)return;foreach(var t in due)t.Notified=true;Save();
 string text=String.Join(" · ",due.Select(t=>t.Time+" "+t.Title));Ring();tray.ShowBalloonTip(9000,"À faire aujourd’hui",text.Substring(0,Math.Min(240,text.Length)),ToolTipIcon.Info);Send(new{kind="taskAlert",text=text});TaskView();
 }
}
