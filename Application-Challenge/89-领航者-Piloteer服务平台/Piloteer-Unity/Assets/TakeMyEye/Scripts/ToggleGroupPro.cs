using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class ToggleGroupPro : MonoBehaviour {
    public int OptionsNumber = 0;

    private List<Toggle> m_Toggles = new List<Toggle> ();
    public List<Toggle> Toggles {
        get {
            for (int i = 0; i < transform.childCount; i++) {
                GameObject go = transform.GetChild (i).gameObject;
                if (go.activeSelf) {
                    Toggle t = go.GetComponent<Toggle> ();
                    if (t == null) continue;
                    if (!m_Toggles.Contains (t)) {
                        m_Toggles.Add (t);
                    }
                }
            }
            return m_Toggles;
        }
    }

    private List<Toggle> m_ActiveToggles = new List<Toggle> ();
    public List<Toggle> ActiveToggles {
        get {
            return Toggles.GetNumberofBoolean (true);
        }
    }

    private void Awake () {
        OptionsNumber = OptionsNumber < Toggles.Count ? OptionsNumber : Toggles.Count;
    }
    // Start is called before the first frame update
    void Start () {
        for (int i = 0; i < Toggles.Count; i++) {
            Toggles[i].onValueChanged.AddListener (OnTogglesValueChanged);
        }
    }

    public void OnTogglesValueChanged (bool value) {
        for (int i = 0; i < Toggles.Count; i++) {
            Toggles[i].interactable = (ActiveToggles.Count >= OptionsNumber) && !Toggles[i].isOn ? false : true;
        }
    }

    // Update is called once per frame
    void Update () {

    }
}
public static class Develop {
    public static List<Toggle> GetNumberofBoolean (this List<Toggle> toggles, bool value) {
        List<Toggle> ts = new List<Toggle> ();
        for (int i = 0; i < toggles.Count; i++) {
            if (toggles[i].isOn == value) {
                if (!ts.Contains (toggles[i])) {
                    ts.Add (toggles[i]);
                }
            }
        }
        return ts;
    }
}