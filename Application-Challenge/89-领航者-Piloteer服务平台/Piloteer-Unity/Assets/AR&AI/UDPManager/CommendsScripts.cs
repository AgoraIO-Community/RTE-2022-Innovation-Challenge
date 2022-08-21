using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using LitJson;
using System.IO;
using System;

public class CommendItem
{
   public string name;
    public string cmd;
}
public delegate void ItemClicked(CommendItem item);
public class CommendsScripts : MonoBehaviour
{
    public GameObject itemPre;
    public Transform rectParent;
   public UDPClient udpClient;
    JsonData jsonD;
    // Start is called before the first frame update
    void Start()
    {
        string data = File.ReadAllText(Application.dataPath + "/AR&AI/Commends.txt");
       // Debug.Log(data);
     //    jsonD = JsonMapper.ToObject(data);
        //  string ss = jsonD["data"].ToString();
        //  jsonD["data"] = ss.Replace(" ","");
        DecodeSrcData(data);
    }
    void DecodeSrcData(string data)
    {
        jsonD = JsonMapper.ToObject(data);
        string position = jsonD["position"].ToString();
        string device = jsonD["device"].ToString();
        for (int i=0;i< jsonD["details"].Count; i++)
        {
            GameObject temp = Instantiate(itemPre);
            temp.transform.SetParent(rectParent);
            CommendItem item = new CommendItem();
            item.name = jsonD["details"][i][0].ToString().Replace("$", position+ device) ;
            item.cmd = jsonD["details"][i][1].ToString();
            temp.GetComponent<CmdItem>().InitCMD(item, OnClickedCallback);
        }

    }
    void OnClickedCallback(CommendItem item)
    {
        JsonData jsonData = new JsonData();
        jsonData["func"] = item.name;
          string ss = item.cmd;
        jsonData["data"] = ss.Replace(" ","");
        Debug.Log(jsonData.ToJson());
        udpClient.SendValue(jsonData.ToJson());
    }
    // Update is called once per frame
    void Update()
    {
        
    }
}
