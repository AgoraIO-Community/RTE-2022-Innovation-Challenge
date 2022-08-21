using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;
using LitJson;
using System.Net.Http;
using System.IO;
using System.Net.Http.Headers;
using UnityEngine.UI;
public class MegaTest : MonoBehaviour {
    string baseUrl = "http://192.168.213.132:8081/analyze/aa";
   public string baseUrl64="";
    public Texture2D cat;
    public RawImage img;
        // Start is called before the first frame update
        void Start()
    {
        GameObject go = new GameObject();
        go.AddComponent<MegFlowRequest>();
        go.GetComponent<MegFlowRequest>().Init(cat,Result);

     //   JsonData json = new JsonData();
     //   json["aa"] = baseUrl64;

        /*  StartCoroutine(Upload(baseUrl, json.ToJson(),
      // e.g. as lambda expression
      result =>
      {
          Debug.Log(result);
      }
  ));*/
        //  Request();

     //   StartCoroutine(Test());
    }
    void Result(Texture2D tex,bool ok)
    {
        img.texture = tex;
    }
    IEnumerator Test()
    {
        WWWForm form = new WWWForm();
        form.AddBinaryData("file", cat.EncodeToJPG());
        //...
        UnityWebRequest request = UnityWebRequest.Post(baseUrl, form);
        request.timeout = 1000;
        request.SetRequestHeader("Content-Type", "image/*");

        yield return request.SendWebRequest();

        if (request.isNetworkError)
        {
            Debug.Log("Error While Sending: " + request.error);
        }
        else
        {
            Debug.Log("Received: " + request.downloadHandler.text);
        }
    }

    public void Request()
    {
        try
        {
            WWWForm form = new WWWForm();
            form.AddBinaryData("cat", cat.EncodeToJPG(), "cc.jpg", "image/*");
            var request = UnityWebRequest.Post(baseUrl, form);
            request.SetRequestHeader("Content-Type", "image/*");
        //    request.SetRequestHeader("Connection", "keep-alive");
            //    request.SetRequestHeader("appKey", "ABC");
            StartCoroutine(onResponse(request));
        }
        catch (Exception e) { Debug.Log("ERROR : " + e.Message); }
    }
    private IEnumerator onResponse(UnityWebRequest req)
    {

        yield return req.SendWebRequest();
        if (req.isNetworkError)
            Debug.Log("Network error has occured: " + req.GetResponseHeader(""));
        else
            Debug.Log("Success " + req.downloadHandler.text);
        byte[] results = req.downloadHandler.data;
        Debug.Log("Second Success"+ results.Length);
        // Some code after success

    }
    void sss(string dd)
    {

    }
    IEnumerator Upload( Action<string> callback)
{
        WWWForm form = new WWWForm();
        form.AddBinaryData("", cat.EncodeToJPG(),"cc.jpg", "image/*");
        // Upload to a cgi script
        var w = UnityWebRequest.Post(baseUrl, form);
        w.SetRequestHeader("Content-Type", "image/*");
        yield return w.SendWebRequest();
        if (w.isNetworkError || w.isHttpError)
        {
            Debug.Log(w.error+ w.GetResponseHeader(""));
        }
        else
        {
            Debug.Log("Success " + w.downloadHandler.text);
            callback?.Invoke(w.GetResponseHeader("Content-Length"));
        }
       
    }
    // Update is called once per frame
    void Update () {

    }
}