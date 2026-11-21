using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;
using Microsoft.Win32;
[assembly:System.Reflection.AssemblyTitle("Désinstaller Tempo")]
[assembly:System.Reflection.AssemblyProduct("Tempo")]
class Uninstall {
 [STAThread] static void Main(){
 Application.EnableVisualStyles();
 try{
 Guid code;
 using(var key=Registry.CurrentUser.OpenSubKey(@"Software\AdelineCourtois\Tempo")){
 string value=key==null?null:key.GetValue("ProductCode") as string;
 if(!Guid.TryParse(value,out code)){MessageBox.Show("Tempo n’est pas installé pour ce compte Windows.","Désinstaller Tempo",MessageBoxButtons.OK,MessageBoxIcon.Information);return;}
 }
 Process.Start(new ProcessStartInfo(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.System),"msiexec.exe"),"/x "+code.ToString("B")){UseShellExecute=true});
 }catch(Exception){MessageBox.Show("La désinstallation n’a pas pu démarrer. Ouvre Paramètres Windows > Applications > Tempo.","Désinstaller Tempo",MessageBoxButtons.OK,MessageBoxIcon.Error);}
 }
}
