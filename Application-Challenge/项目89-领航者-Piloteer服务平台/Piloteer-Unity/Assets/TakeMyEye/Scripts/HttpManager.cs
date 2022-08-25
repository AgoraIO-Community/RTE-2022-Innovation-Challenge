using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using LitJson;
using UnityEngine;
public enum NetworkResult {
    SUCCESSED,
    FAILED
}
public class HttpManager : MonoBehaviour {

    static string url_register = "www.ilittleprince.com/Pilot/register.php";
    static string url_login = "www.ilittleprince.com/Pilot/login.php";
    static string url_ask = "www.ilittleprince.com/Pilot/pilot_ask.php";
    static string url_update = "www.ilittleprince.com/Pilot/update_id.php";
    public delegate void RequestHandler (NetworkResult result, string data);
    private RequestHandler m_handler;

    public static void Register (RequestHandler handler, string name, string pwd, string id) {
        GameObject go = new GameObject ("NetHandler");
        HttpManager connectManager = go.AddComponent<HttpManager> ();
        connectManager.m_handler = handler;
        JsonData reg = new JsonData ();
        reg["u_name"] = name;
        reg["u_pwd"] = pwd;
        reg["u_id"] = id;
        string json = JsonMapper.ToJson (reg);
        WWWForm form = new WWWForm ();
        form.AddField ("register", json);
        connectManager.StartCoroutine (connectManager.PostData (url_register, form));
    }
    public static void LoginIn (RequestHandler handler, string name, string pwd) {
        GameObject go = new GameObject ("NetHandler");
        HttpManager connectManager = go.AddComponent<HttpManager> ();
        connectManager.m_handler = handler;
        JsonData reg = new JsonData ();
        reg["u_name"] = name;
        reg["u_pwd"] = pwd;
        string json = JsonMapper.ToJson (reg);
        WWWForm form = new WWWForm ();
        form.AddField ("login", json);
        connectManager.StartCoroutine (connectManager.PostData (url_login, form));
    }
    public static void GetWorkLists (RequestHandler handler, string p_num) {
        GameObject go = new GameObject ("NetHandler");
        HttpManager connectManager = go.AddComponent<HttpManager> ();
        connectManager.m_handler = handler;
        JsonData jsonData = new JsonData ();
        jsonData["p_num"] = p_num;
        string json = JsonMapper.ToJson (jsonData);
        WWWForm form = new WWWForm ();
        form.AddField ("data", json);
        connectManager.StartCoroutine (connectManager.PostData (url_ask, form));
    }
    public static void GenerolWorkIDs (RequestHandler handler, string json) {
        GameObject go = new GameObject ("NetHandler");
        HttpManager connectManager = go.AddComponent<HttpManager> ();
        connectManager.m_handler = handler;
        WWWForm form = new WWWForm ();
        form.AddField ("data", json);
        connectManager.StartCoroutine (connectManager.PostData (url_update, form));
    }
    IEnumerator PostData (params object[] pargarms) {
        string url = pargarms[0] as string;
        WWWForm form = pargarms[1] as WWWForm;
        WWW ww = new WWW (url, form);
        yield return ww;

        if (ww.error != null) {
            Debug.Log (ww.error);
        } else {

            m_handler (NetworkResult.SUCCESSED, ww.text);
        }
        ww.Dispose ();
        Destroy (gameObject);
    }

    static string CharacterToCoding (string character) {
        try {
            string coding1 = "";
            string[] coding = new string[16];
            string a = "";

            for (int i = 0; i < character.Length; i++) {
                byte[] array = System.Text.Encoding.Default.GetBytes (character.Substring (i, 1)); //取出二进制编码内容 

                int b0 = (short) (array[0] - 160);

                int b1 = (short) (array[1] - 160);

                string lowCode = System.Convert.ToString (b0); //取出高字节编码内容（两位16进制） 

                if (lowCode.Length == 1)
                    lowCode = "0" + lowCode;

                string hightCode = System.Convert.ToString (b1); //取出高字节编码内容（两位16进制） 

                if (hightCode.Length == 1)
                    hightCode = "0" + hightCode;

                //      Debug.Log(lowCode + hightCode);//显示区位信息;

                //coding += (lowCode + hightCode);//加入到字符串中,
                int b = (94 * (b0 - 1) + (b1 - 1)) * 32;
                FileStream fs = new FileStream (Application.dataPath + "/hzk16.dat", FileMode.Open, FileAccess.Read);
                byte[] desBytes = new byte[fs.Length];
                fs.Read (desBytes, 0, desBytes.Length);

                //读取字模信息;

                //string c="";
                int x = 0;
                for (int j = b; j < b + 32; x++) {
                    coding[x] = characterLength (Convert.ToString (desBytes[j], 2), 8) + characterLength (Convert.ToString (desBytes[j + 1], 2), 8);
                    coding1 += "" + characterLength (Convert.ToString (+desBytes[j], 16), 2) + "" + characterLength (Convert.ToString (+desBytes[j + 1], 16), 2) + "";
                    j = j + 2;

                }
                for (int y = 0; y < coding.Length; y++) {
                    for (int y1 = 0; y1 < 16; y1++) {
                        if (Convert.ToString (coding[y][y1]) != "1") {
                            a += "○";
                        } else {
                            a += "●";
                        }

                    }
                    //  a += "/r/n";

                }

                //   Debug.Log("coding1"+coding1);
                fs.Close ();

            }
            return coding1;
        } catch (Exception) {
            return "";
        }

    }
    static string characterLength (string character, int l) {

        while (character.Length != l) {
            character = "0" + character;
        };
        return character;

    }

}