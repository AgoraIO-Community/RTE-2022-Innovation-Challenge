using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Text;
using System;
using UnityEngine;
using UnityEngine.UI;
public delegate void MegFlowResult(Texture2D tex,bool ok);
public class MegFlowRequest : MonoBehaviour
{
    string baseUrl = "http://192.168.213.132:8081/analyze/cat";
    public Texture2D cat;
 //   public RawImage rawImg;
    MegFlowResult flowResult;
    Texture2D resTex;
    HttpWebRequest request;// 声明一个HttpWebRequest请求
    Stream reqstream;//获取一个请求流
    HttpWebResponse response; //接收返回来的数据
    Stream streamReceive;//获取响应流

    string json;
    string JsonPath;
    private void Awake()
    {
       
   //     rawImg.texture = resTex;
     //   SendDataToService();

    }
    public void Init(Texture2D src, MegFlowResult flow)
    {

        cat = src;
        flowResult = flow;
    }
     void Start()
    {
        resTex = new Texture2D(cat.width, cat.height);
        bool ok=GetResponseData(cat.EncodeToJPG(), baseUrl);
        flowResult(resTex, ok);
    }
    //发送数据到服务器
    public void SendDataToService()
    {
    //    string recive = GetResponseData(cat.EncodeToJPG(), baseUrl);
   //     Debug.LogError(recive.ToString());

    }
    public bool GetResponseData(byte[] jpgData, string url)
    {
        try
        {                                              /* HttpWebRequest*/
            request = (HttpWebRequest)WebRequest.Create(url);// 声明一个HttpWebRequest请求
            request.Method = "POST";///设置请求模式
            request.KeepAlive = true;
            request.ContentLength = jpgData.Length; //设置请求内容大小，当然就设置成我们的参数字节数据大小。
            request.ContentType = "image/*";//设置ContntType("application/json;charset=UTF-8") ，这句很重要，否则无法传递参数ContntType(""text/xml")
            reqstream = request.GetRequestStream();//  //发送post的请求,获取请求流
            reqstream.Write(jpgData, 0, jpgData.Length);// 将参数字节数组写入到请求流里
            reqstream.Close();
            request.Timeout = 90000; //设置连接超时时间
            request.Headers.Set("paramaters", "no-cache");//paramaters就是服务接口函数的参数名

            //接收返回来的数据
            /*HttpWebResponse*/
            response = (HttpWebResponse)request.GetResponse(); //执行请求，获取响应对象
                                                               /* Stream*/
            streamReceive = response.GetResponseStream();//获取响应流
            MemoryStream memStream = new MemoryStream();

            byte[] respBuffer = new byte[1024];

                int bytesRead = streamReceive.Read(respBuffer, 0, respBuffer.Length);
                while (bytesRead > 0)
                {
                    memStream.Write(respBuffer, 0, bytesRead);
                    bytesRead = streamReceive.Read(respBuffer, 0, respBuffer.Length);
                }
                byte[] bb = memStream.ToArray();
                resTex.LoadImage(bb);
 
            streamReceive.Close();
            return true;
        }

        catch (WebException e)
        {
            // return string.Empty;
            WebResponse wr = e.Response;
            using (StreamReader reader = new StreamReader(wr.GetResponseStream(), System.Text.Encoding.UTF8)){
                string value = reader.ReadToEnd();
                return false;
            }
        }
        finally
        {
            if (reqstream != null)
            {
                reqstream.Close();
            }
            if (streamReceive != null)
            {
                streamReceive.Close();
            }
            if (response != null)
            {
                response.Close();
            }
            //很多时候释放了Stream和Response还不够，客户端的Request还是在保持着，需要等垃圾回收器来回收，所以一般很容易阻塞，导致请求发送不出去。加上这个就是让HttpWebRequest实例在不需要的时候及时释放资源。这样可以重复使用而不会阻塞。
            if (request != null)
            {
                request.Abort();
            }
        }

    }
}