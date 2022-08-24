using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class WorkItem {
    public string workId;
    public string eyeId;
    public string askPhone;
    public string pilotId;
    public string pilotPhone;
    public string origion;
    public string destination;
    public string chartRoom;
    public string time;
    public int status;
    public WorkItem () { }
    public WorkItem (string workId, string eyeId, string askPhone, string pilotId, string pilotPhone,
        string origion, string destination, int status, string chartRoom, string time) {
        this.workId = workId;
        this.eyeId = eyeId;
        this.askPhone = askPhone;
        this.pilotId = pilotId;
        this.pilotPhone = pilotPhone;
        this.origion = origion;
        this.destination = destination;
        this.status = status;
        this.chartRoom = chartRoom;
        this.time = time;
    }
}

public class ServiceItem : MonoBehaviour {
    public Text tWorkId;
    public Text tAskId;
    public Text tAskPhone;
    public Text tPilotId;
    public Text tPilotPhone;
    public Text tOrigion;
    public Text tDestination;
    public Text tStatus;
    public Button acceptWork;
    public Button sendWork;
    WorkItem selfItem;
    EyeItem eye;
    PilotItem user;
    WorkItemCallback workItemCallback;
    // Start is called before the first frame update
    void Start () {
        acceptWork.onClick.AddListener (AcceptWork);
        sendWork.onClick.AddListener (SendWork);
        eye = SQLiteManager.Instance.FindEyes (selfItem.eyeId);
        user = SQLiteManager.Instance.FindPilotDetail (selfItem.pilotId);

        UpdateData ();
    }
    void UpdateData () {
        tWorkId.text = selfItem.workId;
        tAskId.text = eye.userName;
        tPilotId.text = user.pilotName;
        tAskPhone.text = eye.userPhone;
        tPilotPhone.text = user.pilotPhone;
        tOrigion.text = selfItem.origion;
        tDestination.text = selfItem.destination;
        tStatus.text = selfItem.status + "";
    }
    public void InitServiceItem (WorkItem item, WorkItemCallback workItemCallback) {
        selfItem = item;
        this.workItemCallback = workItemCallback;
    }
    public void UpdateServiceItem (WorkItem item) {
        selfItem = item;
        UpdateData ();
    }
    public void SendWork () {
        workItemCallback (selfItem.workId, WorkOpeartion.Send);
    }
    public void AcceptWork () {
        workItemCallback (selfItem.workId, WorkOpeartion.Accept);
    }
}