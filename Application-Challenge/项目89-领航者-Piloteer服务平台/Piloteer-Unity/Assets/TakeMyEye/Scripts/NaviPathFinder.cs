using System.Collections;
using System.Collections.Generic;
using LitJson;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.UI;
public class NaviPathFinder : MonoBehaviour {
    public LineRenderer lineRender;
    public InputField startPos;
    public InputField endPos;
    public Button button;
    string ley = "1mDWcMWdbseoVTxGiGtKkjZosOLuN8je";
    string base_url = "https://api.map.baidu.com/directionlite/v1/walking?";

    //百度请求时候，按照纬经度构造
    //按行政区域
    string origin_lt = "31.311095,121.518651"; //GET请求121.518651,31.311095//创智天地一起
    string outStr = "&output=json&ak=";
    string destination_lt = "31.303937,121.518094"; //121.518094,31.303937新金博大啥
    // Start is called before the first frame update
    void Start () {
        button.onClick.AddListener (PathFinder);
        // StartCoroutine (GetRequest (base_url + "origin=" + origin_lt + "&destination=" + destination_lt + outStr + ley));
    }
    public void Pilot (string srclt, string deslt, float rad) {
        origin_lt = srclt;
        destination_lt = deslt;
    }
    Vector2D pos1;
    Vector2D pos2;
    //调用路径函数
    public void PathFinder () {
        if (startPos.text != "" && endPos.text != "") {
            GameObject gg1 = new GameObject ();
            GameObject gg2 = new GameObject ();
            gg1.AddComponent<PositionFinder> ().SearchPosition (startPos.text, PosBack1);
            gg2.AddComponent<PositionFinder> ().SearchPosition (endPos.text, PosBack2);
        }
    }
    //查找位置返回
    void PosBack1 (double lat, double lng) {
        pos1 = new Vector2D (lng, lat);

    }
    //查找位置返回
    void PosBack2 (double lat, double lng) {
        pos2 = new Vector2D (lng, lat);
        StartCoroutine (GetRequest (base_url + "origin=" + pos1.latitude + "," + pos1.longitude + "&destination=" + pos2.latitude + "," + pos2.longitude + outStr + ley));
    }
    void Update () { } public void drawLine (List<Vector3> points) {
        lineRender.startWidth = 0.05f;
        lineRender.endWidth = 0.05f;
        lineRender.positionCount = points.Count;
        lineRender.SetPositions (points.ToArray ());
    }
    IEnumerator GetRequest (string uri) {
        NaviPathResponse httpJson = null;
        using (UnityWebRequest webRequest = UnityWebRequest.Get (uri)) {
            // Request and wait for the desired page.
            yield return webRequest.SendWebRequest ();

            string[] pages = uri.Split ('/');
            int page = pages.Length - 1;

            switch (webRequest.result) {
                case UnityWebRequest.Result.ConnectionError:
                case UnityWebRequest.Result.DataProcessingError:
                    Debug.LogError (pages[page] + ": Error: " + webRequest.error);
                    break;
                case UnityWebRequest.Result.ProtocolError:
                    Debug.LogError (pages[page] + ": HTTP Error: " + webRequest.error);
                    break;
                case UnityWebRequest.Result.Success:
                    httpJson = JsonMapper.ToObject<NaviPathResponse> (webRequest.downloadHandler.text);
                    break;
            }
            webRequest.Dispose ();
        }
        List<Vector3> naviPath = new List<Vector3> ();
        for (int i = 0; i < httpJson.result.routes[0].steps.Count; i++) {

            string[] alllt = httpJson.result.routes[0].steps[i].path.Split (";");
            for (int k = 0; k < alllt.Length; k++) {
                string[] latlat = alllt[k].Split (",");
                Vector3 tem = MapWorksCenter.instance.MarkLoction3D (new Vector2D (double.Parse (latlat[0]), double.Parse (latlat[1])));
                naviPath.Add (tem);
            }

        }
        drawLine (naviPath);
        Debug.Log ("OK" + httpJson.result.routes[0].distance);

    }
}