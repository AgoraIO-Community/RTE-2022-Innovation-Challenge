using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.EventSystems;
public enum LEFTMENU {
    Device,
    Work,
    Pilot,
    Data
}
public delegate void ChileButtonClicked (LEFTMENU menu);
public class LeftControl : MonoBehaviour, IPointerEnterHandler, IPointerExitHandler {
    public static LeftControl instance;
    public Animator leftAnim;
    bool show = true;
    LEFTMENU currentMeun;
    public LeftBtnClick[] lefts;
    public GameObject[] panels;
    void Awake () {
        instance = this;
    }
    public void OnPointerEnter (PointerEventData eventData) {
        show = true;
    }

    public void OnPointerExit (PointerEventData eventData) {

        show = false;

    }
    public void BtnClicker (LEFTMENU menu) {
        if (currentMeun == menu)
            return;
        currentMeun = menu;
        for (int i = 0; i < lefts.Length; i++) {
            if ((int) menu != lefts[i].index) {
                lefts[i].SetClickState (false);
                panels[i].SetActive (false);
            } else {
                lefts[i].SetClickState (true);
                panels[i].SetActive (true);
            }
        }
    }
    // Start is called before the first frame update
    void Start () {
        BtnClicker (LEFTMENU.Work);
        for (int i = 0; i < lefts.Length; i++) {
            lefts[i].Init (BtnClicker);
        }
    }

    // Update is called once per frame
    void Update () {

        if (show) {
            leftAnim.Play ("left_out");

        } else {
            leftAnim.Play ("left_in");

        }
    }
}