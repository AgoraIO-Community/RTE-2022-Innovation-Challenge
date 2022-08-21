using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;
public class MarkItem {
    public string workId;
    public string statTime;
    public string endTime;
    public string netInfo;
    public string netDelay;
    public string videoUrl;
    public double startLon;
    public double startLat;
    public MarkItem () { }
    public MarkItem (string workId, string statTime, string endTime, string netInfo,
        string netDelay, string videoUrl, double startLon, double startLat) {
        this.workId = workId;
        this.statTime = statTime;
        this.endTime = endTime;
        this.netInfo = netInfo;
        this.netDelay = netDelay;
        this.videoUrl = videoUrl;
        this.startLon = startLon;
        this.startLat = startLat;
    }
}
public class UserItem {
    public string userId;
    public string eyeId;
    public string userName;
    public string userPhone;
    public string serviceTimes;
    public UserItem () { }
    public UserItem (string userId, string eyeId, string userName, string userPhone, string serviceTimes) {
        this.userId = userId;
        this.eyeId = eyeId;
        this.userName = userName;
        this.userPhone = userPhone;
        this.serviceTimes = serviceTimes;
    }

}
public class PilotItem {
    public string pilotId;
    public string pilotName;
    public string pilotPhone;
    public string pilotState;
    public PilotItem () { }
    public PilotItem (string pilotId, string pilotName, string pilotPhone, string pilotState) {
        this.pilotId = pilotId;
        this.pilotName = pilotName;
        this.pilotPhone = pilotPhone;
        this.pilotState = pilotState;
    }

}
public class WorkMarkItem : MonoBehaviour, IPointerClickHandler {
    WorkItem workItem;
    MarkItem markItem;
    Image selfSprite;
    public Sprite[] allState;
    MapWorkDetailCallback callback;
    Vector2D dd = new Vector2D (121.523448, 31.312521);
    Transform selfTrans;
    bool setPos = false;
    // Start is called before the first frame update
    void Start () {
        selfSprite = GetComponent<Image> ();
        selfTrans = GetComponent<Transform> ();
        selfSprite.sprite = allState[workItem.status];
        markItem = SQLiteManager.Instance.FindWorkDetail (workItem.workId);
        if (!setPos)
            dd = new Vector2D (markItem.startLon, markItem.startLat);
        else {
            string[] ww = workItem.origion.Split (",");
            dd = new Vector2D (double.Parse (ww[1]), double.Parse (ww[0]));
        }
        Debug.Log (dd);
    }
    public void SetPos (bool v) {
        setPos = v;
    }
    public void InitWorkMark (WorkItem w, MapWorkDetailCallback m) {
        workItem = w;
        callback = m;
    }
    // Update is called once per frame
    void Update () {
        selfTrans.position = MapWorksCenter.instance.MarkLoction (dd);
    }
    //点击回调，展示详细内容
    public void OnPointerClick (PointerEventData eventData) {
        Debug.Log ("ss" + workItem.chartRoom);
        callback.Invoke (markItem, workItem);
    }
}