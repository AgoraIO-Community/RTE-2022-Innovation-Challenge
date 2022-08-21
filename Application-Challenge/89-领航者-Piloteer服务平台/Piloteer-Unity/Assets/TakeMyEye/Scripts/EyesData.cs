using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class EyesData : MonoBehaviour {
    public GameObject workPrefabs;
    public RectTransform workParent;
    public List<GameObject> workList;
    EyeItemCallback callback;
    List<EyeItem> eyesItems;
    // Start is called before the first frame update
    void Start () {
        //  eyesItems = new List<EyeItem> ();
        //  GeneralWork (eyesItems);
    }
    void GeneralWork (List<EyeItem> eyesItems) {
        if (workList.Count > 0) {
            for (int k = 0; k < workList.Count; k++) {
                GameObject gg = workList[k];
                Destroy (gg);
            }
        }
        for (int i = 0; i < eyesItems.Count; i++) {
            GameObject item = Instantiate (workPrefabs);
            RectTransform tectItem = item.GetComponent<RectTransform> ();
            tectItem.SetParent (workParent);
            tectItem.offsetMax = Vector2.zero;
            tectItem.offsetMin = Vector2.zero;
            item.GetComponent<DeviceEyeItem> ().InitItem (eyesItems[i], WorkItemCallbackOperation);
            item.SetActive (true);
            workList.Add (item);
        }
    }
    public void UpdatelWork (List<EyeItem> eyesItems) {
        this.eyesItems = eyesItems;
        GeneralWork (eyesItems);
    }
    public void SetWorkDataCallback (EyeItemCallback call) {
        callback = call;
    }
    public void WorkItemCallbackOperation (string id, DeviceOpeartion operation) {
        callback.Invoke (id, operation);
    }
    // Update is called once per frame
    void Update () {

    }
}