using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;
public enum IconType {
    TypeVideo,
    TypeAudio,
    TypeHangup,
    TypePlayaudio,
    TypeMessage,
    TypeClose
}
public delegate void IconEvent (IconType type, bool enable);
public class IconCtrl : MonoBehaviour, IPointerClickHandler {

    public IconType type;
    bool enable = false;
    public Image child;
    IconEvent iEvent;
    public void OnPointerClick (PointerEventData eventData) {
        enable = !enable;
        child.enabled = enable;
        iEvent (type, enable);

    }
    public void SetListener (IconEvent e) {
        iEvent = e;
    }
    // Start is called before the first frame update
    void Start () {
        //   child = GetComponentInChildren<Image> ();
    }

    // Update is called once per frame
    void Update () {

    }
}