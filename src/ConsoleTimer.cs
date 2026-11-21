using System;
using System.Drawing;
using System.Windows.Forms;

public partial class Tempo {
 readonly string[] stations={"FIP","France Inter","Chérie FM","France Musique","franceinfo","Chante France"};
 readonly string[] streams={"https://icecast.radiofrance.fr/fip-midfi.mp3","https://icecast.radiofrance.fr/franceinter-midfi.mp3",Cherie,"https://icecast.radiofrance.fr/francemusique-midfi.mp3","https://icecast.radiofrance.fr/franceinfo-midfi.mp3","https://chantefrance.ice.infomaniak.ch/chantefrance-128.mp3"};
 string status="PRÊTE"; DateTime finish,change; int leftBreaks,restMinutes;
 void SelectStation(int index){data.Station=(index+stations.Length)%stations.Length;Tune(new Uri(streams[data.Station]),stations[data.Station]);Save();}
 void BeginPhase(DateTime at,bool rest){
 if(live!=null)live.End=at;
 live=new Session{Start=at,End=at,Rest=rest};data.History.Add(live);
 var seconds=(finish-at).TotalSeconds;
 if(rest){leftBreaks=Math.Max(0,leftBreaks-1);change=at.AddSeconds(Math.Min(seconds,restMinutes*60));}
 else{while(leftBreaks>0&&seconds<=leftBreaks*restMinutes*60)leftBreaks--;
 change=leftBreaks==0?finish:at.AddSeconds((seconds-leftBreaks*restMinutes*60)/(leftBreaks+1));}
 status=rest?"EN PAUSE":"EN SESSION";
 }
 void Advance(DateTime now){
 if(live==null)return;
 bool signal=false;
 while(live!=null&&now>=change){
 signal=true;
 if(change>=finish){live.End=finish;live=null;status="TERMINÉE";break;}
 BeginPhase(change,!live.Rest);
 }
 if(live!=null)live.End=now;
 if(signal){Ring();Save();}
 }
 void Command(int k,DateTime now){
 Advance(now);
 if(k==3){if(live!=null)live.End=now;live=null;status="ARRÊTÉE";StopSound();}
 else if(k==0&&live==null){finish=now.AddMinutes(data.Duration);leftBreaks=data.Breaks;restMinutes=data.RestMinutes;BeginPhase(now,false);}
 else if(k==0&&live.Rest)BeginPhase(now,false);
 else if(k==1&&live!=null&&!live.Rest)BeginPhase(now,true);
 else if(k==2&&live!=null){finish=finish.AddMinutes(5);change=change.AddMinutes(5);}
 Save();Invalidate();
 }
 string Remaining(DateTime until,DateTime now){return Short(TimeSpan.FromSeconds(Math.Max(0,Math.Ceiling((until-now).TotalSeconds))));}
 int ColorIndex(int row){int v=row==0?data.ClockColor:row==1?data.TimerColor:data.DayColor;return Math.Min(9,Math.Max(0,v));}
 readonly Color[] palette={C("#ff493e"),C("#65ff79"),C("#ffb734"),C("#78caff"),C("#ff55dc"),C("#36e7da"),C("#ff7138"),C("#b88cff"),C("#ff96ae"),C("#fff2cf")};
}