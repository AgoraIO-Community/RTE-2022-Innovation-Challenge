using System.Collections;
using System.Collections.Generic;
using System.Web;
using LitJson;
using UnityEngine;
using UnityEngine.Events;
using UnityEngine.Networking;
public delegate void PositionFinderBack (double lat, double lng);
public class PositionFinder : MonoBehaviour {
    string ley = "1mDWcMWdbseoVTxGiGtKkjZosOLuN8je";
    string base_url = "https://api.map.baidu.com/place/v2/search?query=";
    string outStr = "&output=json&ak=";
    string location = "39.915,116.404";
    string region = "上海";
    float radius = 2000f;
    string target = "上海银行";
    PositionFinderBack positionFinderBack;
    /*{
        "status": 0,
        "message": "ok",
        "result_type": "poi_type",
        "results": [{
                "name": "西交民巷近代银行建筑群",
                "location": {
                    "lat": 39.908018,
                    "lng": 116.398341
                },
                "address": "北京市西城区西交民巷56号",
                "province": "北京市",
                "city": "北京市",
                "area": "西城区",
                "street_id": "4eea5ab87122e5673913fd73",
                "detail": 1,
                "uid": "4eea5ab87122e5673913fd73"
            },
*/
    void Start () {
        //  StartCoroutine (GetText (base_url + target + "&location=" + location + "&radius" + radius + outStr + ley, GetBack));
        StartCoroutine (GetText (base_url + target + "&region=" + "上海" + outStr + ley, GetBack));

    }
    void GetBack (string json) {
        PositionResponse httpJson = JsonMapper.ToObject<PositionResponse> (json);
        Debug.Log ("OK" + httpJson.results[0].name + "||" + httpJson.results[0].location.lat);
        positionFinderBack.Invoke (httpJson.results[0].location.lat, httpJson.results[0].location.lng);
        Destroy (gameObject);
    }
    public void SearchPosition (string t, string lnt, float rad) {
        location = lnt;
        target = t;
        radius = rad;
    }
    public void SearchPosition (string t, PositionFinderBack positionFinderBack, string r = "上海") {
        target = t;
        this.positionFinderBack = positionFinderBack;
    }

    IEnumerator GetText (string path, UnityAction<string> onGetJson) {
        using (UnityWebRequest webRequest = UnityWebRequest.Get (path)) {
            yield return webRequest.SendWebRequest ();

            if (webRequest.result == UnityWebRequest.Result.Success) {
                string json = webRequest.downloadHandler.text;
                onGetJson?.Invoke (json);
            } else {
                Debug.Log ("error = " + webRequest.error + "\n Load Path = " + path);
                onGetJson?.Invoke (null);
            }
        }
    }
    IEnumerator GetTexture2D (string path, UnityAction<Texture2D> onGetTexture2D) {
        using (UnityWebRequest webRequest = UnityWebRequestTexture.GetTexture (path)) {
            yield return webRequest.SendWebRequest ();
            if (webRequest.result == UnityWebRequest.Result.Success) {
                Texture2D tex2d = DownloadHandlerTexture.GetContent (webRequest);
                onGetTexture2D?.Invoke (tex2d);
            } else {
                Debug.Log ("error = " + webRequest.error + "\n Load Path = " + path);
                onGetTexture2D?.Invoke (null);
            }
        }
    }
    IEnumerator GetAudio (string path, AudioType type, UnityAction<AudioClip> onGetAudio) {
        using (UnityWebRequest webRequest = UnityWebRequestMultimedia.GetAudioClip (path, type)) {
            yield return webRequest.SendWebRequest ();

            if (webRequest.result == UnityWebRequest.Result.Success) {
                AudioClip clip = DownloadHandlerAudioClip.GetContent (webRequest);
                onGetAudio?.Invoke (clip);
            } else {
                Debug.Log ("error = " + webRequest.error + "\n Load Path = " + path);
                onGetAudio?.Invoke (null);
            }
        }
    }
}