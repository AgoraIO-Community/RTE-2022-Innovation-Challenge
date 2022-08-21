using System.Collections;
using System.Collections.Generic;
using LitJson;
using UnityEngine;
using UnityEngine.UI;
public class WorkHead : MonoBehaviour {
    public InputField iWorkId;
    public InputField iAsk;
    public InputField iPilot;
    public Dropdown iStatus;
    WorkItemAsk itemAsk;

    // Start is called before the first frame update
    void Start () {

    }
    public void Init (WorkItemAsk ask) {
        itemAsk = ask;
    }
    public void Search () {
        Dictionary<string, string> ask = new Dictionary<string, string> ();
        if (iWorkId.text != "" || iAsk.text != "" || iPilot.text != "") {
            ask["wl_num"] = iWorkId.text;
            ask["wl_eye_num"] = iAsk.text;
            ask["wl_p_num"] = iPilot.text;
            ask["wl_status"] = iStatus.value + "";
            //      itemAsk (ask, false);
        } else {
            ask["wl_p_num"] = "0";
        }
        itemAsk (ask, false);
    }
    public void SearchNet () {
        Dictionary<string, string> ask = new Dictionary<string, string> ();

        ask["wl_p_num"] = "0";
        itemAsk (ask, true);
    }
    // Update is called once per frame
    void Update () {

    }
}