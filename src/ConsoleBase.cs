using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Text;
using System.Windows.Forms;
using System.IO;
using System.Xml.Serialization;
using System.Collections.Generic;
using System.Media;
using System.Runtime.InteropServices;
using System.Diagnostics;

public class Session { public DateTime Start, End; public bool Rest; }
public class Memory {
 public List<DayTask> Tasks=new List<DayTask>(); public List<Skin> Designs=new List<Skin>(); public int SkinIndex=0, CatalogueSize=10;
 public List<Session> History=new List<Session>();
 public int Minutes=50, Theme=0, X=-32000, Y=0;
 public bool Pin=false, Mute=false;
 public int Wide=660,Tall=608,Lead=10; public bool Mini; public string CalendarKey=""; public int Duration=60,Breaks=2,RestMinutes=5,Station=0,ClockColor=0,TimerColor=1,DayColor=2; public string Sound="", Stream="", Playlist=""; public int Volume=50;
}
public partial class Tempo:Form {
 static readonly string folder=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),"TempoRadio");
 static readonly string path=Path.Combine(folder,"sessions.xml");
 Memory data=new Memory(); Session live; 
 SoundPlayer player; static Color C(string s){return ColorTranslator.FromHtml(s);}
 const int W=590,H=493;
 static readonly string[] keys={"SESSION","PAUSE","+ 5 MIN","ARRÊT"};
 static readonly XmlSerializer codec=new XmlSerializer(typeof(Memory));
 [STAThread] public static void Main(string[] args){
 Application.EnableVisualStyles(); Application.SetCompatibleTextRenderingDefault(false);
 using(var mutex=new System.Threading.Mutex(false,"Local\\TempoRadioDesk")) {
 if(args.Length==0&&!mutex.WaitOne(0)){MessageBox.Show("Tempo est déjà ouvert sur ton bureau.","Tempo");return;}
 using(Tempo t=new Tempo()){
 Application.Run(t);}
 }}
 public Tempo(){
 try{using(var f=File.OpenRead(path))data=(Memory)codec.Deserialize(f);}catch{}
 if(data.History==null)data.History=new List<Session>();data.Theme=Math.Max(0,Math.Min(3,data.Theme));
 ClientSize=new Size(W,H); FormBorderStyle=FormBorderStyle.None;DoubleBuffered=true;Text="Tempo";Icon=System.Drawing.Icon.ExtractAssociatedIcon(Application.ExecutablePath);KeyPreview=true;
 StartPosition=FormStartPosition.CenterScreen;
 if(Array.Exists(Screen.AllScreens,s=>s.WorkingArea.Contains(new Rectangle(data.X,data.Y,W,H)))){StartPosition=FormStartPosition.Manual;Location=new Point(data.X,data.Y);}
 TopMost=data.Pin; InitLibrary();InitConsole();
 var timer=new Timer{Interval=500};timer.Tick+=(s,e)=>{Advance(DateTime.Now);CheckTasks(DateTime.Now);if(live!=null&&(DateTime.Now-lastSave).TotalSeconds>=15){Save();lastSave=DateTime.Now;}Publish();};timer.Start();
 FormClosing+=(s,e)=>{Advance(DateTime.Now);Save();StopSound();StopRadio();timer.Stop();if(tray!=null)tray.Dispose();};
 }
 void Save(){try{Directory.CreateDirectory(folder);if(WindowState==FormWindowState.Normal){data.X=Left;data.Y=Top;if(!data.Mini){data.Wide=Width;data.Tall=Height;}}string tmp=path+".tmp";using(var f=File.Create(tmp))codec.Serialize(f,data);if(File.Exists(path))File.Replace(tmp,path,null);else File.Move(tmp,path);}catch(Exception ex){Text="Tempo · enregistrement impossible : "+ex.Message;}}
 void StopSound(){if(player!=null){player.Stop();player.Dispose();player=null;}}
 void Ring(){StopSound();if(data.Mute)return;try{if(File.Exists(data.Sound)){player=new SoundPlayer(data.Sound);player.Play();}else SystemSounds.Asterisk.Play();}catch{SystemSounds.Asterisk.Play();}}
 DateTime lastSave;
 static string Short(TimeSpan s){return ((int)s.TotalHours).ToString("00")+":"+s.Minutes.ToString("00")+":"+s.Seconds.ToString("00");}
}