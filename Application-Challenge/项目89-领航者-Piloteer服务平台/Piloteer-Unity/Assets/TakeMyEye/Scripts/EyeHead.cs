using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class EyeHead : MonoBehaviour {
    public InputField iEyeId;
    public InputField iUser;
    public InputField iPhone;
    EyeItemAsk itemAsk;
    // Start is called before the first frame update
    void Start () {

    }
    public void Init (EyeItemAsk ask) {
        itemAsk = ask;
    }
    public void Search () {
        Dictionary<string, string> ask = new Dictionary<string, string> ();
        if (iEyeId.text != "" || iUser.text != "" || iPhone.text != "") {
            ask["eye_num"] = iEyeId.text;
            ask["u_name"] = iUser.text;
            ask["u_phone"] = iPhone.text;

        } else {
            ask["eye_num"] = "0";
        }
        itemAsk.Invoke (ask);
    }
    // Update is called once per frame
    void Update () {

    }
}