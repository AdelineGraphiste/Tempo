using System;
using System.Diagnostics;
using System.Drawing;
using System.Windows.Forms;
using Microsoft.VisualBasic;

public partial class Tempo {
 const string Cherie="https://streaming.nrjaudio.fm/ouuku85n3nje?origine=ecouterendirect";
 Receiver radio;
 string station="";
 void StopRadio(){if(radio!=null){var p=radio;radio=null;p.Close();}station="";Invalidate();}
 void Tune(Uri uri,string name){
 StopRadio();var p=new Receiver(uri,data.Volume/100f);radio=p;station="Connexion…";
 p.Start(()=>PostAudio(()=>{if(radio==p){station=name;Invalidate();}}),reason=>PostAudio(()=>{if(radio!=p)return;StopRadio();Notice("Lecture radio impossible. Vérifie la connexion.");}));
 }
 void PostAudio(Action a){try{if(!IsDisposed&&IsHandleCreated)BeginInvoke(a);}catch(InvalidOperationException){}} static bool WebLink(string value,out Uri link){return Uri.TryCreate(value,UriKind.Absolute,out link)&&link.Scheme=="https"&&!String.IsNullOrEmpty(link.Host);}
 void OpenPlaylist(){Uri u;if(!WebLink(data.Playlist,out u))return;try{Process.Start(new ProcessStartInfo(u.AbsoluteUri){UseShellExecute=true});StopRadio();}catch{Notice("Le navigateur ne peut pas ouvrir ce lien.");}}
}

