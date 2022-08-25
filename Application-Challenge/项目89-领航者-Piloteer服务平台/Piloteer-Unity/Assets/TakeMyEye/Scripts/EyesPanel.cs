using System.Collections;
using System.Collections.Generic;
using UnityEngine;
public enum DeviceOpeartion {
    Send,
    Accept
}
public delegate void EyeItemCallback (string id, DeviceOpeartion operation);
public delegate void EyeItemAsk (Dictionary<string, string> param);

public class EyesPanel : MonoBehaviour {
    public EyesData eyesData;
    public EyeHead eyeHead;
    // Start is called before the first frame update
    void Start () {
        eyeHead.Init (EyeAsk);
        eyesData.SetWorkDataCallback (EyeItemCallback);
        eyesData.UpdatelWork (SQLiteManager.Instance.FindEyesAll ());
    }
    public void EyeAsk (Dictionary<string, string> param) {

        string eye_num = param["eye_num"];
        if (eye_num != "0") {
            string u_name = param["u_name"];
            string u_phone = param["u_phone"];
            eyesData.UpdatelWork (SQLiteManager.Instance.FindEyes (eye_num, u_name, u_phone));
        } else {
            eyesData.UpdatelWork (SQLiteManager.Instance.FindEyesAll ());
        }
    }
    //处理每个设备条目被点击
    void EyeItemCallback (string id, DeviceOpeartion operation) {

    }
    // Update is called once per frame
    void Update () {

    }
}