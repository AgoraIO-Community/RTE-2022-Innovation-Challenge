using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class WorkMarkPanel : MonoBehaviour {
    public static WorkMarkPanel instance;
    public MapWorkDetail WorkDetail;
    public PilotVideoItem naviDetail;
    public GameObject mMarkPrefabs;
    public RectTransform mWorkParent;
    public List<GameObject> mMarkList;
    void Awake () {
        instance = this;
    }
    // Start is called before the first frame update
    void Start () {

    }
    public void GeneralMapWorkMarker (List<WorkItem> workItems) {
        if (mMarkList.Count > 0) {
            for (int k = 0; k < mMarkList.Count; k++) {
                GameObject gg = mMarkList[k];
                Destroy (gg);
            }
        }
        for (int i = 0; i < workItems.Count; i++) {
            //            Debug.Log (workItems[i].workId);
            //   Debug.Log (workItems[i].origion);
            GameObject item = Instantiate (mMarkPrefabs);
            item.GetComponent<WorkMarkItem> ().InitWorkMark (workItems[i], ShoWorkPanel);
            RectTransform tectItem = item.GetComponent<RectTransform> ();
            tectItem.SetParent (mWorkParent);
            item.SetActive (true);
            mMarkList.Add (item);
        }
    }
    public void AddMarker (WorkItem work) {
        GameObject item = Instantiate (mMarkPrefabs);
        item.GetComponent<WorkMarkItem> ().InitWorkMark (work, ShoWorkPanel);
        item.GetComponent<WorkMarkItem> ().SetPos (true);
        RectTransform tectItem = item.GetComponent<RectTransform> ();
        tectItem.SetParent (mWorkParent);
        item.SetActive (true);
        mMarkList.Add (item);
    }
    void ShoWorkPanel (MarkItem markItem, WorkItem workItem) {
        switch (workItem.status) {
            case 0:
                WorkDetail.InitItem (markItem, workItem);
                break;
            case 1:
                naviDetail.InitItem (markItem, workItem);
                break;
        }

    }
    public void ShoWorkDetail (WorkItem work) {
        WorkDetail.gameObject.SetActive (true);

    }
    public void ShowNaviDetail (WorkItem work) {
        //naviDetail.SetActive (true);
    }
    // Update is called once per frame
    void Update () {

    }
}