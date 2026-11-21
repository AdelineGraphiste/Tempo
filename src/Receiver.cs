using System;
using System.IO;
using System.Net;
using System.Threading;
using NAudio.Wave;

// The worker owns the decoder and output device. Abort also unblocks a pending network read.
public class Receiver {
 readonly HttpWebRequest request;
 volatile bool closed;
 volatile float volume;
 public float Volume { set { volume=value; } }
 public Receiver(Uri url,float level){
 ServicePointManager.SecurityProtocol |= SecurityProtocolType.Tls12;request=(HttpWebRequest)WebRequest.Create(url);
 request.Timeout=12000;request.ReadWriteTimeout=12000;request.UserAgent="Tempo/2";volume=level;
 }
 public void Start(Action ready,Action<string> failed){
 var worker=new Thread(()=>{try{Read(ready);}catch(Exception e){if(!closed)failed(e.Message);}});
 worker.IsBackground=true;worker.Start();
 }
 public void Close(){closed=true;request.Abort();}
 void Read(Action ready){
 using(var response=request.GetResponse())using(var stream=new RadioInput(response.GetResponseStream())){
 Mp3Frame frame=Mp3Frame.LoadFromStream(stream);
 if(frame==null)throw new InvalidDataException("Flux MP3 introuvable.");
 var format=new Mp3WaveFormat(frame.SampleRate,frame.ChannelMode==ChannelMode.Mono?1:2,frame.FrameLength,frame.BitRate);
 using(var decoder=new AcmMp3FrameDecompressor(format))using(var output=new WaveOutEvent()){
 var buffer=new BufferedWaveProvider(decoder.OutputFormat);
 var bytes=new byte[65536];output.Init(buffer);output.Volume=volume;
 bool playing=false;
 while(!closed && frame!=null){
 while(!closed&&buffer.BufferedDuration.TotalSeconds>2)Thread.Sleep(80);
 if(closed)break;
 int n=decoder.DecompressFrame(frame,bytes,0);buffer.AddSamples(bytes,0,n);
 if(!playing&&buffer.BufferedDuration.TotalMilliseconds>400){output.Play();playing=true;ready();}
 if(output.Volume!=volume)output.Volume=volume;
 frame=Mp3Frame.LoadFromStream(stream);
 }
 if(!closed)throw new EndOfStreamException("La station a interrompu le flux.");
 }}
 }
}


class RadioInput:Stream{
 readonly Stream input;long position;
 public RadioInput(Stream s){input=s;}
 public override int Read(byte[] b,int off,int len){int n=0;while(n<len){int k=input.Read(b,off+n,len-n);if(k==0)break;n+=k;position+=k;}return n;}
 public override long Position{get{return position;}set{throw new NotSupportedException();}}
 public override bool CanRead{get{return true;}}public override bool CanWrite{get{return false;}}public override bool CanSeek{get{return false;}}
 public override long Length{get{throw new NotSupportedException();}}
 public override void Flush(){}public override long Seek(long o,SeekOrigin s){throw new NotSupportedException();}public override void SetLength(long n){throw new NotSupportedException();}public override void Write(byte[] b,int o,int n){throw new NotSupportedException();}
 protected override void Dispose(bool disposing){if(disposing)input.Dispose();base.Dispose(disposing);}
}
