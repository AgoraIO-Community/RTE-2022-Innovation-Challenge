using System;
using System.Collections;
using System.Collections.Generic;
using LitJson;
using UnityEngine;
public enum WorkOpeartion {
    Send,
    Accept
}
public delegate void WorkItemCallback (string id, WorkOpeartion operation);
public delegate void WorkItemAsk (Dictionary<string, string> param, bool net);
public class PilotWorkPanel : MonoBehaviour {

    public WorkHead workHead;
    public WorkData workData;
    Dictionary<string, WorkItem> latestAsk;
    Dictionary<string, JsonData> dealAsk;
    // Start is called before the first frame update
    void Start () {
        workHead.Init (Search);
        workData.SetWorkDataCallback (WorkItemCallback);
        List<WorkItem> allItem = SQLiteManager.Instance.FindWorkAll ();
        MapWorksCenter.instance.GeneralMapWorkMarker (allItem);
        workData.UpdatelWork (allItem);
    }
    //此处处理工单点击后的操作，接单还是派给别人
    public void WorkItemCallback (string id, WorkOpeartion operation) {
        Debug.Log (id);
        JsonData jd = new JsonData ();
        jd.Add (dealAsk[id]);
        HttpManager.GenerolWorkIDs (RequestHandlerIDs, jd.ToJson ());
        WorkMarkPanel.instance.AddMarker (latestAsk[id]);
        LeftControl.instance.BtnClicker (LEFTMENU.Work);
    }
    public void Search (Dictionary<string, string> param, bool net) {

        if (!net) {
            string wl_num = param["wl_num"];
            if (wl_num == "0") {
                workData.UpdatelWork (SQLiteManager.Instance.FindWorkAll ());
            } else {
                string wl_eye_num = param["wl_eye_num"];
                string wl_p_num = param["wl_p_num"];
                string wl_status = param["wl_status"];
                workData.UpdatelWork (SQLiteManager.Instance.FindWorks (wl_num, wl_eye_num, wl_p_num, wl_status));
            }

        } else {
            latestAsk = new Dictionary<string, WorkItem> ();
            dealAsk = new Dictionary<string, JsonData> ();
            string wl_p_num = param["wl_p_num"];
            HttpManager.GetWorkLists (RequestHandler, wl_p_num);
        }

    }

    void RequestHandler (NetworkResult result, string data) {
        JsonData workLists = JsonMapper.ToObject (data);
        //
        if (workLists.Count > 0) {
            foreach (JsonData d in workLists) {
                WorkItem item = new WorkItem ();
                string wl = d["wl_num"].ToString ();
                string eye = d["eye_num"].ToString ();
                //处理无WL 情况
                if (wl == "") {
                    wl = GeneralWLNum ();
                    Debug.Log (wl);
                    JsonData j = new JsonData ();
                    j["wl_num"] = wl;
                    j["eye_num"] = eye;
                    j["eye_index"] = d["eye_index"].ToString ();
                    dealAsk.Add (wl, j);
                }
                if (latestAsk.ContainsKey (wl)) {
                    latestAsk[wl].status = int.Parse (d["status"].ToString ());
                } else {
                    item.eyeId = d["eye_num"].ToString ();
                    item.chartRoom = d["chart_room"].ToString ();
                    item.status = int.Parse (d["status"].ToString ());
                    item.time = d["time"].ToString ();
                    item.askPhone = d["eye_phone"].ToString ();
                    item.workId = wl;
                    item.origion = d["lat"].ToString () + "," + d["lnt"].ToString ();
                    item.pilotId = d["p_num"].ToString ();
                    latestAsk.Add (wl, item);
                }

            }
        }
        List<WorkItem> temp = new List<WorkItem> ();
        foreach (string ii in latestAsk.Keys) {
            temp.Add (latestAsk[ii]);
        }
        workData.UpdatelWork (temp);
        //  if (backData != null)
        //      HttpManager.GenerolWorkIDs (RequestHandlerIDs, backData.ToJson ());
    }
    void RequestHandlerIDs (NetworkResult result, string data) {

    }

    private string GeneralWLNum () {
        long i = 1;
        foreach (byte b in Guid.NewGuid ().ToByteArray ()) {
            i *= ((int) b + 1);
        }
        return string.Format ("{0:x}", i - DateTime.Now.Ticks);
    }
    // Update is called once per frame
    void Update () {

    }
}