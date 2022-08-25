using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class EyeItem {
    public string eyeId;
    public string userName;
    public string userPhone;
    public string sfzId;
    public string address;
    public string register;
    public string updateTime;
    public string askTimes;
    public EyeItem () { }
    public EyeItem (string eyeId, string userName, string userPhone, string sfzId, string address, string register, string updateTime, string askTimes) {
        this.eyeId = eyeId;
        this.userName = userName;
        this.userPhone = userPhone;
        this.sfzId = sfzId;
        this.address = address;
        this.register = register;
        this.updateTime = updateTime;
        this.askTimes = askTimes;
    }

}

public class DeviceEyeItem : MonoBehaviour {
    public Text tEyeId;
    public Text tUserName;
    public Text tUserPhone;
    public Text tSfzId;
    public Text tAddress;
    public Text tRegister;
    public Text tUpdateTime;
    public Text tAskTimes;
    public Button acceptWork;
    public Button sendWork;
    EyeItem selfItem;
    EyeItemCallback workItemCallback;
    // Start is called before the first frame update
    void Start () {
        acceptWork.onClick.AddListener (AcceptWork);
        sendWork.onClick.AddListener (SendWork);
        UpdateData ();
    }
    void UpdateData () {
        tEyeId.text = selfItem.eyeId;
        tUserName.text = selfItem.userName;
        tUserPhone.text = selfItem.userPhone;
        tSfzId.text = selfItem.sfzId;
        tAddress.text = selfItem.address;
        tRegister.text = selfItem.register;
        tUpdateTime.text = selfItem.updateTime;
        tAskTimes.text = selfItem.askTimes;
    }
    public void InitItem (EyeItem item, EyeItemCallback workItemCallback) {
        selfItem = item;
        this.workItemCallback = workItemCallback;
    }
    public void UpdateServiceItem (EyeItem item) {
        selfItem = item;
        UpdateData ();
    }
    public void SendWork () {
        workItemCallback (selfItem.eyeId, DeviceOpeartion.Send);
    }
    public void AcceptWork () {
        workItemCallback (selfItem.eyeId, DeviceOpeartion.Accept);
    }
}