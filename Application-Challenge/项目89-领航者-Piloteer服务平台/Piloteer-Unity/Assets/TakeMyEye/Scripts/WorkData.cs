using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class WorkData : MonoBehaviour {
    public GameObject workPrefabs;
    public RectTransform workParent;
    public List<GameObject> workList;
    WorkItemCallback callback;
    List<WorkItem> workItems = new List<WorkItem> ();
    // Start is called before the first frame update
    void Start () {
        GeneralWork (workItems);
    }
    void GeneralWork (List<WorkItem> workItems) {
        if (workList.Count > 0) {
            for (int k = 0; k < workList.Count; k++) {
                GameObject gg = workList[k];
                Destroy (gg);
            }
        }
        for (int i = 0; i < workItems.Count; i++) {
            GameObject item = Instantiate (workPrefabs);
            RectTransform tectItem = item.GetComponent<RectTransform> ();
            tectItem.SetParent (workParent);
            tectItem.offsetMax = Vector2.zero;
            tectItem.offsetMin = Vector2.zero;
            item.GetComponent<ServiceItem> ().InitServiceItem (workItems[i], WorkItemCallbackOperation);
            item.SetActive (true);
            workList.Add (item);
        }
    }
    public void UpdatelWork (List<WorkItem> workItems) {
        this.workItems = workItems;
        GeneralWork (workItems);
    }
    public void SetWorkDataCallback (WorkItemCallback call) {
        callback = call;
    }
    public void WorkItemCallbackOperation (string id, WorkOpeartion operation) {
        callback (id, operation);
    }
    // Update is called once per frame
    void Update () {

    }
}